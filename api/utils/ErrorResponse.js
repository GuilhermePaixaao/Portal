/**
 * Classe personalizada de erro para a aplicação.
 * 
 * Estende a classe nativa Error do JavaScript para incluir:
 * - Código HTTP (httpCode)
 * - Informações adicionais sobre o erro (error)
 * 
 * Pode ser utilizada em middlewares ou serviços para padronizar respostas de erro.
 */
module.exports = class ErrorResponse extends Error {
    // Atributos privados
    #httpCode; // Código HTTP a ser retornado
    #error;    // Detalhes adicionais do erro em JSON ou string
    #name;
    /**
     * Construtor da classe ErrorResponse
     * @param {number} httpCode - Código de status HTTP (ex: 400, 404, 500)
     * @param {string} message - Mensagem de erro descritiva
     * @param {any} error - Objeto adicional com detalhes do erro (opcional)
     */
    constructor(httpCode, message, error = null) {
        super(message); // Chama o construtor da classe Error
        this.#name = "ErrorResponse";

        this.#httpCode = httpCode; // Código HTTP
        this.#error = error;       // Informações adicionais
    }

    /**
     * Retorna o código HTTP associado ao erro.
     * @returns {number} Código HTTP
     */
    get httpCode() {
        return this.#httpCode;
    }

    /**
     * Retorna informações adicionais sobre o erro.
     * @returns {any} Objeto JSON ou string com detalhes do erro
     */
    get error() {
        return this.#error;
    }

    get name() {
        return this.#name;
    }
}
