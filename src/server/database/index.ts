import * as mongoose from 'mongoose';
import {readConfigFromFile} from '../util';

const connect = async () => {
    const db = readConfigFromFile('DATABASE_URL', '../db-configs');
    const dbName = readConfigFromFile('DATABASE_NAME', '../db-configs');

    mongoose.connect(`${db}/${dbName}`, {
        useNewUrlParser: true,
    });

    const mongoConnection = mongoose.connection;

    mongoConnection.on('error', (error: any) => {
        console.log('Error when trying to connect to database.');
        console.log('Error = ', error);
    });

    mongoConnection.on('connected', () => {
        console.log('Connection to database successfully!');
    });
};

export {connect};


