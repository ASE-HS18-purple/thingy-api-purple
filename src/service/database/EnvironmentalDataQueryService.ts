import {InfluxDatabaseConnection} from './InfluxDatabaseConnection';
import {EventBus} from '../EventBus';
import {ThingyDataEvent} from '../ThingyNotifyEventDispatchers';

export enum Measurement {
    Temperature = 'temperature',
    Humidity = 'humidity',
    Pressure = 'pressure',
    CO2 = 'co2',
}

export enum AggregatedMeasurment {
    Temperature = 'average_temperature',
    Humidity = 'average_humidity',
    Pressure = 'average_pressure',
    CO2 = 'average_co2',
}

export class EnvironmentalDataQueryService {

    private influxDatabase: InfluxDatabaseConnection;
    private eventbus: EventBus;

    constructor(influxDatabaseService: InfluxDatabaseConnection, eventbus: EventBus) {
        this.influxDatabase = influxDatabaseService;
        this.eventbus = eventbus;
        this.initSubscriptions();
    }

    public initSubscriptions() {
        this.eventbus.subscribeToAirQuality(this.storeMeasurement(Measurement.CO2));
        this.eventbus.subscribeToTemperature(this.storeMeasurement(Measurement.Temperature));
        this.eventbus.subscribeToPressure(this.storeMeasurement(Measurement.Pressure));
        this.eventbus.subscribeToHumidity(this.storeMeasurement(Measurement.Humidity));
    }

    private storeMeasurement(property: Measurement) {
        return async (thingyData: ThingyDataEvent) => {
            this.storeEnvData(thingyData.thingyId, thingyData.value, property);
        }
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
        return await this.queryEnvData(from, to, configId, AggregatedMeasurment.Temperature);
    }

    public async getPressureData(from: number, to: number, configId: string) {
        return await this.queryEnvData(from, to, configId, AggregatedMeasurment.Pressure);
    }

    public async getHumidityData(from: number, to: number, configId: string) {
        return await this.queryEnvData(from, to, configId, AggregatedMeasurment.Humidity);
    }

    public async getAirQualityData(from: number, to: number, configId: string) {
        return await this.queryEnvData(from, to, configId, AggregatedMeasurment.CO2);
    }


    private async queryEnvData(from: number, to: number, configId: string, measurement: AggregatedMeasurment) {
        const fromDate = new Date(Number(from)).toISOString();
        const toDate = new Date(Number(to)).toISOString();
        const query = ` SELECT time, value FROM ${measurement} WHERE configId = '${configId}' AND time > '${fromDate}' AND time < '${toDate}'`;
        const data = this.influxDatabase.getInFluxDbClient().query(query);
        return data;
    }

    public async getTemperatureLastStoredProperty(configId: string) {
        return await this.getLastStoredProperty(configId, Measurement.Temperature);
    }

    public async getHumidityLastStoredProperty(configId: string) {
        return await this.getLastStoredProperty(configId, Measurement.Humidity);
    }

    public async getPressureLastStoredProperty(configId: string) {
        return await this.getLastStoredProperty(configId, Measurement.Pressure);
    }

    public async getCo2LastStoredProperty(configId: string) {
        return await this.getLastStoredProperty(configId, Measurement.CO2);
    }

    private async getLastStoredProperty(configId: string, measurement: Measurement) {
        const query = ` SELECT time, value FROM ${measurement} WHERE configId = '${configId}' ORDER BY DESC LIMIT 1`;
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
