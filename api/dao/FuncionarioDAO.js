const bcrypt = require("bcrypt");
const Funcionario = require("../model/Funcionario");
const Cargo = require("../model/Cargo");
const MysqlDatabase = require("../database/MysqlDatabase");

/**
 * Classe responsável por gerenciar operações CRUD e autenticação
 * para a entidade Funcionario no banco de dados.
 * 
 * Esta classe utiliza a injeção de dependência da classe MysqlDatabase,
 * garantindo flexibilidade, reutilização de código e facilitando testes unitários.
 */
module.exports = class FuncionarioDAO {
    #database;

    /**
     * Construtor da classe FuncionarioDAO.
     * @param {MysqlDatabase} databaseInstance - Instância de MysqlDatabase para acesso ao banco.
     */
    constructor(databaseInstance) {
        console.log("⬆️  FuncionarioDAO.constructor()");
        this.#database = databaseInstance;
    }

    /**
     * Cria um novo funcionário no banco de dados.
     * Antes de salvar, a senha é criptografada com bcrypt.
     * 
     * @param {Funcionario} objFuncionarioModel - Objeto Funcionario a ser inserido.
     * @returns {number} ID do funcionário inserido.
     * @throws {Error} Caso a inserção falhe.
     */
    create = async (objFuncionarioModel) => {
        console.log("🟢 FuncionarioDAO.create()");

        // Criptografa a senha antes de salvar
        objFuncionarioModel.senha = await bcrypt.hash(objFuncionarioModel.senha, 12);

        const SQL = `
            INSERT INTO funcionario 
            (nomeFuncionario, email, senha, recebeValeTransporte, Cargo_idCargo) 
            VALUES (?, ?, ?, ?, ?);`;
        const params = [
            objFuncionarioModel.nomeFuncionario,
            objFuncionarioModel.email,
            objFuncionarioModel.senha,
            objFuncionarioModel.recebeValeTransporte,
            objFuncionarioModel.cargo.idCargo,
        ];

        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);

        if (!resultado.insertId) {
            throw new Error("Falha ao inserir funcionário");
        }

        return resultado.insertId;
    };

    /**
     * Remove um funcionário pelo ID.
     * 
     * @param {number} objFuncionarioModel - ID do funcionário a ser removido.
     * @returns {boolean} true se a exclusão foi bem-sucedida.
     */
    delete = async (objFuncionarioModel) => {
        console.log("🟢 FuncionarioDAO.delete()");

        const SQL = "DELETE FROM funcionario WHERE idFuncionario = ?;";
        const params = [objFuncionarioModel.idFuncionario];

        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);

        return resultado.affectedRows > 0;
    };

    /**
     * Atualiza os dados de um funcionário existente.
     * Se a senha for informada, será criptografada antes da atualização.
     * 
     * @param {Funcionario} objFuncionarioModel - Objeto Funcionario com dados atualizados.
     * @returns {boolean} true se a atualização foi bem-sucedida.
     */
    update = async (objFuncionarioModel) => {
        console.log("🟢 FuncionarioDAO.update()");

        let SQL;
        let params;

        if (objFuncionarioModel.senha) {
            const senhaHash = await bcrypt.hash(objFuncionarioModel.senha, 12);
            SQL = `
                UPDATE funcionario 
                SET nomeFuncionario=?, email=?, senha=?, recebeValeTransporte=?, Cargo_idCargo=? 
                WHERE idFuncionario=?;`;
            params = [
                objFuncionarioModel.nomeFuncionario,
                objFuncionarioModel.email,
                senhaHash,
                objFuncionarioModel.recebeValeTransporte,
                objFuncionarioModel.cargo.idCargo,
                objFuncionarioModel.idFuncionario,
            ];
        } else {
            SQL = `
                UPDATE funcionario 
                SET nomeFuncionario=?, email=?, recebeValeTransporte=?, Cargo_idCargo=? 
                WHERE idFuncionario=?;`;
            params = [
                objFuncionarioModel.nomeFuncionario,
                objFuncionarioModel.email,
                objFuncionarioModel.recebeValeTransporte,
                objFuncionarioModel.cargo.idCargo,
                objFuncionarioModel.idFuncionario,
            ];
        }

        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);

        return resultado.affectedRows > 0;
    };

    /**
     * Retorna todos os funcionários cadastrados no banco de dados,
     * incluindo os dados do cargo associado.
     * 
     * @returns {Array} Lista de objetos Funcionario.
     */
    findAll = async () => {
        console.log("🟢 FuncionarioDAO.findAll()");

        const SQL = `
            SELECT idFuncionario, nomeFuncionario, email, recebeValeTransporte, idCargo, nomeCargo 
            FROM funcionario
            JOIN cargo ON funcionario.Cargo_idCargo = idCargo;`;

        const pool = await this.#database.getPool();
        const [matrizDados] = await pool.execute(SQL);

        return matrizDados.map(row => ({
            idFuncionario: row.idFuncionario,
            nomeFuncionario: row.nomeFuncionario,
            email: row.email,
            recebeValeTransporte: row.recebeValeTransporte,
            cargo: {
                idCargo: row.idCargo,
                nomeCargo: row.nomeCargo,
            }
        }));
    };

    /**
     * Busca um funcionário pelo ID.
     * 
     * @param {number} idFuncionario - ID do funcionário.
     * @returns {Funcionario|null} Objeto Funcionario encontrado ou null se não existir.
     */
    findById = async (idFuncionario) => {
        console.log("🟢 FuncionarioDAO.findById()");

        const resultado = await this.findByField("idFuncionario", idFuncionario);
        return resultado[0] || null;
    };

    /**
     * Busca funcionários por um campo específico.
     * 
     * @param {string} field - Nome do campo a ser pesquisado. 
     *                         Valores permitidos: "idFuncionario", "nomeFuncionario", "email", "senha", "recebeValeTransporte", "Cargo_idCargo".
     * @param {*} value - Valor a ser buscado.
     * @returns {Array} Lista de funcionários encontrados.
     * @throws {Error} Caso o campo informado seja inválido.
     */
    findByField = async (field, value) => {
        console.log(`🟢 FuncionarioDAO.findByField() - Campo: ${field}, Valor: ${value}`);

        const allowedFields = ["idFuncionario", "nomeFuncionario", "email", "senha", "recebeValeTransporte", "Cargo_idCargo"];
        if (!allowedFields.includes(field)) {
            throw new Error("Campo inválido para busca");
        }

        const SQL = `SELECT * FROM funcionario WHERE ${field} = ?;`;
        const params = [value];

        const pool = await this.#database.getPool();
        const [rows] = await pool.execute(SQL, params);

        return rows || [];
    };

    /**
     * Autentica um funcionário verificando email e senha.
     * 
     * @param {Funcionario} objFuncionarioModel - Objeto contendo email e senha.
     * @returns {Funcionario|null} Objeto Funcionario autenticado ou null se falhar.
     */
    login = async (objFuncionarioModel) => {
        console.log("🟢 FuncionarioDAO.login()");

        const SQL = `
            SELECT idFuncionario, nomeFuncionario, email, senha, recebeValeTransporte, idCargo, nomeCargo
            FROM funcionario
            JOIN cargo ON cargo.idCargo = funcionario.Cargo_idCargo
            WHERE email = ?;`;

        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, [objFuncionarioModel.email]);

        if (resultado.length !== 1) {
            console.log("❌ Funcionário não encontrado");
            return null;
        }

        const funcionarioDB = resultado[0];

        // Verificação da senha
        const senhaValida = await bcrypt.compare(objFuncionarioModel.senha, funcionarioDB.senha);
        if (!senhaValida) {
            console.log("❌ Senha inválida");
            return null;
        }

        // Monta objeto Cargo
        const objCargo = new Cargo();
        objCargo.idCargo = parseInt(funcionarioDB.idCargo);
        objCargo.nomeCargo = funcionarioDB.nomeCargo;

        // Monta objeto Funcionario
        const funcionario = new Funcionario();
        funcionario.idFuncionario = funcionarioDB.idFuncionario;
        funcionario.nomeFuncionario = funcionarioDB.nomeFuncionario;
        funcionario.email = funcionarioDB.email;
        funcionario.recebeValeTransporte = funcionarioDB.recebeValeTransporte;
        funcionario.cargo = objCargo;

        return funcionario;
    };
};
