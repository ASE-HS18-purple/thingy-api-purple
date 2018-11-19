export namespace Configuration {

    interface MongoDatabase {
        DATABASE_URL: string,
        DATABASE_NAME: string
    }

    interface InfluxDatabase {
        DATABASE_URL: string,
        DATABASE_NAME: string
    }

    interface Auth {
        SECRET_KEY: string
    }

    interface Mqtt {
        mqtt: string,
        port: number,
        username: string,
        password: string
    }

    interface Server {
        SERVER_PORT: number,
        PUBLIC_APIS: Array<string>
    }

    export class Loader {

        private path: string;

        public mongoDatabaseCfg: MongoDatabase;
        public influxDatabaseCfg: InfluxDatabase;
        public authConfig: Auth;
        public mqttConfig: Mqtt;
        public serverConfig: Server;

        constructor(path: string) {
            this.path = path;
        }

        public load = () => {
            this.mongoDatabaseCfg = require(this.path + '/mongo-db-configs.json');
            this.influxDatabaseCfg = require(this.path + '/influx-db-configs.json');
            this.authConfig = require(this.path + '/auth-configs.json');
            this.mqttConfig = require(this.path + '/mqtt-broker-credentials.json');
            this.serverConfig = require(this.path + '/server-configs.json');
        }
    }

}