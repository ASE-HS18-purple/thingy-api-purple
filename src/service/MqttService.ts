import {MqttConnection} from './MqttConnection';
import {IThingy} from '../models/Thingy';
import {EnvironmentalDataParserService} from './EnvironmentalDataParserService';
import {ThingyService} from './ThingyService';
import {ThingyQueryService} from './database/ThingyQueryService';
import {EventBus} from './EventBus';


export class MqttService {

    private static temperatureCharacteristic = '/ef680200-9b35-4933-9b10-52ffa9740042/ef680201-9b35-4933-9b10-52ffa9740042';
    private static pressureCharacteristic = '/ef680200-9b35-4933-9b10-52ffa9740042/ef680202-9b35-4933-9b10-52ffa9740042';
    private static humidityCharacteristic = '/ef680200-9b35-4933-9b10-52ffa9740042/ef680203-9b35-4933-9b10-52ffa9740042';
    private static airQualityCharacteristic = '/ef680200-9b35-4933-9b10-52ffa9740042/ef680204-9b35-4933-9b10-52ffa9740042';
    private mqttConnection: MqttConnection;
    private environementalDataParser: EnvironmentalDataParserService;
    private thingyQuerier: ThingyQueryService;
    private eventBus: EventBus;

    constructor(mqttBrokerClient: MqttConnection, thingyQuerier: ThingyQueryService, environmentalDataParser: EnvironmentalDataParserService, eventBus: EventBus) {
        this.mqttConnection = mqttBrokerClient;
        this.environementalDataParser = environmentalDataParser;
        this.thingyQuerier = thingyQuerier;
        this.eventBus = eventBus;
    }

    public initSubscriptionToMqtt = async () => {
        let devices: IThingy[] = await this.thingyQuerier.findAllThingyDevices();
        if (devices) {
            let deviceIds: string[] = devices.map(thingy => thingy.deviceId);
            this.subscribeMany(deviceIds);
        }
        this.setEventHandlers();
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
    }

    private setEventHandlers = () => {
        this.mqttConnection.client.on('message', (topic: string, message: any) => {
            this.eventBus.
            if (topic.endsWith(MqttService.temperatureCharacteristic)) {
                this.environementalDataParser.parseTemperature(message);
            }
            if (topic.endsWith(MqttService.pressureCharacteristic)) {
                this.environementalDataParser.parsePressure(message);
            }
            if (topic.endsWith(MqttService.humidityCharacteristic)) {
                this.environementalDataParser.parseHumidity(message);
            }
            if (topic.endsWith(MqttService.airQualityCharacteristic)) {
                this.environementalDataParser.parseAirQuality(message);
            }
        });
    };

}