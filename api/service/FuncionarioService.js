const CargoDAO = require("../dao/CargoDAO");
const FuncionarioDAO = require("../dao/FuncionarioDAO");
const Cargo = require("../model/Cargo");
const Funcionario = require("../model/Funcionario");
const MeuTokenJWT = require("../http/MeuTokenJWT");
const ErrorResponse = require("../utils/ErrorResponse");


/**
 * Classe responsável pela camada de serviço para a entidade Funcionario.
 * 
 * Observações sobre injeção de dependência:
 * - O FuncionarioService recebe uma instância de FuncionarioDAO via construtor.
 * - Isso desacopla o serviço da implementação concreta do DAO.
 * - Facilita testes unitários e uso de mocks.
 */
module.exports = class FuncionarioService {
    #funcionarioDAO;
    #cargoDAO;
    /**
     * Construtor da classe FuncionarioService
     * @param {FuncionarioDAO} funcionarioDAODependency - Instância de FuncionarioDAO
     * @param {CargoDAO} cargoDAODependency - Instância de FuncionarioDAO
     */
    constructor(funcionarioDAODependency, cargoDAODependency) {
        console.log("⬆️  FuncionarioService.constructor()");
        this.#funcionarioDAO = funcionarioDAODependency; // injeção de dependência
        this.#cargoDAO = cargoDAODependency;
    }

    /**
     * Cria um novo funcionário.
     *
     * @param {Object} jsonFuncionario - Objeto contendo dados do funcionário
     * @param {Object} jsonFuncionario.funcionario - Dados do funcionário
     * @param {string} requestBody.funcionario.nomeFuncionario - Nome do funcionário
     * @param {string} requestBody.funcionario.email - Email do funcionário
     * @param {string} requestBody.funcionario.senha - Senha do funcionário
     * @param {boolean} requestBody.funcionario.recebeValeTransporte - Se recebe vale transporte
     * @param {Object} requestBody.funcionario.cargo - Objeto cargo
     * @param {number} requestBody.funcionario.cargo.idCargo - ID do cargo
     *
     * @returns {Promise<Funcionario>} - Objeto Funcionario criado com ID atribuído
     * @throws {ErrorResponse} - Em caso de validação de dados inválidos ou email já existente
     *
     * @example
     * const funcionario = await funcionarioService.createFuncionario({ funcionario: {...} });
     */
    createFuncionario = async (jsonFuncionario) => {
        console.log("🟣 FuncionarioService.createFuncionario()");

        //criar o cargo que será utilizado pelo funcionário
        const objetoCargo = new Cargo();
        objetoCargo.idCargo = jsonFuncionario.cargo.idCargo // regra de dominio

        // Criação da instância Funcionario
        const objFuncionario = new Funcionario();

        //aplica regra de dominio pq chama os sets da classe funcionário para inserir valores 
        objFuncionario.nomeFuncionario = jsonFuncionario.nomeFuncionario; // regra de dominio
        objFuncionario.email = jsonFuncionario.email; // regra de dominio
        objFuncionario.senha = jsonFuncionario.senha; // regra de dominio
        objFuncionario.recebeValeTransporte = jsonFuncionario.recebeValeTransporte; // regra de dominio
        objFuncionario.cargo = objetoCargo; // regra de dominio

        //regra de negocio => verificar se cargo fornecido existe antes de cadastrar
        const cargoExiste = this.#cargoDAO.findByField("idCargo", objFuncionario.cargo.idCargo);
        if (cargoExiste.length == 0) {
            throw new ErrorResponse(
                400,
                "O cargo informado não existe",
                { message: `O email ${objFuncionario.email} já está cadastrado` }
            );
        }

        //regra de negocio => Verificação de email duplicado
        const emailExiste = await this.#funcionarioDAO.findByField("email", objFuncionario.email);
        if (emailExiste.length > 0) {
            throw new ErrorResponse(
                400,
                "´Já existe um Funcionário com o email fornecido",
                { message: `O email ${objFuncionario.email} já está cadastrado` }
            );
        }

        // Persistência e atribuição de ID
        objFuncionario.idFuncionario = await this.#funcionarioDAO.create(objFuncionario);

        return objFuncionario;
    }


    /**
     * Realiza o login de um funcionário.
     *
     * 🔹 Regra de aplicação: valida as credenciais do usuário e retorna um token JWT.
     *
     * @param {Object} jsonFuncionario - Objeto contendo os dados de login.
     * @param {Object} jsonFuncionario.funcionario - Dados do funcionário para login.
     * @param {string} requestBody.funcionario.email - Email do funcionário.
     * @param {string} requestBody.funcionario.senha - Senha do funcionário.
     *
     * @returns {Promise<Object>} - Retorna um objeto contendo:
     *                              { user: { idFuncionario, name, email, role }, token }
     *
     * @throws {ErrorResponse} - Lança erro 401 se usuário ou senha forem inválidos,
     *                            ou erro 500 em caso de falha interna.
     *
     * @example
     * const resultado = await funcionarioService.loginFuncionario({
     *   funcionario: { email: "teste@dominio.com", senha: "123456" }
     * });
     * console.log(resultado.user, resultado.token);
     */
    loginFuncionario = async (jsonFuncionario) => {
        console.log("🟣 FuncionarioService.loginFuncionario()");


        const objetoFuncionario = new Funcionario();
        objetoFuncionario.email = jsonFuncionario.email;
        objetoFuncionario.senha = jsonFuncionario.senha


        // Consulta no DAO 
        const encontrado = await this.#funcionarioDAO.login(objetoFuncionario);

        if (!encontrado) {
            throw new ErrorResponse(401, "Usuário ou senha inválidos", { message: "Não foi possível realizar autenticação" });
        }

        // Geração de token JWT
        const jwt = new MeuTokenJWT();
        const user = {
            funcionario: {
                email: encontrado.email,
                role: encontrado.cargo?.nomeCargo || null,
                name: encontrado.nomeFuncionario || null,
                idFuncionario: encontrado.idFuncionario
            }
        };

        return { user, token: jwt.gerarToken(user.funcionario) };
    }

    /**
     * Retorna todos os funcionários
     * @returns {Promise<Funcionario[]>} - Lista de funcionários
     */
    findAll = async () => {
        console.log("🟣 FuncionarioService.findAll()");
        return this.#funcionarioDAO.findAll();
    }

    /**
     * Retorna um funcionário pelo ID
     * @param {number} idFuncionario - ID do funcionário
     * @returns {Promise<Funcionario>} - Objeto Funcionario encontrado
     * @throws {ErrorResponse} - Em caso de ID inválido ou funcionário não encontrado
     */
    findById = async (idFuncionario) => {
        const objFuncionario = new Funcionario();
        objFuncionario.idFuncionario = idFuncionario;

        const funcionario = await this.#funcionarioDAO.findById(objFuncionario.idFuncionario);


        if (!funcionario) {
            throw new ErrorResponse(404, "Funcionário não encontrado", { message: `Não existe funcionário com id ${idFuncionario}` });
        }

        return funcionario;
    }

    /**
     * Atualiza um funcionário
     * @param {number} idFuncionario - ID do funcionário
     * @param {Object} requestBody - Dados atualizados do funcionário
     * @returns {Promise<Funcionario>} - Objeto Funcionario atualizado
     * @throws {ErrorResponse} - Em caso de dados inválidos
     */
    updateFuncionario = async (idFuncionario, requestBody) => {
        console.log("🟣 FuncionarioService.updateFuncionario()");
        const jsonFuncionario = requestBody.funcionario;

        const objCargo = new Cargo();
        objCargo.idCargo = jsonFuncionario.cargo.idCargo;

        //validação das regras de dominio
        const objFuncionario = new Funcionario();


        objFuncionario.idFuncionario = idFuncionario,
            objFuncionario.nomeFuncionario = jsonFuncionario.nomeFuncionario,
            objFuncionario.email = jsonFuncionario.email,
            objFuncionario.senha = jsonFuncionario.senha,
            objFuncionario.recebeValeTransporte = jsonFuncionario.recebeValeTransporte,
            objFuncionario.cargo = objCargo

        //envia um objeto valido de funcionario para atualizar
        return await this.#funcionarioDAO.update(objFuncionario);
    }

    /**
     * Exclui um funcionário
     * @param {number} idFuncionario - ID do funcionário
     * @returns {Promise<boolean>} - True se excluído com sucesso
     * @throws {ErrorResponse} - Em caso de ID inválido
     */
    deleteFuncionario = async (idFuncionario) => {

        const funcionario = new Funcionario();
        funcionario.idFuncionario = idFuncionario
        return await this.#funcionarioDAO.delete(funcionario);
    }
}
