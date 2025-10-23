const CargoDAO = require("../dao/CargoDAO");
const FuncionarioDAO = require("../dao/FuncionarioDAO");
const Cargo = require("../model/Cargo");
const Funcionario = require("../model/Funcionario");
const MeuTokenJWT = require("../http/MeuTokenJWT");
const ErrorResponse = require("../utils/ErrorResponse");
// Assumindo que o bcrypt está no DAO, não precisamos dele aqui.

/**
 * Classe responsável pela camada de serviço para a entidade Funcionario.
 *  * Observações sobre injeção de dependência:
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
     * Cria um novo funcionário. (ATUALIZADO PARA O CONTEXTO ATUAL)
     *
     * @param {Object} jsonFuncionario - Objeto contendo dados do funcionário
     * @param {string} jsonFuncionario.nomeFuncionario
     * @param {string} jsonFuncionario.email
     * @param {string} jsonFuncionario.senha
     * @param {string} jsonFuncionario.usuario - (ADICIONADO)
     * @param {Object} jsonFuncionario.cargo - { idCargo }
     *
     * @returns {Promise<Funcionario>} - Objeto Funcionario criado com ID atribuído
     * @throws {ErrorResponse} - Em caso de validação de dados inválidos ou email/usuario já existente
     */
    createFuncionario = async (jsonFuncionario) => {
        console.log("🟣 FuncionarioService.createFuncionario()");

        // 1. REGRA DE NEGÓCIO: Verificar se cargo fornecido existe
        // (CORRIGIDO: Adicionado 'await' e assumindo que seu CargoDAO tem 'findById')
        const cargoExiste = await this.#cargoDAO.findById(jsonFuncionario.cargo.idCargo);
        if (!cargoExiste) {
            // (CORRIGIDO: Mensagem de erro estava errada)
            throw new ErrorResponse(
                400,
                "O cargo informado não existe",
                { message: `O Cargo com ID ${jsonFuncionario.cargo.idCargo} não foi encontrado.` }
            );
        }

        // 2. REGRA DE NEGÓCIO: Verificação de email duplicado
        const emailExiste = await this.#funcionarioDAO.findByField("email", jsonFuncionario.email);
        if (emailExiste.length > 0) {
            throw new ErrorResponse(
                400,
                "Já existe um Funcionário com o email fornecido",
                { message: `O email ${jsonFuncionario.email} já está cadastrado` }
            );
        }

        // 3. REGRA DE NEGÓCIO: Verificação de 'usuario' duplicado (ADICIONADO)
        const usuarioExiste = await this.#funcionarioDAO.findByField("usuario", jsonFuncionario.usuario);
        if (usuarioExiste.length > 0) {
            throw new ErrorResponse(
                400,
                "Já existe um Funcionário com o usuário fornecido",
                { message: `O usuário ${jsonFuncionario.usuario} já está cadastrado` }
            );
        }

        // 4. Montagem do Objeto
        const objetoCargo = new Cargo();
        objetoCargo.idCargo = jsonFuncionario.cargo.idCargo;

        const objFuncionario = new Funcionario();
        objFuncionario.nomeFuncionario = jsonFuncionario.nomeFuncionario;
        objFuncionario.email = jsonFuncionario.email;
        objFuncionario.usuario = jsonFuncionario.usuario; // (ADICIONADO)
        objFuncionario.senha = jsonFuncionario.senha; // (CORRETO - DAO irá criptografar)
        // objFuncionario.recebeValeTransporte foi (REMOVIDO)
        objFuncionario.cargo = objetoCargo;

        // 5. Persistência (DAO faz o hash da senha)
        objFuncionario.idFuncionario = await this.#funcionarioDAO.create(objFuncionario);

        return objFuncionario;
    }

    /**
     * Realiza o login de um funcionário. (ATUALIZADO PARA O CONTEXTO ATUAL)
     *
     * @param {Object} jsonFuncionario - { email, senha }
     * @returns {Promise<Object>} - { user: {...}, token }
     * @throws {ErrorResponse} - 401 se credenciais inválidas
     */
    loginFuncionario = async (jsonFuncionario) => {
        console.log("🟣 FuncionarioService.loginFuncionario()");

        const objetoFuncionario = new Funcionario();
        objetoFuncionario.email = jsonFuncionario.email;
        objetoFuncionario.senha = jsonFuncionario.senha;

        // Consulta no DAO (DAO faz a comparação de hash)
        const encontrado = await this.#funcionarioDAO.login(objetoFuncionario);

        if (!encontrado) {
            throw new ErrorResponse(401, "Usuário ou senha inválidos", { message: "Não foi possível realizar autenticação" });
        }

        // Geração de token JWT
        const jwt = new MeuTokenJWT();
        const user = {
            funcionario: {
                email: encontrado.email,
                usuario: encontrado.usuario, // (ADICIONADO)
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
     * Atualiza um funcionário (ATUALIZADO PARA O CONTEXTO ATUAL)
     * @param {number} idFuncionario - ID do funcionário
     * @param {Object} requestBody - Dados atualizados do funcionário
     * @returns {Promise<Funcionario>} - Objeto Funcionario atualizado
     * @throws {ErrorResponse} - Em caso de dados inválidos
     */
    updateFuncionario = async (idFuncionario, requestBody) => {
        console.log("🟣 FuncionarioService.updateFuncionario()");
        const jsonFuncionario = requestBody.funcionario;

        // TODO: Adicionar validação de 'cargoExiste', 'emailDuplicado', etc.
        // (O método de update está muito simples, idealmente ele teria 
        // as mesmas validações do 'create' antes de atualizar)
        // Por exemplo:
        // const cargoExiste = await this.#cargoDAO.findById(jsonFuncionario.cargo.idCargo);
        // if (!cargoExiste) { ... throw error ... }

        const objCargo = new Cargo();
        objCargo.idCargo = jsonFuncionario.cargo.idCargo;

        const objFuncionario = new Funcionario();

        objFuncionario.idFuncionario = idFuncionario;
        objFuncionario.nomeFuncionario = jsonFuncionario.nomeFuncionario;
        objFuncionario.email = jsonFuncionario.email;
        objFuncionario.usuario = jsonFuncionario.usuario; // (ADICIONADO)
        objFuncionario.senha = jsonFuncionario.senha; // (DAO vai verificar se a senha mudou e fazer o hash)
        // objFuncionario.recebeValeTransporte foi (REMOVIDO)
        objFuncionario.cargo = objCargo;

        // envia um objeto valido de funcionario para atualizar
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
        funcionario.idFuncionario = idFuncionario;
        return await this.#funcionarioDAO.delete(funcionario);
    }
}