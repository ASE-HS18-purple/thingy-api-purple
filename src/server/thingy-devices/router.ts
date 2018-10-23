import * as Router from 'koa-router';
import {ThingyDevicesHandler} from './handler';

const router = new Router();

router.post('/', async (ctx) => {
    const thingyModel = ctx.request.body;
    const thingDeviceHandler = new ThingyDevicesHandler();
    const username = ctx.state.user.user.username;
    const configuredThingy = await thingDeviceHandler.configureNewThingDevice(thingyModel, username);
    ctx.response.body = configuredThingy;
    ctx.response.status = 200;
});

router.get('/', async (ctx) => {
    const username = ctx.state.user.user.username;
    const thingyDeviceHandler = new ThingyDevicesHandler();
    const thingyDevices = await thingyDeviceHandler.findAllThingyDevicesByUsername(username);
    ctx.response.body = thingyDevices;
    ctx.response.status = 201;
});

export const thingyDevicesRouter = router.routes();
