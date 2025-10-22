const express = require("express");
const CargoMiddleware = require("../middleware/CargoMiddleware");
const FuncionarioMiddleware = require("../middleware/FuncionarioMiddleware");
const FuncionarioControle = require("../control/FuncionarioControl");
const JwtMiddleware = require("../middleware/JwtMiddleware");

/**
 * Classe responsável por configurar as rotas da entidade Funcionario.
 * 
 * Observações sobre injeção de dependência:
 * - O roteador não cria suas próprias instâncias de middlewares ou controladores.
 * - Ele recebe instâncias externas de JwtMiddleware, FuncionarioMiddleware e FuncionarioControle via construtor.
 * - Isso permite:
 *      - Testes unitários com mocks ou stubs;
 *      - Troca de implementações sem alterar o roteador;
 *      - Segue o princípio de inversão de dependência (SOLID).
 */
module.exports = class FuncionarioRoteador {
    // Atributos privados
    #router;
    #funcionarioControle;
    #funcionarioMiddleware;
    #jwtMiddleware;

    /**
     * Construtor da classe FuncionarioRoteador
     * 
     * Injeção de dependência:
     * @param {JwtMiddleware} jwtMiddleware - Middleware JWT externo injetado
     * @param {FuncionarioMiddleware} funcionarioMiddleware - Middleware de validação de Funcionario injetado
     * @param {FuncionarioControle} funcionarioControle - Controlador de Funcionario injetado
     */
    constructor(jwtMiddleware, funcionarioMiddleware, funcionarioControle) {
        console.log("⬆️  FuncionarioRoteador.constructor()");
        this.#router = express.Router();

        // Armazenando as instâncias injetadas
        this.#jwtMiddleware = jwtMiddleware;
        this.#funcionarioMiddleware = funcionarioMiddleware;
        this.#funcionarioControle = funcionarioControle;
    }

    /**
     * Configura as rotas da API REST para a entidade Funcionario.
     * 
     * Rotas configuradas:
     * POST "/login"                    -> Efetuar login do funcionário
     * POST "/"                          -> Criar um novo Funcionario (validação JWT + body)
     * PUT "/:idFuncionario"             -> Atualizar Funcionario por ID (validação JWT + id param + body)
     * DELETE "/:idFuncionario"          -> Deletar Funcionario por ID (validação JWT + id param)
     * GET "/"                           -> Listar todos os Funcionarios (validação JWT)
     * GET "/:idFuncionario"             -> Buscar Funcionario por ID (validação JWT + id param)
     * 
     * Todas as dependências (JWT, middleware de validação, controlador) são fornecidas externamente,
     * permitindo maior flexibilidade e testabilidade do código.
     * 
     * @returns {express.Router} Router configurado com todas as rotas de Funcionario
     */
    createRoutes = () => {
        console.log("⬆️  FuncionarioRoteador.createRoutes()");

        // ROTA: POST[/funcionarios/login]
        this.#router.post("/login",
            this.#funcionarioMiddleware.validateLoginBody,
            this.#funcionarioControle.login
        );

        // ROTA: POST[/funcionarios]
        this.#router.post("/",
            this.#jwtMiddleware.validateToken,
            this.#funcionarioMiddleware.validateCreateBody,
            this.#funcionarioControle.store
        );

        // ROTA: PUT[/funcionarios/:idFuncionario]
        this.#router.put("/:idFuncionario",
            this.#jwtMiddleware.validateToken,
            this.#funcionarioMiddleware.validateIdParam,
            this.#funcionarioMiddleware.validateCreateBody,
            this.#funcionarioControle.update
        );

        // ROTA: DELETE[/funcionarios/:idFuncionario]
        this.#router.delete("/:idFuncionario",
            this.#jwtMiddleware.validateToken,
            this.#funcionarioMiddleware.validateIdParam,
            this.#funcionarioControle.destroy
        );

        // ROTA: GET[/funcionarios]
        this.#router.get("/",
            this.#jwtMiddleware.validateToken,
            this.#funcionarioControle.index
        );

        // ROTA: GET[/funcionarios/:idFuncionario]
        this.#router.get("/:idFuncionario",
            this.#jwtMiddleware.validateToken,
            this.#funcionarioMiddleware.validateIdParam,
            this.#funcionarioControle.show
        );

        return this.#router;
    }
}
