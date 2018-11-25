import * as Router from 'koa-router';
import * as WebSocket from 'ws';
import {IncomingMessage, Server} from 'http';
import * as jwt from 'jsonwebtoken';
import {json} from 'body-parser';
import {ThingyQueryService} from '../service/database/ThingyQueryService';

export class WebsocketController {

    private server: WebSocket.Server;
    private sockets: Map<string, WebSocket> = new Map<string, WebSocket>();
    private thingyQueryService: ThingyQueryService;

    constructor(server: Server, thingyQueryService: ThingyQueryService) {
        this.thingyQueryService = thingyQueryService;
        this.server = new WebSocket.Server({server});
        this.server.on('connection', this.onConnection.bind(this));
    }

    private async onConnection(socket: WebSocket, request: IncomingMessage) {
        socket.on('message', this.onMessage(socket).bind(this));
    }

    private onMessage(socket: WebSocket) {
        return async (message: string) => {
            let parsed = JSON.parse(message);
            this.sockets.set(parsed, socket);
        };
    }
}