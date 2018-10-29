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

router.put('/:id', async (ctx) => {
    const locationId = ctx.params.id;
    const thingyDeviceHandler = new ThingyDevicesHandler();
    const username = ctx.state.user.user.username;
    const thingyDevice = ctx.request.body;
    const updatedThingyDeviceHandler = await thingyDeviceHandler.updateThingyDeviceByLocationId(locationId, (thingyDevice as any).deviceId, username);
    ctx.response.body = updatedThingyDeviceHandler;
    ctx.response.status = updatedThingyDeviceHandler ? 200 : 400;
});

export const thingyDevicesRouter = router.routes();
