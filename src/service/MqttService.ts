import {MqttConnection} from './MqttConnection';
import {IThingy} from '../models/Thingy';
import {EnvironmentalDataParserService} from './EnvironmentalDataParserService';
import {ThingyService} from './ThingyService';
import {ThingyQueryService} from './database/ThingyQueryService';
import {EnvironmentalDataQueryService} from './database/EnvironmentalDataQueryService';

export class MqttService {

    private static temperatureCharacteristic = '/ef680200-9b35-4933-9b10-52ffa9740042/ef680201-9b35-4933-9b10-52ffa9740042';
    private static pressureCharacteristic = '/ef680200-9b35-4933-9b10-52ffa9740042/ef680202-9b35-4933-9b10-52ffa9740042';
    private static humidityCharacteristic = '/ef680200-9b35-4933-9b10-52ffa9740042/ef680203-9b35-4933-9b10-52ffa9740042';
    private static airQualityCharacteristic = '/ef680200-9b35-4933-9b10-52ffa9740042/ef680204-9b35-4933-9b10-52ffa9740042';
    mqttConnection: MqttConnection;
    private environmentalDataParser: EnvironmentalDataParserService;
    private thingyQuerier: ThingyQueryService;
    private environmentalDataQueryService: EnvironmentalDataQueryService;

    constructor(mqttBrokerClient: MqttConnection, thingyQuerier: ThingyQueryService, environmentalDataQueryService: EnvironmentalDataQueryService, environmentalDataParser: EnvironmentalDataParserService) {
        this.mqttConnection = mqttBrokerClient;
        this.environmentalDataParser = environmentalDataParser;
        this.thingyQuerier = thingyQuerier;
        this.environmentalDataQueryService = environmentalDataQueryService;
    }

    public initSubscriptionToMqtt = async () => {
        let devices: IThingy[] = await this.thingyQuerier.findAllThingyDevices();
        if (devices) {
            let deviceIds: string[] = devices.map(thingy => thingy.deviceId);
            this.subscribeMany(deviceIds);
        }
    };

    public subscribeMany = async (deviceIds: string[]) => {
        for (let deviceId of deviceIds) {
            this.subscribe(deviceId);
        }
    };

    subscribe(deviceId: string) {
        const temperatureTopic = deviceId + MqttService.temperatureCharacteristic;
        const pressureTopic = deviceId + MqttService.pressureCharacteristic;
        const humidityTopic = deviceId + MqttService.humidityCharacteristic;
        const airQualityTopic = deviceId + MqttService.airQualityCharacteristic;
        this.mqttConnection.client.subscribe(temperatureTopic);
        this.mqttConnection.client.subscribe(pressureTopic);
        this.mqttConnection.client.subscribe(humidityTopic);
        this.mqttConnection.client.subscribe(airQualityTopic);
        this.setEventHandlers();
    }

    private setEventHandlers = async () => {
        this.mqttConnection.client.on('message', (topic: string, message: any) => {
            let environmentalVal: number;
            if (topic.endsWith(MqttService.temperatureCharacteristic)) {
                environmentalVal = this.environmentalDataParser.parseTemperature(message);
            }
            if (topic.endsWith(MqttService.pressureCharacteristic)) {
                environmentalVal = this.environmentalDataParser.parsePressure(message);
            }
            if (topic.endsWith(MqttService.humidityCharacteristic)) {
                environmentalVal = this.environmentalDataParser.parseHumidity(message);
            }
            if (topic.endsWith(MqttService.airQualityCharacteristic)) {
                environmentalVal = this.environmentalDataParser.parseAirQuality(message)[0];
            }
            this.storeEnvData(topic, environmentalVal);
        });
    };

    private async storeEnvData(topic: string, value: number) {
        const deviceId = topic.split('/')[0];
        const thingyDevices = await this.thingyQuerier.findThingyDeviceByDeviceId(deviceId);
        if (thingyDevices) {
            thingyDevices.forEach(async thingyDevice => {
                if (topic.endsWith(MqttService.temperatureCharacteristic)) {
                    await this.environmentalDataQueryService.storeTemperature(thingyDevice._id, value);
                }
                if (topic.endsWith(MqttService.pressureCharacteristic)) {
                    await this.environmentalDataQueryService.storePressure(thingyDevice._id, value);
                }
                if (topic.endsWith(MqttService.humidityCharacteristic)) {
                    await this.environmentalDataQueryService.storeHumidity(thingyDevice._id, value);
                }
                if (topic.endsWith(MqttService.airQualityCharacteristic)) {
                    await this.environmentalDataQueryService.storeCO2(thingyDevice._id, value);
                }
            });
        }
    }

}