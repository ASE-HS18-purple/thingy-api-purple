import * as WebSocket from 'ws';
import {Server} from 'http';
import {ThingyQueryService} from '../service/database/ThingyQueryService';
import {EventBus} from '../service/EventBus';
import {ThingyDataEvent} from '../service/ThingyNotifyEventDispatchers';
import {MqttConnectionEvent} from '../service/MqttConnection';


export enum JSONProperty {
    AIRQUALITY, TEMPERATURE, PRESSURE, HUMIDITY, MQTT
}

export class WebsocketController {

    private server: WebSocket.Server;
    private sockets: Map<string, WebSocket> = new Map<string, WebSocket>();
    private thingyQueryService: ThingyQueryService;
    private eventbus: EventBus;
    private lastMqttEvent: MqttConnectionEvent;

    constructor(server: Server, thingyQueryService: ThingyQueryService, eventbus: EventBus) {
        this.thingyQueryService = thingyQueryService;
        this.eventbus = eventbus;
        this.server = new WebSocket.Server({server});
        this.eventbus.subscribeToMqtt(event => this.lastMqttEvent = event);
        this.server.on('connection', this.onConnection.bind(this));
    }

    private async onConnection(socket: WebSocket) {
        socket.on('message', this.onMessage(socket).bind(this));
        if (this.lastMqttEvent) {
            this.dataAvailableHandler(socket, JSONProperty.MQTT)(this.lastMqttEvent);
        }
    }

    private onMessage(socket: WebSocket) {
        return async (message: string) => {
            let userName = JSON.parse(message);
            let thingys = await this.thingyQueryService.findAllThingyDevicesByUsername(userName);
            this.sockets.set(userName, socket);
            for (let thingy of thingys) {
                let thingyId = thingy.id;
                this.eventbus.subscribeToAirQuality(this.dataAvailableHandler(socket, JSONProperty.AIRQUALITY), thingyId);
                this.eventbus.subscribeToTemperature(this.dataAvailableHandler(socket, JSONProperty.TEMPERATURE), thingyId);
                this.eventbus.subscribeToPressure(this.dataAvailableHandler(socket, JSONProperty.PRESSURE), thingyId);
                this.eventbus.subscribeToHumidity(this.dataAvailableHandler(socket, JSONProperty.HUMIDITY), thingyId);
                this.eventbus.subscribeToMqtt(this.dataAvailableHandler(socket, JSONProperty.MQTT));
            }
        };
    }

    private dataAvailableHandler(websocket: WebSocket, property: JSONProperty) {
        return async (data: ThingyDataEvent|MqttConnectionEvent) => {
            websocket.send(JSON.stringify({
                property: property,
                ...data
            }));
        }
    }
}