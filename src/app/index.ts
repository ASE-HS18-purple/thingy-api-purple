import * as cors from '@koa/cors';
import * as bodyParser from 'koa-bodyparser';
import * as Koa from 'koa';
import * as Router from 'koa-router';

import {MongoDatabaseConnection} from '../service/database/MongoDatabaseService';
import {MqttConnection} from '../service/MqttConnection';
import {AuthenticationService} from '../service/AuthenticationService';
import {BaseController} from '../controllers/BaseController';
import {AuthenticationController} from '../controllers/AuthenticationController';
import {MqttController} from '../controllers/MqttController';
import {ThingyController} from '../controllers/ThingyController';
import {UserController} from '../controllers/UserController';
import {enableSecurity} from '../middleware/Security';
import {UserQueryService} from '../service/database/UserQueryService';
import {ThingyQueryService} from '../service/database/ThingyQueryService';
import {Configuration} from '../service/ConfigurationService';
import {ThingyService} from '../service/ThingyService';
import {MqttService} from '../service/MqttService';
import {EnvironmentalDataParserService} from '../service/EnvironmentalDataParserService';
import {InfluxDatabaseConnection} from '../service/database/InfluxDatabaseConnection';
import {EnvironmentalDataQueryService} from '../service/database/EnvironmentalDataQueryService';
import {EnvironmentalDataController} from '../controllers/EnvironmentalDataController';
import {WebsocketController} from '../controllers/WebsocketController';
import {Server} from 'http';
import {EventBus} from '../service/EventBus';
import {AlarmService} from "../service/AlarmService";
import {AlarmQueryService} from "../service/database/AlarmQueryService";
import {AlarmController} from "../controllers/AlarmController";


class App {

    private controllers: Array<BaseController>;
    private websocketController: WebsocketController;
    private authenticationService: AuthenticationService;
    private environmentalDataParserService: EnvironmentalDataParserService;
    private mqttService: MqttService;
    private thingyService: ThingyService;
    private userQueryService: UserQueryService;
    private thingyQueryService: ThingyQueryService;
    private environmentalDataQueryService: EnvironmentalDataQueryService;
    private alarmQueryService: AlarmQueryService;
    private alarmService: AlarmService;
    private config: Configuration.Loader;
    private mqttConnection: MqttConnection;
    private server: Server;
    private mongoDatabaseConnection: MongoDatabaseConnection;
    private influxDatabaseConnection: InfluxDatabaseConnection;
    private eventbus: EventBus;

    constructor() {
        this.controllers = [];
    }

    public start = async () => {
        console.log('Starting the app...');
        this.eventbus = new EventBus();
        this.loadConfig();
        this.initializeServices();
        let router = this.initializeControllers();
        const app = new Koa();
        app.use(cors());
        app.use(enableSecurity(this.authenticationService, this.config.authConfig.SECRET_KEY));
        app.use(bodyParser());
        app.use(router.routes());
        this.server = await app.listen(this.config.serverConfig.SERVER_PORT);
        this.websocketController = new WebsocketController(this.server, this.thingyQueryService, this.eventbus);
        this.mqttConnection.initConnection();
        console.log(`App is up and running and listening to port: ${this.config.serverConfig.SERVER_PORT}`);
        console.log('Initiating database connection');
    };

    private loadConfig = () => {
        this.config = new Configuration.Loader('../config');
        this.config.load();
    };

    private initializeServices = () => {
        let mqttConfig = this.config.mqttConfig;
        let mongoDbConfig = this.config.mongoDatabaseCfg;
        const influxDbConfig = this.config.influxDatabaseCfg;
        this.userQueryService = new UserQueryService();
        this.mqttConnection = new MqttConnection(mqttConfig.mqtt, mqttConfig.port, mqttConfig.username, mqttConfig.password, this.eventbus);
        this.mongoDatabaseConnection = new MongoDatabaseConnection(mongoDbConfig.DATABASE_URL, mongoDbConfig.DATABASE_NAME);
        this.influxDatabaseConnection = new InfluxDatabaseConnection(influxDbConfig.DATABASE_URL, influxDbConfig.DATABASE_NAME);
        this.authenticationService = new AuthenticationService(this.config.serverConfig.PUBLIC_APIS);
        this.environmentalDataParserService = new EnvironmentalDataParserService();
        this.environmentalDataQueryService = new EnvironmentalDataQueryService(this.influxDatabaseConnection, this.eventbus);
        this.thingyQueryService = new ThingyQueryService(this.environmentalDataQueryService);
        this.alarmQueryService = new AlarmQueryService();
        this.alarmService = new AlarmService(this.alarmQueryService);
        this.mqttService = new MqttService(this.mqttConnection, this.thingyQueryService, this.environmentalDataQueryService, this.environmentalDataParserService, this.eventbus);
        this.thingyService = new ThingyService(this.thingyQueryService, this.mqttService);
        this.mqttService.initSubscriptionToMqtt();
        this.mongoDatabaseConnection.connect();
        this.influxDatabaseConnection.connect();
    };

    private initializeControllers = (): Router => {
        this.controllers.push(
            new AuthenticationController(this.userQueryService, this.config.authConfig.SECRET_KEY),
            new MqttController(this.mqttConnection),
            new ThingyController(this.thingyQueryService, this.thingyService, this.mqttService),
            new UserController(this.userQueryService),
            new EnvironmentalDataController(this.environmentalDataQueryService, this.thingyQueryService),
            new AlarmController(this.alarmService));
        let router: Router = new Router();
        for (let controller of this.controllers) {
            controller.routes(router);
        }
        return router;
    };

}


export {App};
