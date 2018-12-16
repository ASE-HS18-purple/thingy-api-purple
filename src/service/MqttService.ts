import {MqttConnection} from './MqttConnection';
import {IThingy} from '../models/Thingy';
import {EnvironmentalDataParserService} from './EnvironmentalDataParserService';
import {ThingyService} from './ThingyService';
import {ThingyQueryService} from './database/ThingyQueryService';
import {EnvironmentalDataQueryService} from './database/EnvironmentalDataQueryService';
import {EventBus} from './EventBus';
const { StringDecoder } = require('string_decoder');
import { timer } from 'd3-timer';

import {
    AirQualityEvent,
    HumidityEvent,
    PressureEvent,
    TemperatureEvent,
    ThingyDataEvent,
    ThingyNotifyEventDispatchers
} from './ThingyNotifyEventDispatchers';
import {AlarmEvent} from './AlarmService';

export class MqttService {

    private static soundService = 'ef680500-9b35-4933-9b10-52ffa9740042';
    private static speakerMode = 'ef680501-9b35-4933-9b10-52ffa9740042';
    private static speakerData = 'ef680502-9b35-4933-9b10-52ffa9740042';
    private static speakerStatus = 'ef680503-9b35-4933-9b10-52ffa9740042';
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
    private speakerModeSet: Set<string> = new Set<string>();

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
        this.eventBus.subscribeToAlarm(this.fireAlarm.bind(this));
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
        const speakerStatusTopic = `${deviceId}/${MqttService.soundService}/${MqttService.speakerStatus}`;
        const connectedTopic = `${deviceId}/connected`;
        this.mqttConnection.client.subscribe(temperatureTopic);
        this.mqttConnection.client.subscribe(pressureTopic);
        this.mqttConnection.client.subscribe(humidityTopic);
        this.mqttConnection.client.subscribe(airQualityTopic);
        this.mqttConnection.client.subscribe(speakerStatusTopic);
        this.mqttConnection.client.subscribe(connectedTopic);

        this.setEventHandlers();
    }

    fireAlarm(alarmEvent: AlarmEvent) {
        const callInterval = 333;
        const callLength = 10000;
        let lastCall = -callInterval;
        let t = timer((elapsed: number) => {
            if (elapsed - lastCall > callInterval) {
                lastCall = elapsed;
                let data = Buffer.alloc(1);
                data.writeUInt8(1, 0);
                for (let deviceId of this.speakerModeSet) {
                    let topic = `${deviceId}/${MqttService.soundService}/${MqttService.speakerData}/write`;
                    this.mqttConnection.client.publish(topic, data);
                    console.log('Noise on ' + deviceId);
                }
            }
            if (elapsed > callLength) {
                t.stop();
            }
        });
    }

    setSpeakerMode(deviceId: string) {
        let data = Buffer.alloc(2);
        data.writeUInt8(3, 0);
        data.writeUInt8(1, 1);
        let topic = `${deviceId}/${MqttService.soundService}/${MqttService.speakerMode}/write`;
        this.mqttConnection.client.publish(topic, data);
        console.log('Speaker mode set for thingy ' + deviceId);
        this.speakerModeSet.add(deviceId);
    }

    private setEventHandlers = () => {
        this.mqttConnection.client.on('message', (topic: string, message: any) => {
            let service, cloudToken, characteristic;
            [cloudToken, service, characteristic = ''] = topic.split('/');
            let thingyId = this.thingyIdByDeviceIds.get(cloudToken);
            let thingyEvent: ThingyDataEvent;
            let timestamp = new Date().getTime();
            if (service == 'connected') {
                this.thingyConnected(cloudToken, message);
            } else if(!this.speakerModeSet.has(cloudToken)) {
                // DEV!!!
                this.setSpeakerMode(cloudToken);
            } else {
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
                    case MqttService.speakerStatus:
                        console.log(message);
                }
            }
        });
    };

    private thingyConnected(thingyId: string, buffer?: Buffer) {
        let stringDecoder = new StringDecoder("utf8");
        let status = stringDecoder.write(buffer);
        if (status === "true") {
            // TODO: Outsource to eventbus and alarm component
            this.setSpeakerMode(thingyId)
        }
    }

}