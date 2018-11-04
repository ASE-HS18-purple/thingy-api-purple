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

router.get('/:id', async (ctx) => {
    const id = ctx.params.id;
    const thingDeviceHandler = new ThingyDevicesHandler();
    const username = ctx.state.user.user.username;
    const foundThingyDevice = await thingDeviceHandler.findThingyById(id, username);
    ctx.response.body = foundThingyDevice;
    ctx.response.status = foundThingyDevice ? 200 : 404;
});

router.put('/:id', async (ctx) => {
    const id = ctx.params.id;
    const thingyDeviceHandler = new ThingyDevicesHandler();
    const username = ctx.state.user.user.username;
    const thingyDevice = ctx.request.body;
    const updatedThingyDeviceHandler = await thingyDeviceHandler.updateThingyDeviceByLocationId(id, (thingyDevice as any).deviceId, username);
    ctx.response.body = updatedThingyDeviceHandler;
    ctx.response.status = updatedThingyDeviceHandler ? 200 : 400;
});

router.delete('/:id', async (ctx) => {
    const id = ctx.params.id;
    const thingyDeviceHandler = new ThingyDevicesHandler();
    const username = ctx.state.user.user.username;
    const deleted = await thingyDeviceHandler.deleteThingyDevice(id, username);
    ctx.response.status = deleted ? 200 : 400;
});

export const thingyDevicesRouter = router.routes();
