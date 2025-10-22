/**
 * Classe [Logger]
 *
 * Responsável por registrar mensagens de erro e exceções em um arquivo de log.
 *
 * Esta classe faz parte de uma API REST didática desenvolvida com o objetivo de
 * ensinar, de forma simples e prática, os principais conceitos da arquitetura REST
 * e do padrão de projeto MVC (Model-View-Controller).
 *
 * @author      
 * @license     GPL (GNU General Public License)
 */

const fs = require("fs");
const path = require("path");

module.exports = class Logger {
    /**
     * Caminho do arquivo de log.
     * @type {string}
     */
    static LOG_FILE = "api/system/log.log";

    /**
     * Registra uma mensagem de erro genérica no log.
     * @param {string} errorMessage A mensagem de erro a ser registrada.
     */
    static logError(errorMessage) {
        this.writeLog("ERROR", errorMessage);
    }

    /**
     * Registra uma exceção ou erro no log.
     * @param {Error} error A exceção capturada.
     */
    static log(error) {


        this.writeLog("error", JSON.stringify(error));
    }

    /**
     * Escreve uma entrada no arquivo de log.
     * @param {string} type Tipo da mensagem (ex: "ERROR", "Throwable").
     * @param {string} message Conteúdo da mensagem a ser registrada.
     */
    static writeLog(type, message) {

        const directoryPath = path.dirname(this.LOG_FILE);

        // Garante que o diretório existe
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        const dateTime = new Date().toISOString(); // formato ISO: 2025-08-30T12:34:56.789Z
        const entry = `[${dateTime}] [${type}] [${message}]\n`;

        try {
            fs.appendFileSync(this.LOG_FILE, entry, { encoding: "utf8" });
            console.log("🟡 Erro gravado em log");
        } catch (err) {
            console.error("🔴 Falha ao gravar log:", err);
        }
    }
}
