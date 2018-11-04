import {BaseController} from './BaseController';
import * as Router from 'koa-router';
import {ThingyQueryService} from '../service/database/ThingyQueryService';
import {ThingyService} from '../service/ThingyService';
import {IThingy} from '../models/Thingy';

export class ThingyController extends BaseController {

    private thingyQuerier: ThingyQueryService;
    private thingyService: ThingyService;
    protected zone: string = '/thingy';

    constructor(thingyQuerier: ThingyQueryService, thingyService: ThingyService) {
        super();
        this.thingyQuerier = thingyQuerier;
        this.thingyService = thingyService;
    }

    getRoutes(router: Router): Router {
        router.post('/', this.addThingy);
        router.get('/', this.getAllThingys);
        return router;
    }

    addThingy = async (ctx: Router.IRouterContext) => {
        const thingyModel = <IThingy> ctx.request.body;
        const username = ctx.state.user.user.username;
        ctx.response.body = await this.thingyService.configureNewThingyDevice(thingyModel, username);
        ctx.response.status = 200;
    };

    getAllThingys = async (ctx: Router.IRouterContext) => {
        const username = ctx.state.user.user.username;
        ctx.response.body = await this.thingyQuerier.findAllThingyDevicesByUsername(username);
        ctx.response.status = 201;
    };

}
