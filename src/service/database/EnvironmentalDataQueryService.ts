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

    public async getTemperatureData(from: number, to: number, configId: string) {
        return await this.queryEnvData(from, to, configId, 'temperature');
    }

    public async getPressureData(from: number, to: number, configId: string) {
        return await this.queryEnvData(from, to, configId, 'pressure');
    }

    public async getHumidityData(from: number, to: number, configId: string) {
        return await this.queryEnvData(from, to, configId, 'humidity');
    }

    public async getAirQualityData(from: number, to: number, configId: string) {
        return await this.queryEnvData(from, to, configId, 'co2');
    }


    private async queryEnvData(from: number, to: number, configId: string, measurement: string) {
        const fromDate = new Date(from).toISOString();
        const toDate = new Date(to).toISOString();
        const query = ` SELECT time, value FROM ${measurement} WHERE configId = '${configId}' AND time > '${fromDate}' AND time < '${toDate}'`;
        const data = this.influxDatabase.getInFluxDbClient().query(query);
        return data;
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
