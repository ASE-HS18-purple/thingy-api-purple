import * as mongoose from 'mongoose';
import * as Influx from 'influx';
import {readConfigFromFile} from '../util';

const connectToMongoDB = async () => {
    const db = readConfigFromFile('DATABASE_URL', '../db-configs');
    const dbName = readConfigFromFile('DATABASE_NAME', '../db-configs');

    mongoose.connect(`${db}/${dbName}`, {
        useNewUrlParser: true,
    });

    const mongoConnection = mongoose.connection;


    mongoConnection.on('error', (error: any) => {
        console.log('Error when trying to connectToMongoDB to database.');
        console.log('Error = ', error);
    });

    mongoConnection.on('connected', () => {
        console.log('Connection to database successfully!');
    });
};

const initInfluxDatabase = async () => {
    const influxDatabaseConn = await influxDatabaseClient();

    const database = 'ase-hs18';
    influxDatabaseConn.getDatabaseNames().then(dbNames => {
        if (dbNames && !dbNames.includes(database)) {
            influxDatabaseConn.createDatabase(database);
        }
    }).catch(error => {
        console.log('Error connecting to influx database! Error = ', error);
    });

};

const influxDatabaseClient = async () => {
    const host = 'localhost';
    const database = 'ase-hs18';

    const influxDbConnection = new Influx.InfluxDB({
        host: host,
        database: database,
        schema: [{
            measurement: 'temperature',
            fields: {
                value: Influx.FieldType.FLOAT,
            },
            tags: [
                'username',
                'location'
            ]
        }, {
            measurement: 'pressure',
            fields: {
                value: Influx.FieldType.FLOAT
            },
            tags: [
                'username',
                'location'
            ]
        }, {
            measurement: 'humidity',
            fields: {
                value: Influx.FieldType.FLOAT
            },
            tags: [
                'username',
                'location'
            ]
        }, {
            measurement: 'co2',
            fields: {
                value: Influx.FieldType.FLOAT
            },
            tags: [
                'username',
                'location'
            ]
        }],
    });
    return influxDbConnection;
};

export {connectToMongoDB, influxDatabaseClient, initInfluxDatabase};


