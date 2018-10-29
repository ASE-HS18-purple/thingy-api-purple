import * as mongoose from 'mongoose';
import {readConfigFromFile} from '../util/index';

enum DatabaseConnectionState {
    Connected,
    Connecting,
    Disconnected,
    Error
}

class DatabaseConnection {
    private state: DatabaseConnectionState;

    constructor() {
        this.state = DatabaseConnectionState.Disconnected;
    }

    connect = async () => {
        this.state = DatabaseConnectionState.Connecting;
        const db = readConfigFromFile('DATABASE_URL', '../db-configs');
        const dbName = readConfigFromFile('DATABASE_NAME', '../db-configs');

        const mongoConnection = mongoose.connection;

        mongoConnection.on('error', (error: any) => {
            this.state = DatabaseConnectionState.Error;
            console.log('Error when trying to connect to database.');
            console.log('Error = ', error);
        });

        mongoConnection.on('connected', () => {
            this.state = DatabaseConnectionState.Connected;
            console.log('Connection to database successfully!');
        });

        await (function () {
            mongoose.connect(`${db}/${dbName}`, {
                useNewUrlParser: true,
            });
            this.state = DatabaseConnectionState.Connected
        }.bind(this))()

    };

}

export {DatabaseConnection};


