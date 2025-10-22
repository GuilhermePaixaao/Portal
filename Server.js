const express = require("express");
const cors = require("cors")

const ErrorResponse = require("./api/utils/ErrorResponse"); // Classe para representar erros customizados da API
const Logger = require("./api/utils/Logger"); // Utilitário para registrar logs (console/arquivo/etc.)

// Middlewares
const JwtMiddleware = require("./api/middleware/JwtMiddleware"); // Middleware de autenticação via JWT

// Roteadores
const CargoRoteador = require("./api/router/CargoRoteador");
const FuncionarioRoteador = require("./api/router/FuncionarioRoteador");

// Middlewares específicos das entidades
const CargoMiddleware = require("./api/middleware/CargoMiddleware");
const FuncionarioMiddleware = require("./api/middleware/FuncionarioMiddleware");

// Controllers (controladores das regras de entrada/saída HTTP)
const CargoControle = require("./api/control/CargoControl");
const FuncionarioControl = require("./api/control/FuncionarioControl");

// Services (camada de regras de negócio)
const CargoService = require("./api/service/CargoService");
const FuncionarioService = require("./api/service/FuncionarioService");

// DAOs (camada de acesso a dados, comunicação com o banco)
const CargoDAO = require("./api/dao/CargoDAO");
const FuncionarioDAO = require("./api/dao/FuncionarioDAO");

// Banco de dados (pool de conexões MySQL centralizado)
const MysqlDatabase = require("./api/database/MysqlDatabase");

/**
 * Classe principal do servidor Express.
 * 
 * Responsabilidades:
 * - Configurar middlewares globais (ex: JSON, estáticos, autenticação).
 * - Inicializar pool de conexões com MySQL.
 * - Montar dependências das camadas (DAO → Service → Controller → Router).
 * - Tratar erros globais com errorHandler.
 * - Subir o servidor Express.
 */
