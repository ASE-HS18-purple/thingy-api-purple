import * as mongoose from 'mongoose';

enum DatabaseConnectionState {
    Connected,
    Connecting,
    Disconnected,
    Error
}

class MongoDatabaseConnection {
    private state: DatabaseConnectionState;
    private dbUrl: string;
    private dbName: string;

    constructor(dbUrl: string, dbName: string) {
        this.state = DatabaseConnectionState.Disconnected;
        this.dbUrl = dbUrl;
        this.dbName = dbName;
    }

    connect = async () => {
        this.state = DatabaseConnectionState.Connecting;

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

        await (() => {
            mongoose.connect(`${this.dbUrl}/${this.dbName}`, {
                useNewUrlParser: true,
            });
            this.state = DatabaseConnectionState.Connected
        })()

    };

}

export {MongoDatabaseConnection};


