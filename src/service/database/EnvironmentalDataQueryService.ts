import {InfluxDatabaseConnection} from './InfluxDatabaseConnection';
import {EventBus} from '../EventBus';
import {ThingyDataEvent} from '../ThingyNotifyEventDispatchers';
import {ThingyQueryService} from './ThingyQueryService';

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

    private knownConfigurationIdsByThingyId: Map<string, string[]>;

    constructor(private influxDatabase: InfluxDatabaseConnection, private eventbus: EventBus, private thingyQueryService: ThingyQueryService) {
        this.initSubscriptions();
        this.knownConfigurationIdsByThingyId = new Map();
        this.loadConfigurationIds();
    }

    private async loadConfigurationIds() {
        let thingys = await this.thingyQueryService.findAllThingyDevices();
        console.log(thingys);
        for (let thingy of thingys) {
            let deviceId = thingy.deviceId;
            let configurationId = thingy.id;
            let configurationIds = this.knownConfigurationIdsByThingyId.get(deviceId);
            if (!configurationIds) {
                configurationIds = [];
            }
            configurationIds.push(configurationId);
            this.knownConfigurationIdsByThingyId.set(deviceId, configurationIds);
        }
    }

    public initSubscriptions() {
        this.eventbus.subscribeToAirQuality(this.storeMeasurement(Measurement.CO2));
        this.eventbus.subscribeToTemperature(this.storeMeasurement(Measurement.Temperature));
        this.eventbus.subscribeToPressure(this.storeMeasurement(Measurement.Pressure));
        this.eventbus.subscribeToHumidity(this.storeMeasurement(Measurement.Humidity));
    }

    private storeMeasurement(property: Measurement) {
        return async (thingyData: ThingyDataEvent) => {
            let configurationIds = this.knownConfigurationIdsByThingyId.get(thingyData.thingyId);
            console.log("Thisi");
            console.log(thingyData.thingyId);
            console.log(configurationIds);
            if (!configurationIds) {
                this.loadConfigurationIds();
                configurationIds = this.knownConfigurationIdsByThingyId.get(thingyData.thingyId);
            }
            for (let configurationId in configurationIds) {
                console.log('Storing with');
                console.log(configurationId);
                this.storeEnvData(configurationId, thingyData.value, property);
            }
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
