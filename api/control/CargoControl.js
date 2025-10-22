// Importa a classe Cargo, que representa a entidade Cargo do sistema
const CargoService = require("../service/CargoService");

/**
 * Classe responsável por controlar os endpoints da API REST para a entidade Cargo.
 * 
 * Esta classe implementa métodos CRUD e utiliza injeção de dependência
 * para receber a instância de CargoService, desacoplando a lógica de negócio
 * da camada de controle.
 */
module.exports = class CargoControl {
    #cargoService

    /**
     * Construtor da classe CargoControl
     * @param {CargoService} cargoServiceDependency - Instância do CargoService
     * 
     * A injeção de dependência permite testar a classe separadamente
     * e trocar facilmente a implementação do serviço se necessário.
     */
    constructor(cargoServiceDependency) {
        console.log("⬆️  CargoControl.constructor()");
        this.#cargoService = cargoServiceDependency;
    }

    /**
     * Cria um novo cargo.
     * @param {Object} request - Objeto da requisição Express.js
     * @param {Object} response - Objeto da resposta Express.js
     * @param {Function} next - Middleware de tratamento de erros
     * 
     * Retorna JSON com o ID do cargo criado e mensagem de sucesso.
     */
    store = async (request, response, next) => {
        console.log("🔵 CargoControle.store()");
        try {
            const cargoBodyRequest = request.body.cargo;

            const novoId = await this.#cargoService.createCargo(cargoBodyRequest);

            const objResposta = {
                success: true,
                message: "Cadastro realizado com sucesso",
                data: {
                    cargos: [{
                        idCargo: novoId,
                        nomeCargo: cargoBodyRequest.nomeCargo
                    }]
                }
            };
            if (novoId) {
                response.status(201).send(objResposta);
            } else {
                throw new Error("Falha ao cadastrar novo Cargo");
            }
        } catch (error) {
            next(error); // Encaminha o erro para o middleware de tratamento
        }
    }

    /**
     * Lista todos os cargos cadastrados.
     * @param {Object} request - Objeto da requisição Express.js
     * @param {Object} response - Objeto da resposta Express.js
     * @param {Function} next - Middleware de tratamento de erros
     * 
     * Retorna JSON com um array de cargos.
     */
    index = async (request, response, next) => {
        console.log("🔵 CargoControle.index()");
        try {
            const arrayCargos = await this.#cargoService.findAll();

            response.status(200).send({
                success: true,
                message: "Busca realizada com sucesso",
                data: {
                    cargos: arrayCargos
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Busca um cargo pelo ID.
     * @param {Object} request - Objeto da requisição Express.js
     * @param {Object} response - Objeto da resposta Express.js
     * @param {Function} next - Middleware de tratamento de erros
     * 
     * Retorna JSON com o cargo encontrado ou erro caso não exista.
     */
    show = async (request, response, next) => {
        console.log("🔵 CargoControle.show()");
        try {
            const cargoId = request.params.idCargo;
            const cargo = await this.#cargoService.findById(cargoId);

            const objResposta = {
                success: true,
                message: "Executado com sucesso",
                data: {
                    cargos: cargo
                }
            }

            response.status(200).send(objResposta);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Atualiza os dados de um cargo existente.
     * @param {Object} request - Objeto da requisição Express.js
     * @param {Object} response - Objeto da resposta Express.js
     * @param {Function} next - Middleware de tratamento de erros
     * 
     * Retorna JSON com o cargo atualizado ou encaminha o erro caso falhe.
     */
    update = async (request, response, next) => {
        console.log("🔵 CargoControle.update()");
        try {
            const cargoId = request.params.idCargo;
            const nomeCargo = request.body.cargo.nomeCargo;
            const atualizou = await this.#cargoService.updateCargo(cargoId, nomeCargo);

            if (atualizou) {
                return response.status(200).send({
                    success: true,
                    message: 'Atualizado com sucesso',
                    data: {
                        cargos: [{
                            idCargo: cargoId,
                            nomeCargo: nomeCargo
                        }]
                    }
                })
            } else {
                return response.status(404).send({
                    success: false,
                    message: 'Cargo não encontrado para atualização',
                    data: {
                        cargos: [{
                            idCargo: cargoId,
                            nomeCargo: nomeCargo
                        }]
                    }
                })
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Remove um cargo pelo ID.
     * @param {Object} request - Objeto da requisição Express.js
     * @param {Object} response - Objeto da resposta Express.js
     * @param {Function} next - Middleware de tratamento de erros
     * 
     * Retorna status 204 se excluído com sucesso ou 404 se o cargo não existir.
     */
    destroy = async (request, response, next) => {
        console.log("🔵 CargoControle.destroy()");
        try {
            const cargoId = request.params.idCargo;
            const excluiu = this.#cargoService.deleteCargo(cargoId);

            if (excluiu) {
                return response.status(204).send({
                    success: true,
                    message: 'Ecluido com sucesso com sucesso',
                    data: {
                        cargos: [{
                            idCargo: cargoId
                        }]
                    }
                })
            } else {
                return response.status(404).send({
                    success: false,
                    message: 'Cargo não encontrado para exclusão',
                    data: {
                        cargos: [{
                            idCargo: cargoId,
                        }]
                    }
                })
            }

        } catch (error) {
            next(error);
        }
    }
}
