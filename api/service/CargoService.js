const CargoDAO = require("../dao/CargoDAO");
const Cargo = require("../model/Cargo");
const ErrorResponse = require("../utils/ErrorResponse");

/**
 * Classe responsável pela camada de serviço para a entidade Cargo.
 * 
 * Observações sobre injeção de dependência:
 * - O CargoService **recebe uma instância de CargoDAO via construtor**.
 * - Isso segue o padrão de injeção de dependência, tornando o serviço desacoplado
 *   do DAO concreto, facilitando testes unitários e substituição por mocks.
 */
module.exports = class CargoService {
    #cargoDAO;

    /**
     * Construtor da classe CargoService
     * @param {CargoDAO} cargoDAODependency - Instância de CargoDAO
     */
    constructor(cargoDAODependency) {
        console.log("⬆️  CargoService.constructor()");
        this.#cargoDAO = cargoDAODependency; // injeção de dependência
    }

    /**
     * Cria um novo cargo
     * @param {Object} cargoJson - Dados do cargo { nomeCargo }
     * @returns {Promise<number>} - ID do novo cargo criado
     * 
     * Validações:
     * - nomeCargo não pode estar vazio
     * - Não pode existir outro cargo com mesmo nome
     */
    createCargo = async (cargoJson) => {
        console.log("🟣 CargoService.createCargo()");

        const cargo = new Cargo();
       
        //valida regra de dominimo
        cargo.nomeCargo = cargoJson.nomeCargo;

        //valida regra de negócio
        const resultado = await this.#cargoDAO.findByField("nomeCargo", cargo.nomeCargo);

        if (resultado.length > 0) {
            throw new ErrorResponse(
                400, 
                "Cargo já existe",
                { message: `O cargo ${cargo.nomeCargo} já existe` }
            );
        }

        return this.#cargoDAO.create(cargo);
    }

    /**
     * Retorna todos os cargos
     */
    findAll = async () => {
        console.log("🟣 CargoService.findAll()");
        return this.#cargoDAO.findAll();
    }

    /**
     * Retorna um cargo por ID
     * @param {number} idCargo
     */
    findById = async (idCargo) => {
        console.log("🟣 CargoService.findById()");
        const cargo = new Cargo();
        
        //passa pela validação de regra de dominio.
        cargo.idCargo = idCargo;
      
        return this.#cargoDAO.findById(cargo.idCargo);
    }

    /**
     * Atualiza um cargo existente.
     *
     * 🔹 Regra de domínio: o idCargo deve ser um número inteiro positivo.
     *
     * @param {number} idCargo - Identificador do cargo a ser atualizado.
     * @param {Object} nomeCargo - Objeto contendo os dados do cargo.
     * @param {string} nomeCargo.nomeCargo - Nome do cargo (deve ser string não vazia).
     *
     * @returns {Promise<Cargo>} - Objeto Cargo atualizado.
     * @throws {Error} - Se idCargo for inválido ou nomeCargo não atender às regras de domínio.
     *
     * @example
     * const cargoAtualizado = await cargoService.updateCargo(3, { nomeCargo: "Gerente" });
     */
    updateCargo = async (idCargo, nomeCargo) => {
        console.log("🟣 CargoService.updateCargo()");
       
        const cargo = new Cargo();

        //validação de regras de dominio
        cargo.idCargo = idCargo;
        cargo.nomeCargo = nomeCargo;

        return this.#cargoDAO.update(cargo);
    }


    /**
     * Deleta um cargo por ID
     * @param {number} idCargo
     */
    deleteCargo = async (idCargo) => {
        console.log("🟣 CargoService.deleteCargo()");


        const cargo = new Cargo();
        cargo.idCargo = idCargo;    //validação de regra de dominio

        //passa como parametro objeto que será excluido
        return this.#cargoDAO.delete(cargo);
    }
}
