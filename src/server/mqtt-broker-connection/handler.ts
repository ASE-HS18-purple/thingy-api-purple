import * as mqtt from 'mqtt';
import {readConfigFromFile} from '../util';
import {BrokerConnection} from './model';

/**
 * Constructs the client to connectToMongoDB to our MQTT message broker.
 */
const mqttBrokerClient = () => {
    const host = readConfigFromFile('mqtt', '../mqtt-broker-credentials');
    const port = readConfigFromFile('port', '../mqtt-broker-credentials');
    const username = readConfigFromFile('username', '../mqtt-broker-credentials');
    const password = readConfigFromFile('password', '../mqtt-broker-credentials');

    const client = mqtt.connect({
        host: host,
        port: port,
        username: username,
        password: password,
    });
    return client;
};

/**
 * Init the connection to MQTT broker.
 * This method is called on system startup and in this way we are aware about the connection to MQTT broker.
 */
const initConnection = () => {
    const client = mqttBrokerClient();

    client.on('connect', () => {
        console.log('Connected!');
        storeOrUpdateBrokerConnection(new BrokerConnection({
            state: 'Connected',
        }));
    });

    client.on('reconnect', () => {
        console.log('Reconnecting...!');
        storeOrUpdateBrokerConnection(new BrokerConnection({
            state: 'Reconnecting',
        }));
    });

    client.on('close', () => {
        console.log('Disconnection...');
        storeOrUpdateBrokerConnection(new BrokerConnection({
            state: 'Disconnected',
        }));
    });
};

/**
 * Persist the stat of the connection to MQTT broker in database.
 * @param brokerConnection
 */
const storeOrUpdateBrokerConnection = async (brokerConnection: any) => {
    // Search the whole collection
    const brokerConnectionState = await BrokerConnection.find({});
    // If nothing found store new entry - typical when system is deployed for the first time.
    if (!brokerConnectionState || brokerConnectionState.length == 0) {
        return await brokerConnection.save();
    } else if (brokerConnectionState && brokerConnectionState.length == 1) {
        // If exactly one found - update it.
        const id = brokerConnectionState[0]._id;
        return await BrokerConnection.update({_id: id}, {
            state: brokerConnection.state,
        });
    } else {
        // We are in a strange situation. This collection should contain only one entry all time - reflecting the
        // to MQTT broker connection state.
        await BrokerConnection.deleteMany({});
        return await brokerConnection.save();
    }
};

/**
 * Get the latest state from database for the broker connection.
 */
const retrieveBrokerConnectionState = async () => {
    return await BrokerConnection.findOne({});
};

export {initConnection, mqttBrokerClient, retrieveBrokerConnectionState};
