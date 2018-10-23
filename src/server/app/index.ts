import * as cors from '@koa/cors';
import * as bodyParser from 'koa-bodyparser';
import * as Koa from 'koa';
import {enableSecurity} from '../authentication';
import * as mqttBrokerConnection from '../mqtt-broker-connection';
import {initSubscriptionToMqtt} from '../message-handler';

import {routes} from '../routing';
import {readConfigFromFile} from '../util';

import {connect as connectToMongoDb} from '../database';

const start = async () => {
    const port = readConfigFromFile('SERVER_PORT', '../server-configs');
    console.log('Starting the app...');
    const app = new Koa();
    app.use(cors());
    app.use(enableSecurity);
    app.use(bodyParser());
    app.use(routes);
    await app.listen(port);
    console.log(`App is up and running and listening to port: ${port}`);
    console.log('Initiating database connection');
    await connectToMongoDb();
    mqttBrokerConnection.initConnection();
    initSubscriptionToMqtt();
};

export {start};
