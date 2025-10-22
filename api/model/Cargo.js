/**
 * Representa a entidade Cargo do sistema.
 * 
 * Objetivo:
 * - Encapsular os dados de um cargo.
 * - Garantir integridade dos atributos via getters e setters.
 */
module.exports = class Cargo {
    // Atributos privados
    #idCargo;
    #nomeCargo;

    constructor() {
        console.log("⬆️  Cargo.constructor()");
    }

    /**
     * Getter para idCargo
     * @returns {number} Identificador único do cargo
     */
    get idCargo() {
        return this.#idCargo;
    }

    /**
     * Define o ID do cargo.
     *
     * 🔹 Regra de domínio: garante que o ID seja sempre um número inteiro positivo.
     *
     * @param {number} value - Número inteiro positivo representando o ID do cargo.
     * @throws {Error} - Lança erro se o valor não for número, não for inteiro ou for menor/igual a zero.
     *
     * @example
     * cargo.idCargo = 1;  // ✅ válido
     * cargo.idCargo = -5; // ❌ lança erro
     * cargo.idCargo = 0;  // ❌ lança erro
     * cargo.idCargo = 3.14; // ❌ lança erro
     * cargo.idCargo = null; // ❌ lança erro
     */
    set idCargo(value) {
        // Converte o valor para número, permitindo strings numéricas
        const parsed = Number(value);

        // Verifica se é um número inteiro
        if (!Number.isInteger(parsed)) {
            throw new Error("idCargo deve ser um número inteiro.");
        }

        // Verifica se é maior que zero
        if (parsed <= 0) {
            throw new Error("idCargo deve ser maior que zero.");
        }

        // Atribui valor ao atributo privado
        this.#idCargo = parsed;
    }

    /**
     * Getter para nomeCargo
     * @returns {string} Nome do cargo
     */
    get nomeCargo() {
        return this.#nomeCargo;
    }

    /**
     * Define o nome do cargo.
     *
     * 🔹 Regra de domínio: garante que o nome seja sempre uma string não vazia
     * e com pelo menos 3 caracteres.
     *
     * @param {string} value - Nome do cargo.
     * @throws {Error} - Lança erro se o valor não for string, estiver vazio, tiver menos de 3 caracteres ou for null/undefined.
     *
     * @example
     * cargo.nomeCargo = "Gerente";   // ✅ válido
     * cargo.nomeCargo = "AB";        // ❌ lança erro
     * cargo.nomeCargo = "";          // ❌ lança erro
     * cargo.nomeCargo = null;        // ❌ lança erro
     */
    set nomeCargo(value) {
        // Verifica se é string
        if (typeof value !== "string") {
            throw new Error("nomeCargo deve ser uma string.");
        }

        // Remove espaços no início/fim
        const nome = value.trim();

        // Verifica comprimento mínimo
        if (nome.length < 3) {
            throw new Error("nomeCargo deve ter pelo menos 3 caracteres.");
        }

        // Verifica comprimento mínimo
        if (nome.length > 64) {
            throw new Error("nomeCargo deve ter no máximo 64 caracteres.");
        }
        // Atribui valor ao atributo privado
        this.#nomeCargo = nome;
    }
}
