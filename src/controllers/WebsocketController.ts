import * as WebSocket from 'ws';
import {Server} from 'http';
import {ThingyQueryService} from '../service/database/ThingyQueryService';
import {EventBus} from '../service/EventBus';
import {ThingyDataEvent} from '../service/ThingyNotifyEventDispatchers';
import {MqttConnectionEvent} from '../service/MqttConnection';
import {ISimpleEventHandler} from 'strongly-typed-events';
import {AlarmEvent} from '../service/AlarmService';
import {IThingy, Thingy} from '../models/Thingy';

export enum DataType {
    CO2, Temperature, Pressure, Humidity, Mqtt, Alarm,
}

export class WebsocketController {

    private server: WebSocket.Server;
    private sockets: Map<string, WebSocket> = new Map<string, WebSocket>();
    private thingyQueryService: ThingyQueryService;
    private eventbus: EventBus;
    private lastMqttEvent: MqttConnectionEvent;
    private handlers: Map<WebSocket, Map<[string, DataType], ISimpleEventHandler<ThingyDataEvent | MqttConnectionEvent | AlarmEvent>>>;

    constructor(server: Server, thingyQueryService: ThingyQueryService, eventbus: EventBus) {
        this.thingyQueryService = thingyQueryService;
        this.handlers = new Map<WebSocket, Map<[string, DataType], ISimpleEventHandler<ThingyDataEvent | MqttConnectionEvent | AlarmEvent>>>();
        this.eventbus = eventbus;
        this.server = new WebSocket.Server({server});
        this.eventbus.subscribeToMqtt(event => this.lastMqttEvent = event);
        this.eventbus.subscribeToConfigurationAdded(event => this.subscribeToThingy(event.thingy, event.username));
        this.server.on('connection', this.onConnection.bind(this));
    }

    private async onConnection(socket: WebSocket) {
        this.handlers.set(socket, new Map<[string, DataType], ISimpleEventHandler<ThingyDataEvent | MqttConnectionEvent | AlarmEvent>>());
        socket.on('message', this.onMessage(socket).bind(this));
        socket.on('close', this.onClose(socket).bind(this));
        if (this.lastMqttEvent) {
            socket.send(JSON.stringify({
                property: DataType.Mqtt,
                ...this.lastMqttEvent
            }));
        }
    }

    private onClose(socket: WebSocket) {
        return () => {
            const socketHandlers: Map<[string, DataType], ISimpleEventHandler<ThingyDataEvent | MqttConnectionEvent | AlarmEvent>> = this.handlers.get(socket);
            socketHandlers.forEach((value, key) => {
                const thingyId = key[0];
                const property = key[1];
                switch (property) {
                    case DataType.Mqtt:
                        this.eventbus.unsubscribeToMqtt(value);
                        break;
                    case DataType.CO2:
                        this.eventbus.unsubscribeToAirQuality(value, thingyId);
                        break;
                    case DataType.Humidity:
                        this.eventbus.unsubscribeToHumidity(value, thingyId);
                        break;
                    case DataType.Pressure:
                        this.eventbus.unsubscribeToPressure(value, thingyId);
                        break;
                    case DataType.Temperature:
                        this.eventbus.unsubscribeToTemperature(value, thingyId);
                        break;
                    case DataType.Alarm:
                        this.eventbus.unsubscribeToAlarm(value);
                        break;
                }
            });
            this.handlers.delete(socket);
        }
    }

    private onMessage(socket: WebSocket) {
        return async (message: string) => {
            const userName = JSON.parse(message);
            const thingys = await this.thingyQueryService.findAllThingyDevicesByUsername(userName);
            this.sockets.set(userName, socket);
            for (let thingy of thingys) {
                this.subscribeToThingy(thingy, userName);
            }
            this.eventbus.subscribeToAlarm(this.createAndRegisterHandler(socket, DataType.Alarm));
        };
    }

    private subscribeToThingy(thingy: IThingy, username: string) {
        const socket = this.sockets.get(username);
        const thingyId = thingy.id;
        this.eventbus.subscribeToAirQuality(this.createAndRegisterHandler(socket, DataType.CO2, thingyId), thingyId);
        this.eventbus.subscribeToTemperature(this.createAndRegisterHandler(socket, DataType.Temperature, thingyId), thingyId);
        this.eventbus.subscribeToPressure(this.createAndRegisterHandler(socket, DataType.Pressure, thingyId), thingyId);
        this.eventbus.subscribeToHumidity(this.createAndRegisterHandler(socket, DataType.Humidity, thingyId), thingyId);
        this.eventbus.subscribeToMqtt(this.createAndRegisterHandler(socket, DataType.Mqtt, thingyId));
    }

    private createAndRegisterHandler(websocket: WebSocket, property: DataType, thingyId?: string) {
        const handlers = this.handlers.get(websocket);
        const handler: ISimpleEventHandler<ThingyDataEvent | MqttConnectionEvent | AlarmEvent> = async (data: ThingyDataEvent | MqttConnectionEvent | AlarmEvent) => {
            websocket.send(JSON.stringify({
                property: property,
                ...data
            }));
        };
        handlers.set([thingyId, property], handler);
        return handler;
    }
}