module.exports = class Server {
    // 🔒 Atributos privados (encapsulamento)
    #porta;
    #app;
    #router;

    #database; // Pool global de conexões do MySQL

    #jwtMiddleware; // Middleware de autenticação

    #cargoRoteador;
    #cargoMiddleware;
    #cargoControl;
    #cargoService;
    #cargoDAO;


    #funcionarioRoteador;
    #funcionarioMiddleware;
    #funcionarioControl;
    #funcionarioService;
    #funcionarioDAO;

    /**
     * Construtor recebe a porta onde o servidor será iniciado.
     * Caso não seja passada, usa a porta 8080 por padrão.
     */
    constructor(porta) {
        console.log("⬆️ CargoControl.constructor()");
        this.#porta = porta ?? 8080;
    }

    /**
     * Método de inicialização da aplicação.
     * 
     * - Configura o Express (JSON, arquivos estáticos).
     * - Cria middlewares globais.
     * - Inicializa pool do banco.
     * - Configura módulos de Cargo e Funcionário.
     * - Configura tratamento de erros.
     */
    init = async () => {
        console.log("⬆️  Server.init()");
        this.#app = express();
        this.#router = express.Router();
        this.#app.use(express.json()); // Habilita leitura de JSON no corpo da requisição
        this.#app.use(express.static("static")); // Habilita pasta "static" para arquivos públicos (ex: HTML, JS, CSS)

        //configuração de cors significa que qualquer site ou domínio pode fazer requisições para sua API sem sofre bloquio de cors
        this.#app.use(cors({ origin: "*" }));
        /**
         * cors pode trabalhar com configurações complexas, veja exemplo abaixo.
         * this.#app.use(cors({
               origin: ["http://localhost:3000", "https://meusite.com"],
                methods: ["GET", "POST"],
                allowedHeaders: ["Content-Type", "Authorization"]
            }));
         */

        this.#jwtMiddleware = new JwtMiddleware(); // Inicializa middleware JWT

        // 🔹 Cria o pool global de conexões MySQL
        this.#database = new MysqlDatabase({
            host: "localhost",       // IP ou hostname do servidor MySQL
            user: "root",              // Usuário do banco
            password: "",         // Senha do usuário
            database: "gestao_rh",        // Nome do banco de dados
            port: 3306,                 // Porta do MySQL
            waitForConnections: true,   // Espera se não houver conexão disponível
            connectionLimit: 50,        // Máximo de conexões simultâneas no pool
            queueLimit: 10              // Máximo de requisições enfileiradas
        });

        this.#database.connect();

        // Monta dependências e rotas de cada módulo
        this.beforeRouting(); // Middleware executado antes das rotas
        this.setupCargo();
        this.setupFuncionario();
        this.setupErrorMiddleware(); // Configura tratamento global de erros
    }

    /**
     * Configuração do módulo Cargo.
     * - Cria middleware, DAO, Service e Controller.
     * - Injeta dependências.
     * - Registra rotas em "/api/v1/cargos".
     */
    setupCargo = () => {
        console.log("⬆️  Server.setupCargo()");

        // 🔹 Middleware de validação para Cargo
        // Verifica se os dados recebidos nas requisições estão corretos
        // antes de passar para o Controller. Isso mantém a lógica de validação
        // separada da lógica de negócio.
        this.#cargoMiddleware = new CargoMiddleware();

        // 🔹 DAO de Cargo
        // Recebe a conexão com o banco (pool MysqlDatabase) via injeção de dependência.
        // O DAO não precisa saber como a conexão foi criada, apenas usa os métodos disponíveis.
        this.#cargoDAO = new CargoDAO(this.#database);

        // 🔹 Service de Cargo
        // Recebe o DAO via injeção de dependência.
        // O Service contém a lógica de negócio da entidade Cargo
        // e não precisa acessar diretamente o banco de dados.
        this.#cargoService = new CargoService(this.#cargoDAO);

        // 🔹 Controller de Cargo
        // Recebe o Service via injeção de dependência.
        // O Controller apenas recebe requisições HTTP e delega a execução
        // da lógica de negócio ao Service.
        this.#cargoControl = new CargoControle(this.#cargoService);

        // 🔹 Roteador de Cargo
        // Recebe todas as dependências necessárias:
        // - express Router
        // - jwtMiddleware → autenticação
        // - cargoMiddleware → validação de entrada
        // - cargoControl → manipulação da lógica de negócio
        this.#cargoRoteador = new CargoRoteador(
            this.#router,
            this.#jwtMiddleware,
            this.#cargoMiddleware,
            this.#cargoControl
        );

        // 🔹 Registro final no Express
        // Todas as rotas da entidade Cargo ficam disponíveis em:
        // http://localhost:PORT/api/v1/cargos
        this.#app.use("/api/v1/cargos", this.#cargoRoteador.createRoutes());
    }

    /**
     * Configuração do módulo Funcionário.
     * - Cria middleware, DAO, Service e Controller.
     * - Injeta dependências.
     * - Registra rotas em "/api/v1/funcionarios".
     * 
     * Observação: Como Funcionário depende de Cargo, garante que CargoDAO já foi instanciado.
     */
    setupFuncionario = () => {
        console.log("⬆️  Server.setupFuncionario");

        // 🔹 Middleware de validação para Funcionário
        // Responsável por verificar se os dados recebidos na requisição
        // estão corretos antes de chamar a camada de controle.
        this.#funcionarioMiddleware = new FuncionarioMiddleware();

        // 🔹 DAO de Funcionário
        // Recebe o pool do banco (MysqlDatabase) via injeção de dependência.
        // Assim, o DAO não conhece os detalhes de como a conexão foi criada,
        // apenas sabe usar a instância recebida.
        this.#funcionarioDAO = new FuncionarioDAO(this.#database);

        // 🔹 Dependência cruzada:
        // Como o Funcionário possui vínculo com Cargo (chave estrangeira),
        // o Service de Funcionário precisa acessar também o CargoDAO.
        // Caso ainda não tenha sido inicializado, criamos aqui.
        if (!this.#cargoDAO) {
            this.#cargoDAO = new CargoDAO(this.#database);
        }

        // 🔹 Service de Funcionário
        // Recebe o DAO de Funcionário e o DAO de Cargo por injeção de dependência.
        // Assim, ele não precisa saber como acessar o banco, apenas chama os métodos do DAO.
        // - funcionarioDAO → usado para CRUD de Funcionário.
        // - cargoDAO → usado para validar/consultar Cargo vinculado.
        this.#funcionarioService = new FuncionarioService(this.#funcionarioDAO, this.#cargoDAO);

        // 🔹 Controller de Funcionário
        // Recebe o Service via injeção.
        // Assim, o Controller não implementa regras de negócio,
        // apenas repassa as requisições HTTP para o Service.
        this.#funcionarioControl = new FuncionarioControl(this.#funcionarioService);

        // 🔹 Roteador de Funcionário
        // Recebe todas as dependências necessárias:
        // - jwtMiddleware → garante autenticação.
        // - funcionarioMiddleware → garante validação de entrada.
        // - funcionarioControl → controla a lógica de entrada/saída HTTP.
        this.#funcionarioRoteador = new FuncionarioRoteador(
            this.#jwtMiddleware,
            this.#funcionarioMiddleware,
            this.#funcionarioControl
        );

        // 🔹 Registro final no Express
        // Todas as rotas de funcionário ficam disponíveis em:
        // http://localhost:PORT/api/v1/funcionarios
        this.#app.use("/api/v1/funcionarios", this.#funcionarioRoteador.createRoutes());
    }
    /**
     * Middleware executado antes de todas as rotas.
     * Aqui serve apenas para logar uma separação no console.
     */
    beforeRouting = () => {
        this.#app.use((req, res, next) => {
            console.log("------------------------------------------------------------------");
            next();
        });
    }

    /**
     * Middleware global de tratamento de erros.
     * - Captura erros lançados em rotas.
     * - Diferencia erros customizados (ErrorResponse) de erros genéricos.
     * - Retorna resposta JSON padronizada.
     */
    setupErrorMiddleware = () => {
        console.log("⬆️  Server.setupErrorHandler")
        this.#app.use((error, request, response, next) => {
            if (error instanceof ErrorResponse) {
                console.log("🟡 Server.errorHandler()");
                return response.status(error.httpCode).json({
                    success: false,
                    message: error.message,
                    error: error.error
                });
            }

            // Erro genérico (não tratado especificamente)
            const resposta = {
                success: false,
                message: "Ocorreu um erro interno no servidor",
                data: { stack: error.stack },
                error: { message: error.message || "Erro interno", code: error.code }
            };
            console.error("❌ Erro capturado:", resposta);
            Logger.log(resposta);
            response.status(500).json(resposta);
        });
    }

    /**
     * Inicializa o servidor Express na porta configurada.
     * Exibe no console o link do servidor.
     */
    run = () => {
        this.#app.listen(this.#porta, () => {
            console.log(`🚀 Server rodando em http://localhost:${this.#porta}/Login.html`);
        });
    }
}
