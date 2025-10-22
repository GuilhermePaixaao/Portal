const mysql = require("mysql2/promise");

/**
 * Classe responsável por gerenciar a conexão com o banco MySQL.
 * 
 * - Suporta passagem de dados de conexão e configurações do pool via construtor.
 * - Usa atributos privados para segurança.
 * - Mantém um pool estático (singleton), compartilhado entre todas as instâncias.
 */
module.exports = class MysqlDatabase {
    // Pool compartilhado (singleton)
    static #pool;

    // Atributos privados de configuração
    #host;
    #user;
    #password;
    #database;
    #port;
    #waitForConnections;
    #connectionLimit;
    #queueLimit;

    /**
     * Construtor recebe dados de conexão e do pool.
     * @param {object} config - Objeto de configuração.
     * Exemplo:
     * {
     *   host, user, password, database, port,
     *   waitForConnections, connectionLimit, queueLimit
     * }
     */
    constructor(config = {}) {
        this.#host = config.host || "127.0.0.1";
        this.#user = config.user || "root";
        this.#password = config.password || "";
        this.#database = config.database || "gestao_rh";
        this.#port = config.port || 3306;
        this.#waitForConnections = config.waitForConnections ?? true;
        this.#connectionLimit = config.connectionLimit || 10;
        this.#queueLimit = config.queueLimit || 10;
    }

    /**
     * Cria e retorna o pool de conexões MySQL.
     * Se o pool já existir, reutiliza o mesmo (singleton).
     * @returns {Promise<Pool>} Pool de conexões MySQL.
     */
    async connect() {
        if (!MysqlDatabase.#pool) {
            MysqlDatabase.#pool = mysql.createPool({
                host: this.#host,
                user: this.#user,
                password: this.#password,
                database: this.#database,
                port: this.#port,
                waitForConnections: this.#waitForConnections,
                connectionLimit: this.#connectionLimit,
                queueLimit: this.#queueLimit
            });

            try {
                const connection = await MysqlDatabase.#pool.getConnection();
                console.log("⬆️  Conectado ao MySQL com sucesso!");
                connection.release();
            } catch (error) {
                console.error("❌ Falha ao conectar ao MySQL:", error.message);
                process.exit(1);
            }
        }
        return MysqlDatabase.#pool;
    }

    /**
     * Retorna o pool já existente ou cria se não existir.
     * @returns {Promise<Pool>} Pool de conexões ativo.
     */
    async getPool() {
        return await this.connect();
    }
};
