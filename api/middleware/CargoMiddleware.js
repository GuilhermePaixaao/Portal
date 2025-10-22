const ErrorResponse = require("../utils/ErrorResponse");
const Cargo = require("../model/Cargo");
const CargoDAO = require("../dao/CargoDAO");

/**
 * Middleware para validação de requisições relacionadas à entidade Cargo.
 * 
 * Objetivo:
 * - Garantir que os dados obrigatórios estejam presentes antes de chamar
 *   os métodos do Controller ou Service.
 * - Lançar erros padronizados usando ErrorResponse quando a validação falhar.
 */
module.exports = class CargoMiddleware {

    /**
     * Valida o corpo da requisição (request.body) para operações de Cargo.
     * 
     * Verifica:
     * - Se o objeto 'cargo' existe
     * - Se o campo obrigatório 'nomeCargo' está presente e não é vazio
     * 
     * @param {Request} request - Objeto de requisição do Express
     * @param {Response} response - Objeto de resposta do Express
     * @param {Function} next - Função next() para passar para o próximo middleware
     * 
     * Lança ErrorResponse com código HTTP 400 em caso de validação falha.
     */
    validateBody = (request, response, next) => {
        console.log("🔷 CargoMiddleware.validateBody()");
        const body = request.body;

        if (!body.cargo) {
            throw new ErrorResponse(400, "Erro na validação de dados", { message: "O campo 'cargo' é obrigatório!" });
        }

        const cargo = body.cargo;

        if (!cargo.nomeCargo || cargo.nomeCargo.trim() === "") {
            throw new ErrorResponse(400, "Erro na validação de dados", { message: "O campo 'nomeCargo' é obrigatório!" });
        }

        next(); // Passa para o próximo middleware ou controller
    }

    /**
     * Valida o parâmetro de rota 'idCargo' em requisições que necessitam de identificação do cargo.
     * 
     * Verifica:
     * - Se o parâmetro 'idCargo' foi passado na URL
     * 
     * @param {Request} request - Objeto de requisição do Express
     * @param {Response} response - Objeto de resposta do Express
     * @param {Function} next - Função next() para passar para o próximo middleware
     * 
     * Lança ErrorResponse com código HTTP 400 caso 'idCargo' não seja fornecido.
     */
    validateIdParam = (request, response, next) => {
        console.log("🔷 CargoMiddleware.validateIdParam()");
        const { idCargo } = request.params;

        if (!idCargo) {
            throw new ErrorResponse(400, "Erro na validação de dados", { message: "O parâmetro 'idCargo' é obrigatório!" });
        }

        next(); // Passa para o próximo middleware ou controller
    }
}
