const Cargo = require("../model/Cargo");
const MysqlDatabase = require("../database/MysqlDatabase");

/**
 * Classe responsável por realizar operações no banco de dados
 * relacionadas à entidade Cargo.
 * 
 * Implementa métodos CRUD utilizando injeção de dependência
 * de uma instância de MysqlDatabase.
 */
module.exports = class CargoDAO {
    #database;

    /**
     * Construtor do DAO, recebe a instância de MysqlDatabase.
     * 
     * @param {MysqlDatabase} databaseInstance - Instância de MysqlDatabase injetada.
     */
    constructor(databaseInstance) {
        console.log("⬆️  CargoDAO.constructor()");
        this.#database = databaseInstance;
    }

    /**
     * Cria um novo cargo no banco de dados.
     * 
     * @param {Cargo} objCargoModel - Objeto Cargo contendo os dados do cargo.
     * @returns {Promise<number>} ID do cargo criado.
     * @throws {Error} Caso a inserção falhe.
     */
    create = async (objCargoModel) => {
        console.log("🟢 CargoDAO.create()");

        const SQL = "INSERT INTO cargo (nomeCargo) VALUES (?);";
        const params = [objCargoModel.nomeCargo];

        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);

        if (!resultado.insertId) {
            throw new Error("Falha ao inserir cargo");
        }

        return resultado.insertId;
    };

    /**
     * Remove um cargo do banco de dados pelo ID.
     * 
     * @param {Cargo} objCargoModel - Objeto Cargo contendo o ID do cargo a ser removido.
     * @returns {Promise<boolean>} True se a exclusão foi bem-sucedida.
     */
    delete = async (objCargoModel) => {
        console.log("🟢 CargoDAO.delete()");

        const SQL = "DELETE FROM cargo WHERE idCargo = ?;";
        const params = [objCargoModel.idCargo];

        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);

        return resultado.affectedRows > 0;
    };

    /**
     * Atualiza os dados de um cargo existente.
     * 
     * @param {Cargo} objCargoModel - Objeto Cargo contendo ID e novos dados do cargo.
     * @returns {Promise<boolean>} True se a atualização foi bem-sucedida.
     */
    update = async (objCargoModel) => {
        console.log("🟢 CargoDAO.update()");

        const SQL = "UPDATE cargo SET nomeCargo = ? WHERE idCargo = ?;";
        const params = [objCargoModel.nomeCargo, objCargoModel.idCargo];

        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);

        return resultado.affectedRows > 0;
    };

    /**
     * Retorna todos os cargos cadastrados no banco de dados.
     * 
     * @returns {Promise<Array>} Lista de cargos.
     */
    findAll = async () => {
        console.log("🟢 CargoDAO.findAll()");

        const SQL = "SELECT * FROM cargo;";

        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL);

        return resultado;
    };

    /**
     * Busca um cargo pelo ID.
     * 
     * @param {number} idCargo - ID do cargo a ser buscado.
     * @returns {Promise<Cargo|null>} Objeto Cargo encontrado ou null.
     */
    findById = async (idCargo) => {
        console.log("🟢 CargoDAO.findById()");

        const resultado = await this.findByField("idCargo", idCargo);
        return resultado[0] || null;
    };

    /**
     * Busca cargos por um campo específico.
     * 
     * @param {string} field - Nome do campo para busca (permitidos: "idCargo", "nomeCargo").
     * @param {*} value - Valor a ser buscado.
     * @returns {Promise<Array>} Lista de cargos encontrados.
     * @throws {Error} Caso o campo informado não seja permitido.
     */
    findByField = async (field, value) => {
        console.log(`🟢 CargoDAO.findByField() - Campo: ${field}, Valor: ${value}`);

        const allowedFields = ["idCargo", "nomeCargo"];
        if (!allowedFields.includes(field)) {
            throw new Error(`Campo inválido para busca: ${field}`);
        }

        const SQL = `SELECT * FROM cargo WHERE ${field} = ?;`;
        const params = [value];

        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);

        return resultado || [];
    };
};
