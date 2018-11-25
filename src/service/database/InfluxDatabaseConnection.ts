import * as Influx from 'influx';

export class InfluxDatabaseConnection {

    private url: string;
    private database: string;
    private influxDbClient: Influx.InfluxDB;

    constructor(url: string, database: string) {
        this.url = url;
        this.database = database;
        this.influxDbClient = this.constructClient();
    }

    public getInFluxDbClient(): Influx.InfluxDB {
        return this.influxDbClient;
    }

    connect = async () => {
        console.log('About to connect to influx database...');
        const influxDatabaseConn = await this.influxDbClient;
        influxDatabaseConn.getDatabaseNames()
            .then(dbNames => {
                console.log('Influx database names = ', dbNames);
                if (dbNames && !dbNames.includes(this.database)) {
                    influxDatabaseConn.createDatabase(this.database);
                }
            })
            .catch(error => {
                console.log('Error connecting to influx database! Error = ', error);
            });
        await influxDatabaseConn.createContinuousQuery('downsample_temperature',
            'SELECT mean(value) as value INTO average_temperature ' +
            'FROM temperature GROUP BY time(1m), *', this.database);
        await influxDatabaseConn.createContinuousQuery('downsample_humidity',
            'SELECT mean(value) as value INTO average_humidity ' +
            'FROM humidity GROUP BY time(1m), *', this.database);
        await influxDatabaseConn.createContinuousQuery('downsample_pressure',
            'SELECT mean(value) as value INTO average_pressure ' +
            'FROM pressure GROUP BY time(1m), *', this.database);
        await influxDatabaseConn.createContinuousQuery('downsample_co2',
            'SELECT mean(value) as value INTO average_co2 ' +
            'FROM co2 GROUP BY time(1m), *', this.database);
    };

    private constructClient(): Influx.InfluxDB {
        const influxDbConnection = new Influx.InfluxDB({
            host: this.url,
            database: this.database,
            schema: [{
                measurement: 'temperature',
                fields: {
                    value: Influx.FieldType.FLOAT,
                },
                tags: [
                    'configId'
                ]
            }, {
                measurement: 'pressure',
                fields: {
                    value: Influx.FieldType.FLOAT
                },
                tags: [
                    'configId'
                ]
            }, {
                measurement: 'humidity',
                fields: {
                    value: Influx.FieldType.FLOAT
                },
                tags: [
                    'configId'
                ]
            }, {
                measurement: 'co2',
                fields: {
                    value: Influx.FieldType.FLOAT
                },
                tags: [
                    'configId'
                ]
            }],
        });
        return influxDbConnection;
    };

}