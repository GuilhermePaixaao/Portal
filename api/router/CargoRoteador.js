const express = require("express");
const JwtMiddleware = require("../middleware/JwtMiddleware");
const CargoMiddleware = require("../middleware/CargoMiddleware");
const CargoControle = require("../control/CargoControl");

/**
 * Classe responsável por configurar as rotas da entidade Cargo.
 * 
 * Observações sobre injeção de dependência:
 * - O roteador não cria suas próprias instâncias de middlewares ou controladores.
 * - Ele recebe instâncias externas de JwtMiddleware, CargoMiddleware e CargoControle via construtor.
 * - Isso permite flexibilidade: 
 *      - Testes unitários podem injetar mocks ou stubs;
 *      - É possível trocar implementações sem alterar o roteador;
 *      - Segue o princípio de inversão de dependência (SOLID).
 */
module.exports = class CargoRoteador {
    // Atributos privados
    #router;
    #cargoMiddleware;
    #cargoControl;
    #jwtMiddleware;

    /**
     * Construtor da classe CargoRoteador
     * 
     * Injeção de dependência:
     * @param {JwtMiddleware} jwtMiddlewareDependency - Middleware JWT externo injetado
     * @param {CargoMiddleware} cargoMiddlewareDependency - Middleware de validação de Cargo injetado
     * @param {CargoControle} cargoControlDependency - Controlador de Cargo injetado
     */
    constructor(routerDependency, jwtMiddlewareDependency, cargoMiddlewareDependency, cargoControlDependency) {
        console.log("⬆️  CargoRoteador.constructor()");
        // Armazenando as instâncias injetadas
        this.#router = routerDependency;
        this.#jwtMiddleware = jwtMiddlewareDependency;
        this.#cargoMiddleware = cargoMiddlewareDependency;
        this.#cargoControl = cargoControlDependency;
    }

    /**
     * Configura as rotas da API REST para a entidade Cargo.
     * 
     * Rotas configuradas:
     * POST "/"           -> Criar um novo Cargo (validação JWT + body)
     * GET "/"            -> Listar todos os Cargos (validação JWT)
     * GET "/:idCargo"    -> Buscar Cargo por ID (validação JWT + id param)
     * PUT "/:idCargo"    -> Atualizar Cargo por ID (validação JWT + id param + body)
     * DELETE "/:idCargo" -> Deletar Cargo por ID (validação JWT + id param)
     * 
     * Todas as dependências (JWT, middleware de validação, controlador) são fornecidas externamente,
     * permitindo maior flexibilidade e testabilidade do código.
     * 
     * @returns {express.Router} Router configurado com todas as rotas de Cargo
     */
    createRoutes = () => {
        console.log("⬆️  CargoRoteador.createRoutes()");

        this.#router.post("/",
            this.#jwtMiddleware.validateToken,
            this.#cargoMiddleware.validateBody,
            this.#cargoControl.store
        );

        this.#router.get("/",
            this.#jwtMiddleware.validateToken,
            this.#cargoControl.index
        );

        this.#router.get("/:idCargo",
            this.#jwtMiddleware.validateToken,
            this.#cargoMiddleware.validateIdParam,
            this.#cargoControl.show
        );

        this.#router.put("/:idCargo",
            this.#jwtMiddleware.validateToken,
            this.#cargoMiddleware.validateIdParam,
            this.#cargoMiddleware.validateBody,
            this.#cargoControl.update
        );

        this.#router.delete("/:idCargo",
            this.#jwtMiddleware.validateToken,
            this.#cargoMiddleware.validateIdParam,
            this.#cargoControl.destroy
        );

        return this.#router;
    }

}
