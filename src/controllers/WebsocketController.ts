import * as WebSocket from 'ws';
import {Server} from 'http';
import {ThingyQueryService} from '../service/database/ThingyQueryService';
import {EventBus} from '../service/EventBus';
import {ThingyDataEvent} from '../service/ThingyNotifyEvents';


export class WebsocketController {

    private server: WebSocket.Server;
    private sockets: Map<string, WebSocket> = new Map<string, WebSocket>();
    private thingyQueryService: ThingyQueryService;
    private eventbus: EventBus;

    constructor(server: Server, thingyQueryService: ThingyQueryService, eventbus: EventBus) {
        this.thingyQueryService = thingyQueryService;
        this.eventbus = eventbus;
        this.server = new WebSocket.Server({server});
        this.server.on('connection', this.onConnection.bind(this));
    }

    private async onConnection(socket: WebSocket) {
        socket.on('message', this.onMessage(socket).bind(this));
    }

    private onMessage(socket: WebSocket) {
        return async (message: string) => {
            let userName = JSON.parse(message);
            let thingys = await this.thingyQueryService.findAllThingyDevicesByUsername(userName);
            this.sockets.set(userName, socket);
            for (let thingy of thingys) {
                let thingyId = thingy.deviceId;
                this.eventbus.subscribeToAirQuality(this.dataAvailableHandler(socket, 'airquality'), thingyId);
                this.eventbus.subscribeToTemperature(this.dataAvailableHandler(socket, 'temperature'), thingyId);
                this.eventbus.subscribeToPressure(this.dataAvailableHandler(socket, 'pressure'), thingyId);
                this.eventbus.subscribeToHumidity(this.dataAvailableHandler(socket, 'humidity'), thingyId);
            }
        };
    }

    private dataAvailableHandler(websocket: WebSocket, property: string) {
        return async (data: ThingyDataEvent) => {
            websocket.send(JSON.stringify({
                property: property,
                ...data
            }));
        }
    }
}