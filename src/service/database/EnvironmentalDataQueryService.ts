import {InfluxDatabaseConnection} from './InfluxDatabaseConnection';
import {IQueryOptions, IResults} from 'influx';

export class EnvironmentalDataQueryService {

    private influxDatabase: InfluxDatabaseConnection;

    constructor(influxDatabaseService: InfluxDatabaseConnection) {
        this.influxDatabase = influxDatabaseService;
    }

    public async storeTemperature(configId: string, value: number) {
        await this.storeEnvData(configId, value, 'temperature');
    }

    public async storeHumidity(configId: string, value: number) {
        await this.storeEnvData(configId, value, 'humidity');
    }

    public async storePressure(configId: string, value: number) {
        await this.storeEnvData(configId, value, 'pressure');
    }

    public async storeCO2(configId: string, value: number) {
        await this.storeEnvData(configId, value, 'co2');
    }

    public async getTemperatureData(from: number, to: number, configId: string) {
        return await this.queryEnvData(from, to, configId, 'temperature');
    }

    private async queryEnvData(from: number, to: number, configId: string, measurement: string) {
        const fromDate = new Date(new Number(from)).toISOString();
        const toDate = new Date(new Number(to)).toISOString();
        console.log(fromDate);
        console.log(toDate);
        const query = ` SELECT time, value FROM ${measurement} WHERE configId = '${configId}' AND time > '${fromDate}' AND time < '${toDate}'`;
        const data = this.influxDatabase.getInFluxDbClient().query(query);
        return data;
    }

    private async storeEnvData(configId: string, value: number, measurement: string) {
        const influxDbClient = this.influxDatabase.getInFluxDbClient();
        await influxDbClient.writePoints([{
            measurement: measurement,
            tags: {
                configId: configId,
            },
            fields: {
                value: value,
            }
        }]);
    }
}

export class EnvironmentalData {
    unit: string;
    datasets: {
        id: string,
        thingyName: string,
        properties: {
            value: number,
            time: string;
        }[]
    }[];
}
