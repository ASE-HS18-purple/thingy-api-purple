import {BaseController} from './BaseController';
import * as Router from 'koa-router';
import {ThingyQueryService} from '../service/database/ThingyQueryService';
import {ThingyService} from '../service/ThingyService';
import {IThingy} from '../models/Thingy';
import {MqttService} from '../service/MqttService';

export interface ThingyWithUpdates extends IThingy {
    _doc: any; //<- from mongoose
}

export class ThingyController extends BaseController {

    private thingyQuerier: ThingyQueryService;
    private thingyService: ThingyService;
    private mqttService: MqttService;
    protected zone: string = '/thingy';

    constructor(thingyQuerier: ThingyQueryService, thingyService: ThingyService, mqttService: MqttService) {
        super();
        this.thingyQuerier = thingyQuerier;
        this.thingyService = thingyService;
        this.mqttService = mqttService;
    }

    getRoutes(router: Router): Router {
        router.post('/', this.addThingy);
        router.get('/', this.getAllThingys);
        router.get('/withUpdates', this.getAllThingysWithUpdates);
        router.put('/:id', this.editThingy);
        router.get('/:id', this.getThingy);
        router.delete('/:id', this.deleteThingy);
        return router;
    }

    addThingy = async (ctx: Router.IRouterContext) => {
        const thingyModel = <IThingy> ctx.request.body;
        const username = ctx.state.user.user.username;
        const configuredThingyDevice = await this.thingyService.configureNewThingyDevice(thingyModel, username);
        ctx.response.status = configuredThingyDevice ? 200 : 400;
        ctx.response.body = configuredThingyDevice;
    };

    getAllThingys = async (ctx: Router.IRouterContext) => {
        const username = ctx.state.user.user.username;
        ctx.response.body = await this.thingyQuerier.findAllThingyDevicesByUsername(username);
        ctx.response.status = 201;
    };

    getAllThingysWithUpdates = async (ctx: Router.IRouterContext) => {
        const username = ctx.state.user.user.username;
        let thingys = await this.thingyQuerier.findAllThingyDevicesByUsername(username);
        // TODO: Enhance it with last values, either manually or implement in service
        thingys.forEach(thingy => (<ThingyWithUpdates> thingy)._doc.properties = []);
        ctx.response.body = thingys;
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
