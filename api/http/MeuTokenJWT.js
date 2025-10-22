const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Classe responsável por gerar e validar tokens JWT (JSON Web Token) para autenticação.
 * 
 * Implementa:
 * - Geração de token com claims personalizados;
 * - Validação de token, incluindo verificação de expiração;
 * - Configuração de cabeçalhos e payload do JWT.
 * 
 * Os atributos principais são privados e podem ser acessados/modificados via getters/setters.
 */
module.exports = class MeuTokenJWT {
    // Atributos privados
    #key;            // Chave secreta usada para assinar o token
    #alg;            // Algoritmo de criptografia
    #type;           // Tipo do token
    #iss;            // Emissor do token
    #aud;            // Destinatário do token
    #sub;            // Assunto do token
    #duracaoToken;   // Tempo de validade do token (em segundos)
    #payload;        // Payload decodificado do token

    /**
     * Construtor da classe MeuTokenJWT
     * Inicializa valores padrão como chave secreta, algoritmo, tipo e duração do token.
     */
    constructor() {
        this.#key = "x9S4q0v+V0IjvHkG20uAxaHx1ijj+q1HWjHKv+ohxp/oK+77qyXkVj/l4QYHHTF3";
        this.#alg = "HS256";
        this.#type = "JWT";
        this.#iss = "http://localhost";
        this.#aud = "http://localhost";
        this.#sub = "acesso_sistema";
        this.#duracaoToken = 3600 * 24 * 60; // 60 dias em segundos
        this.#payload = null;
    }

    /**
     * Gera um token JWT assinado com os claims fornecidos.
     * @param {Object} claims - Objeto com informações do usuário: { email, role, name, idFuncionario }
     * @returns {string} Token JWT assinado
     */
    gerarToken = (claims) => {
        const headers = {
            alg: this.#alg,
            typ: this.#type,
        };

        const payload = {
            iss: this.#iss,
            aud: this.#aud,
            sub: this.#sub,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + this.#duracaoToken,
            nbf: Math.floor(Date.now() / 1000),
            jti: crypto.randomBytes(16).toString("hex"),

            email: claims.email,
            role: claims.role,
            name: claims.name,
            idFuncionario: claims.idFuncionario
        };

        //console.log(payload)
        
        return jwt.sign(payload, this.#key, {
            algorithm: this.#alg,
            header: headers,
        });
    };

    /**
     * Valida um token JWT.
     * @param {string} stringToken - Token JWT a ser validado (pode incluir prefixo "Bearer ")
     * @returns {boolean} true se o token for válido, false caso contrário
     * 
     * Armazena o payload decodificado em #payload se a validação for bem-sucedida.
     */
    validarToken = (stringToken) => {
        if (!stringToken) {
            console.error("Token não fornecido");
            return false;
        }

        if (stringToken.trim() === "") {
            console.error("Token em branco");
            return false;
        }

        const token = stringToken.replace("Bearer ", "").trim();

        try {
            const decoded = jwt.verify(token, this.#key, {
                algorithms: [this.#alg],
            });
            this.#payload = decoded;
            return true;
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                console.error("Token expirado");
            } else if (err instanceof jwt.JsonWebTokenError) {
                console.error("Token inválido");
            } else {
                console.error("Erro geral", err);
            }
            return false;
        }
    };

    // Getters e Setters para atributos privados

    get key() { return this.#key; }
    set key(value) { this.#key = value; }

    get alg() { return this.#alg; }
    set alg(value) { this.#alg = value; }

    get type() { return this.#type; }
    set type(value) { this.#type = value; }

    get iss() { return this.#iss; }
    set iss(value) { this.#iss = value; }

    get aud() { return this.#aud; }
    set aud(value) { this.#aud = value; }

    get sub() { return this.#sub; }
    set sub(value) { this.#sub = value; }

    get duracaoToken() { return this.#duracaoToken; }
    set duracaoToken(value) { this.#duracaoToken = value; }

    get payload() { return this.#payload; }
    set payload(value) { this.#payload = value; }
};
