import * as mqtt from 'mqtt';
import {MqttClient} from 'mqtt';

enum MqttConnectionState {
    Connected = "Connected",
    Reconnecting = "Reconnecting",
    Disconnected = "Disconnected",
    Error = "Error"
}

class MqttConnection {
    private _connectionState: MqttConnectionState;
    client: MqttClient;
    private host: string;
    private port: number;
    private username: string;
    private password: string;

    constructor(host: string, port: number, username: string, passwort: string) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = passwort;
        this._connectionState = MqttConnectionState.Disconnected;
    }

    /**
     * Constructs the client to connect to our MQTT message broker and inits the connection to MQTT broker.
     * This method is called on system startup and in this way we are aware about the connection to MQTT broker.
     */
    public initConnection = () => {
        this.client = mqtt.connect({
            host: this.host,
            port: this.port,
            username: this.username,
            password: this.password,
        });

        this.client.on('connect', () => {
            console.log('Connected!');
            this._connectionState = MqttConnectionState.Connected
        });

        this.client.on('reconnect', () => {
            console.log('Reconnecting...!');
            this._connectionState = MqttConnectionState.Reconnecting
        });

        this.client.on('close', () => {
            console.log('Disconnection...');
            this._connectionState = MqttConnectionState.Disconnected
        });
    };

    get connectionState(): MqttConnectionState {
        return this._connectionState;
    }
}

export {MqttConnection};
