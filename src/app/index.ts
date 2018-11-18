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


class App {

    private controllers: Array<BaseController>;
    private authenticationService: AuthenticationService;
    private environmentalDataParserService: EnvironmentalDataParserService;
    private mqttService: MqttService;
    private thingyService: ThingyService;
    private userQueryService: UserQueryService;
    private thingyQueryService: ThingyQueryService;
    private environmentalDataQueryService: EnvironmentalDataQueryService;
    private config: Configuration.Loader;
    private mqttConnection: MqttConnection;
    private mongoDatabaseConnection: MongoDatabaseConnection;
    private influxDatabaseConnection: InfluxDatabaseConnection;

    constructor() {
        this.controllers = [];
    }

    public start = async () => {
        console.log('Starting the app...');
        this.loadConfig();
        this.initializeServices();
        let router = this.initializeControllers();
        const app = new Koa();
        app.use(cors());
        app.use(enableSecurity(this.authenticationService, this.config.authConfig.SECRET_KEY));
        app.use(bodyParser());
        app.use(router.routes());
        await app.listen(this.config.serverConfig.SERVER_PORT);
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
        this.thingyQueryService = new ThingyQueryService();
        this.userQueryService = new UserQueryService();
        this.mqttConnection = new MqttConnection(mqttConfig.mqtt, mqttConfig.port, mqttConfig.username, mqttConfig.password);
        this.mongoDatabaseConnection = new MongoDatabaseConnection(mongoDbConfig.DATABASE_URL, mongoDbConfig.DATABASE_NAME);
        this.influxDatabaseConnection = new InfluxDatabaseConnection(influxDbConfig.DATABASE_URL, influxDbConfig.DATABASE_NAME);
        this.authenticationService = new AuthenticationService(this.config.serverConfig.PUBLIC_APIS);
        this.environmentalDataParserService = new EnvironmentalDataParserService();
        this.environmentalDataQueryService = new EnvironmentalDataQueryService(this.influxDatabaseConnection);
        this.mqttService = new MqttService(this.mqttConnection, this.thingyQueryService, this.environmentalDataQueryService, this.environmentalDataParserService);
        this.thingyService = new ThingyService(this.thingyQueryService, this.mqttService);
        this.mqttConnection.initConnection();
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
            new EnvironmentalDataController(this.environmentalDataQueryService, this.thingyQueryService));
        let router: Router = new Router();
        for (let controller of this.controllers) {
            controller.routes(router);
        }
        return router;
    };

}


export {App};
