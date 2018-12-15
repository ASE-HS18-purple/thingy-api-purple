import {MqttConnection} from './MqttConnection';
import {IThingy} from '../models/Thingy';
import {EnvironmentalDataParserService} from './EnvironmentalDataParserService';
import {ThingyService} from './ThingyService';
import {ThingyQueryService} from './database/ThingyQueryService';
import {EnvironmentalDataQueryService} from './database/EnvironmentalDataQueryService';
import {EventBus} from './EventBus';
import {
    AirQualityEvent,
    HumidityEvent,
    PressureEvent,
    TemperatureEvent,
    ThingyDataEvent,
    ThingyNotifyEventDispatchers
} from './ThingyNotifyEventDispatchers';

export class MqttService {

    private static environmentService = 'ef680200-9b35-4933-9b10-52ffa9740042';
    private static temperatureCharacteristic = 'ef680201-9b35-4933-9b10-52ffa9740042';
    private static pressureCharacteristic = 'ef680202-9b35-4933-9b10-52ffa9740042';
    private static humidityCharacteristic = 'ef680203-9b35-4933-9b10-52ffa9740042';
    private static airQualityCharacteristic = 'ef680204-9b35-4933-9b10-52ffa9740042';
    mqttConnection: MqttConnection;
    private environmentalDataParser: EnvironmentalDataParserService;
    private thingyQuerier: ThingyQueryService;
    private environmentalDataQueryService: EnvironmentalDataQueryService;
    private eventBus: EventBus;
    private thingyIdByDeviceIds: Map<string, string>;

    constructor(mqttBrokerClient: MqttConnection, thingyQuerier: ThingyQueryService, environmentalDataQueryService: EnvironmentalDataQueryService, environmentalDataParser: EnvironmentalDataParserService, eventBus: EventBus) {
        this.mqttConnection = mqttBrokerClient;
        this.environmentalDataParser = environmentalDataParser;
        this.thingyQuerier = thingyQuerier;
        this.environmentalDataQueryService = environmentalDataQueryService;
        this.eventBus = eventBus;
        this.thingyIdByDeviceIds = new Map<string, string>();
    }

    public initSubscriptionToMqtt = async () => {
        let devices: IThingy[] = await this.thingyQuerier.findAllThingyDevices();
        if (devices) {
            let deviceAndThingysIDs = Array.from(devices.map((thingy): [string, string] => [thingy.deviceId, thingy.id]));
            this.subscribeMany(deviceAndThingysIDs);
        }
    };

    public subscribeMany = async (deviceAndThingysIDs: [string, string][]) => {
        for (let deviceAndThingysID of deviceAndThingysIDs) {
            this.subscribe(deviceAndThingysID[0], deviceAndThingysID[1]);
        }
    };

    subscribe(deviceId: string, thingyId: string) {
        this.thingyIdByDeviceIds.set(deviceId, thingyId);
        const temperatureTopic = `${deviceId}/${MqttService.environmentService}/${MqttService.temperatureCharacteristic}`;
        const pressureTopic = `${deviceId}/${MqttService.environmentService}/${MqttService.pressureCharacteristic}`;
        const humidityTopic = `${deviceId}/${MqttService.environmentService}/${MqttService.humidityCharacteristic}`;
        const airQualityTopic = `${deviceId}/${MqttService.environmentService}/${MqttService.airQualityCharacteristic}`;
        this.mqttConnection.client.subscribe(temperatureTopic);
        this.mqttConnection.client.subscribe(pressureTopic);
        this.mqttConnection.client.subscribe(humidityTopic);
        this.mqttConnection.client.subscribe(airQualityTopic);

        this.setEventHandlers();
    }

    private setEventHandlers = async () => {
        this.mqttConnection.client.on('message', (topic: string, message: any) => {
            let splittedTopic = topic.split('/');
            let deviceId = splittedTopic[0];
            let thingyId = this.thingyIdByDeviceIds.get(deviceId);
            let service = splittedTopic[1];
            let characteristic = splittedTopic[2];
            let thingyEvent: ThingyDataEvent;
            let timestamp = new Date().getTime();
            switch (characteristic) {
                case MqttService.temperatureCharacteristic:
                    let temperature = this.environmentalDataParser.parseTemperature(message);
                    thingyEvent = new TemperatureEvent(timestamp, thingyId, temperature);
                    this.eventBus.fireTemperatureEvent(thingyEvent);
                    break;
                case MqttService.pressureCharacteristic:
                    let pressure = this.environmentalDataParser.parsePressure(message);
                    thingyEvent = new PressureEvent(timestamp, thingyId, pressure);
                    this.eventBus.firePressureEvent(thingyEvent);
                    break;
                case MqttService.humidityCharacteristic:
                    let humidity = this.environmentalDataParser.parseHumidity(message);
                    thingyEvent = new HumidityEvent(timestamp, thingyId, humidity);
                    this.eventBus.fireHumidityEvent(thingyEvent);
                    break;
                case MqttService.airQualityCharacteristic:
                    let airQuality = this.environmentalDataParser.parseAirQuality(message)[0];
                    thingyEvent = new AirQualityEvent(timestamp, thingyId, airQuality);
                    this.eventBus.fireAirQualityEvent(thingyEvent);
                    break;
            }
        });
    };

}