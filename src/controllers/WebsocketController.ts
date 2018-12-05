import * as WebSocket from 'ws';
import {Server} from 'http';
import {ThingyQueryService} from '../service/database/ThingyQueryService';
import {EventBus} from '../service/EventBus';
import {ThingyDataEvent} from '../service/ThingyNotifyEventDispatchers';
import {MqttConnectionEvent} from '../service/MqttConnection';
import {ISimpleEventHandler} from 'strongly-typed-events';


export enum JSONProperty {
    CO2, Temperature, Pressure, Humidity, Mqtt,
}

export class WebsocketController {

    private server: WebSocket.Server;
    private sockets: Map<string, WebSocket> = new Map<string, WebSocket>();
    private thingyQueryService: ThingyQueryService;
    private eventbus: EventBus;
    private lastMqttEvent: MqttConnectionEvent;
    private handlers: Map<WebSocket, Map<[string, JSONProperty], ISimpleEventHandler<ThingyDataEvent|MqttConnectionEvent>>>;

    constructor(server: Server, thingyQueryService: ThingyQueryService, eventbus: EventBus) {
        this.thingyQueryService = thingyQueryService;
        this.handlers = new Map<WebSocket, Map<[string, JSONProperty], ISimpleEventHandler<ThingyDataEvent | MqttConnectionEvent>>>();
        this.eventbus = eventbus;
        this.server = new WebSocket.Server({server});
        this.eventbus.subscribeToMqtt(event => this.lastMqttEvent = event);
        this.server.on('connection', this.onConnection.bind(this));
    }

    private async onConnection(socket: WebSocket) {
        this.handlers.set(socket, new Map<[string,JSONProperty], ISimpleEventHandler<ThingyDataEvent|MqttConnectionEvent>>());
        socket.on('message', this.onMessage(socket).bind(this));
        socket.on('close', this.onClose(socket).bind(this));
        if (this.lastMqttEvent) {
            socket.send(JSON.stringify({
                property: JSONProperty.Mqtt,
                ...this.lastMqttEvent
            }));
        }
    }

    private onClose(socket: WebSocket) {
        return () => {
            let socketHandlers: Map<[string, JSONProperty], ISimpleEventHandler<ThingyDataEvent | MqttConnectionEvent>> = this.handlers.get(socket);
            socketHandlers.forEach((value, key) => {
                let thingyId = key[0];
                let property = key[1];
                switch (property) {
                    case JSONProperty.Mqtt:
                        this.eventbus.unsubscribeToMqtt(value);
                        break;
                    case JSONProperty.CO2:
                        this.eventbus.unsubscribeToAirQuality(value, thingyId);
                        break;
                    case JSONProperty.Humidity:
                        this.eventbus.unsubscribeToHumidity(value, thingyId);
                        break;
                    case JSONProperty.Pressure:
                        this.eventbus.unsubscribeToPressure(value, thingyId);
                        break;
                    case JSONProperty.Temperature:
                        this.eventbus.unsubscribeToTemperature(value, thingyId);
                        break;
                }
            });
            this.handlers.delete(socket);
        }
    }

    private onMessage(socket: WebSocket) {
        return async (message: string) => {
            let userName = JSON.parse(message);
            let thingys = await this.thingyQueryService.findAllThingyDevicesByUsername(userName);
            this.sockets.set(userName, socket);
            for (let thingy of thingys) {
                let thingyId = thingy.id;
                this.eventbus.subscribeToAirQuality(this.createAndRegisterHandler(socket, JSONProperty.CO2, thingyId), thingyId);
                this.eventbus.subscribeToTemperature(this.createAndRegisterHandler(socket, JSONProperty.Temperature, thingyId), thingyId);
                this.eventbus.subscribeToPressure(this.createAndRegisterHandler(socket, JSONProperty.Pressure, thingyId), thingyId);
                this.eventbus.subscribeToHumidity(this.createAndRegisterHandler(socket, JSONProperty.Humidity, thingyId), thingyId);
                this.eventbus.subscribeToMqtt(this.createAndRegisterHandler(socket, JSONProperty.Mqtt, thingyId));
            }
        };
    }

    private createAndRegisterHandler(websocket: WebSocket, property: JSONProperty, thingyId: string) {
        let handlers = this.handlers.get(websocket);
        let handler: ISimpleEventHandler<ThingyDataEvent|MqttConnectionEvent> = async (data: ThingyDataEvent | MqttConnectionEvent) => {
            websocket.send(JSON.stringify({
                property: property,
                ...data
            }));
        };
        handlers.set([thingyId, property], handler);
        return handler;
    }
}