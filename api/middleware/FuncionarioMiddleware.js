// ...existing code...
const ErrorResponse = require("../utils/ErrorResponse");

/**
 * Middleware para validação de requisições relacionadas à entidade Funcionario.
 *
 * Objetivo:
 * - Garantir que os dados obrigatórios estejam presentes antes de chamar
 *   os métodos do Controller ou Service.
 * - Lançar erros padronizados usando ErrorResponse quando a validação falhar.
 */
class FuncionarioMiddleware {

    /**
     * Valida o corpo da requisição para criação de um novo funcionário.
     *
     * Verifica:
     * - Se o objeto 'funcionario' existe
     * - Campos obrigatórios: nomeFuncionario, email, senha, usuario, cargo
     * - Objeto 'cargo' presente e válido
     * - idCargo é um inteiro positivo
     *
     * @param {Request} request - Objeto de requisição do Express
     * @param {Response} response - Objeto de resposta do Express
     * @param {Function} next - Função next() para passar para o próximo middleware
     *
     * Lança ErrorResponse com código HTTP 400 em caso de validação falha.
     */
    validateCreateBody = (request, response, next) => {
        console.log("🔷 FuncionarioMiddleware.validateCreateBody()");
        const body = request.body;

        if (!body || !body.funcionario) {
            return next(new ErrorResponse(400, "Erro na validação de dados", { message: "O campo 'funcionario' é obrigatório!" }));
        }

        const funcionario = body.funcionario;

        // 'recebeValeTransporte' foi removido da lista de campos obrigatórios
        const camposObrigatorios = [
            "nomeFuncionario",
            "email",
            "senha",
            "usuario",
            "cargo"
        ];

        for (const campo of camposObrigatorios) {
            if (funcionario[campo] === undefined || funcionario[campo] === null || funcionario[campo] === "") {
                return next(new ErrorResponse(400, "Erro na validação de dados", { message: `O campo '${campo}' é obrigatório!` }));
            }
        }

        // O loop GARANTIU que 'cargo' existe,
        // agora podemos checar o tipo e o 'idCargo'.
        if (typeof funcionario.cargo !== "object" || funcionario.cargo === null) {
            return next(new ErrorResponse(400, "Erro na validação de dados", { message: "O campo 'cargo' deve ser um objeto" }));
        }

        if (!Number.isInteger(funcionario.cargo.idCargo) || funcionario.cargo.idCargo <= 0) {
            return next(new ErrorResponse(400, "Erro na validação de dados", { message: "O campo 'idCargo' deve ser um número inteiro positivo" }));
        }

        // Se passou por tudo, segue para o Controller!
        return next();
    }

    /**
     * Valida o corpo da requisição para login de um funcionário.
     *
     * Verifica:
     * - Se o objeto 'funcionario' existe
     * - Campos obrigatórios: email, senha
     * - Formato básico de email
     *
     * @param {Request} request - Objeto de requisição do Express
     * @param {Response} response - Objeto de resposta do Express
     * @param {Function} next - Função next() para passar para o próximo middleware
     *
     * Lança ErrorResponse com código HTTP 400 em caso de validação falha.
     */
    validateLoginBody = (request, response, next) => {
        console.log("🔷 FuncionarioMiddleware.validateLoginBody()");
        const body = request.body;

        if (!body || !body.funcionario) {
            return next(new ErrorResponse(400, "Erro na validação de dados", { message: "O campo 'funcionario' é obrigatório!" }));
        }

        const funcionario = body.funcionario;

        const camposObrigatorios = ["email", "senha"];
        for (const campo of camposObrigatorios) {
            if (!funcionario[campo] || funcionario[campo].toString().trim() === "") {
                return next(new ErrorResponse(400, "Erro na validação de dados", { message: `O campo '${campo}' é obrigatório!` }));
            }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(funcionario.email)) {
            return next(new ErrorResponse(400, "Erro na validação de dados", { message: "O campo 'email' não é um e-mail válido" }));
        }

        return next();
    }

    /**
     * Valida o parâmetro de rota 'idFuncionario' em requisições que necessitam de identificação do funcionário.
     *
     * Verifica:
     * - Se o parâmetro 'idFuncionario' foi passado na URL
     *
     * @param {Request} request - Objeto de requisição do Express
     * @param {Response} response - Objeto de resposta do Express
     * @param {Function} next - Função next() para passar para o próximo middleware
     *
     * Lança ErrorResponse com código HTTP 400 caso 'idFuncionario' não seja fornecido.
     */
    validateIdParam = (request, response, next) => {
        console.log("🔷 FuncionarioMiddleware.validateIdParam()");
        const { idFuncionario } = request.params;

        if (!idFuncionario) {
            return next(new ErrorResponse(400, "Erro na validação de dados", { message: "O parâmetro 'idFuncionario' é obrigatório!" }));
        }

        return next();
    };
}
// ...existing code...
module.exports = new FuncionarioMiddleware();