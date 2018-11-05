import {BaseController} from './BaseController';
import * as Router from 'koa-router';
import {MqttConnection} from '../service/MqttConnection';

export class MqttController extends BaseController {

    protected zone: string = '/mqtt';
    private mqttConnection: MqttConnection;

    constructor(mqttConnection: MqttConnection) {
        super();
        this.mqttConnection = mqttConnection;
    }

    getRoutes(router: Router): Router {
        router.get('/state', this.getState);
        return router;
    }

    getState = (ctx: Router.IRouterContext) => {
        ctx.response.body = { state: this.mqttConnection.connectionState };
        ctx.status = 200;
    };
}