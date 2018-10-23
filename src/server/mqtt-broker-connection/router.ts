import * as Router from 'koa-router';
import {retrieveBrokerConnectionState} from './handler';

const router = new Router();

router.get('/state', async (ctx) => {
    const connectionState = await retrieveBrokerConnectionState();
    ctx.response.body = connectionState;
    ctx.status = 200;
});

export const mqttConnection = router.routes();
