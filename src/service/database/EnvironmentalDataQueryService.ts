import {InfluxDatabaseConnection} from './InfluxDatabaseConnection';

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

}