import * as mqtt from 'mqtt';
import {MqttClient} from 'mqtt';
import {readConfigFromFile} from '../util/index';

enum MqttConnectionState {
    Connected,
    Reconnecting,
    Disconnected,
    Error
}

class MqttConnection {
    private connectionState: MqttConnectionState;
    private client: MqttClient;

    constructor() {
        this.connectionState = MqttConnectionState.Disconnected;
    }

    /**
     * Constructs the client to connect to our MQTT message broker.
     */
    private mqttBrokerClient = () => {
        const host = readConfigFromFile('mqtt', '../mqtt-broker-credentials');
        const port = readConfigFromFile('port', '../mqtt-broker-credentials');
        const username = readConfigFromFile('username', '../mqtt-broker-credentials');
        const password = readConfigFromFile('password', '../mqtt-broker-credentials');

        this.client = mqtt.connect({
            host: host,
            port: port,
            username: username,
            password: password,
        });
    };

    /**
     * Init the connection to MQTT broker.
     * This method is called on system startup and in this way we are aware about the connection to MQTT broker.
     */
    public initConnection = () => {
        const client = this.mqttBrokerClient();

        this.client.on('connect', () => {
            console.log('Connected!');
            this.connectionState = MqttConnectionState.Connected
        });

        this.client.on('reconnect', () => {
            console.log('Reconnecting...!');
            this.connectionState = MqttConnectionState.Reconnecting
        });

        this.client.on('close', () => {
            console.log('Disconnection...');
            this.connectionState = MqttConnectionState.Disconnected
        });
    };

}

export {MqttConnection};
