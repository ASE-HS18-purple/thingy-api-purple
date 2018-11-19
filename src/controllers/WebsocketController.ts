import * as Router from 'koa-router';
import * as WebSocket from 'ws';
import {IncomingMessage, Server} from 'http';
import * as jwt from 'jsonwebtoken';

export class WebsocketController {

    private server: WebSocket.Server;
    private secretKey: string;

    constructor(server: Server, secretKey: string) {
        this.secretKey = secretKey;
        this.server = new WebSocket.Server({server});
        this.server.on('connection', this.onConnection)
        this.server.on('message', this.onMessage)
    }

    private async onConnection(socket: WebSocket, request: IncomingMessage) {
        // console.log(request);
    }

    private async onMessage(message: string) {
        let user = await jwt.verify(message, this.secretKey);
        console.log(message);
    }
}