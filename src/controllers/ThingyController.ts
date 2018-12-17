import {BaseController} from './BaseController';
import * as Router from 'koa-router';
import {ThingyQueryService} from '../service/database/ThingyQueryService';
import {ThingyService} from '../service/ThingyService';
import {IThingy} from '../models/Thingy';
import {MqttService} from '../service/MqttService';
import {EventBus} from '../service/EventBus';
import {ConfigurationAdded} from '../service/AlarmService';

export class ThingyController extends BaseController {

    private thingyQuerier: ThingyQueryService;
    private thingyService: ThingyService;
    private mqttService: MqttService;
    protected zone: string = '/thingy';
    private eventbus: EventBus;

    constructor(thingyQuerier: ThingyQueryService, thingyService: ThingyService, mqttService: MqttService, eventbus: EventBus) {
        super();
        this.thingyQuerier = thingyQuerier;
        this.thingyService = thingyService;
        this.mqttService = mqttService;
        this.eventbus = eventbus;
    }

    getRoutes(router: Router): Router {
        router.post('/', this.addThingy);
        router.get('/', this.getAllThingys);
        router.put('/:id', this.editThingy);
        router.get('/:id', this.getThingy);
        router.delete('/:id', this.deleteThingy);
        return router;
    }

    addThingy = async (ctx: Router.IRouterContext) => {
        const thingyModel = <IThingy> ctx.request.body;
        const username = ctx.state.user.user.username;
        const configuredThingyDevice = await this.thingyService.configureNewThingyDevice(thingyModel, username);
        this.eventbus.fireConfigurationAdded(new ConfigurationAdded(configuredThingyDevice, username));
        ctx.response.status = configuredThingyDevice ? 200 : 400;
        ctx.response.body = configuredThingyDevice;
    };

    getAllThingys = async (ctx: Router.IRouterContext) => {
        const username = ctx.state.user.user.username;
        ctx.response.body = await this.thingyQuerier.findAllThingyDevicesByUsername(username);
        ctx.response.status = 201;
    };

    editThingy = async (ctx: Router.IRouterContext) => {
        const locationId = ctx.params.id;
        const username = ctx.state.user.user.username;
        const thingyDevice: IThingy = <IThingy>ctx.request.body;
        const updatedThingyDeviceHandler = await this.thingyService.updateThingyDevice(thingyDevice, username);
        ctx.response.body = updatedThingyDeviceHandler;
        ctx.response.status = updatedThingyDeviceHandler ? 200 : 400;
        this.mqttService.subscribe(thingyDevice.deviceId, thingyDevice.id);
    };

    deleteThingy = async (ctx: Router.IRouterContext) => {
        const id = ctx.params.id;
        const username = ctx.state.user.user.username;
        const deleted = await this.thingyQuerier.deleteThingyDevice(id, username);
        ctx.response.status = deleted ? 200 : 400;
    };

    getThingy = async (ctx: Router.IRouterContext) => {
        const id = ctx.params.id;
        const username = ctx.state.user.user.username;
        const foundThingyDevice = await this.thingyQuerier.findThingyByIdAndUsername(id, username);
        ctx.response.body = foundThingyDevice;
        ctx.response.status = foundThingyDevice ? 200 : 404;
    };


}
