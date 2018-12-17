import {MqttConnection} from './MqttConnection';
import {IThingy} from '../models/Thingy';
import {EnvironmentalDataParserService} from './EnvironmentalDataParserService';
import {ThingyService} from './ThingyService';
import {ThingyQueryService} from './database/ThingyQueryService';
import {EnvironmentalDataQueryService} from './database/EnvironmentalDataQueryService';
import {EventBus} from './EventBus';

const {StringDecoder} = require('string_decoder');
import {timer} from 'd3-timer';

import {
    AirQualityEvent,
    HumidityEvent,
    PressureEvent,
    TemperatureEvent,
    ThingyDataEvent,
    ThingyNotifyEventDispatchers
} from './ThingyNotifyEventDispatchers';
import {AlarmEvent, ButtonPressed} from './AlarmService';

export class MqttService {

    private static soundService = 'ef680500-9b35-4933-9b10-52ffa9740042';
    private static speakerMode = 'ef680501-9b35-4933-9b10-52ffa9740042';
    private static speakerData = 'ef680502-9b35-4933-9b10-52ffa9740042';
    private static speakerStatus = 'ef680503-9b35-4933-9b10-52ffa9740042';
    private static environmentService = 'ef680200-9b35-4933-9b10-52ffa9740042';
    private static uiService = 'ef680300-9b35-4933-9b10-52ffa9740042';
    private static ledCharacteristic = 'ef680301-9b35-4933-9b10-52ffa9740042';
    private static buttonCharacteristic = 'ef680302-9b35-4933-9b10-52ffa9740042';
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
    private buttonTriggered: boolean;

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
        const buttonTopic = `${deviceId}/${MqttService.uiService}/${MqttService.buttonCharacteristic}`;
        const connectedTopic = `${deviceId}/connected`;
        this.mqttConnection.client.subscribe(temperatureTopic);
        this.mqttConnection.client.subscribe(pressureTopic);
        this.mqttConnection.client.subscribe(humidityTopic);
        this.mqttConnection.client.subscribe(airQualityTopic);
        this.mqttConnection.client.subscribe(speakerStatusTopic);
        this.mqttConnection.client.subscribe(connectedTopic);
        this.mqttConnection.client.subscribe(buttonTopic);

        this.setEventHandlers();
    }

    fireAlarm(alarmEvent: AlarmEvent) {
        const callInterval = 1000;
        const ledInterval = 1000;
        const callLength = 300000;
        this.buttonTriggered = false;
        let lastCall = -callInterval;
        let lastLEDChange = -ledInterval;
        let red = false;
        let t = timer((elapsed: number) => {
            if (elapsed - lastCall > callInterval) {
                lastCall = elapsed;
                let soundBuffer = Buffer.alloc(1);
                soundBuffer.writeUInt8(1, 0);
                let offLedBuffer = Buffer.alloc(4);
                offLedBuffer.writeUInt8(1, 0);
                offLedBuffer.writeUInt8(255, 1);
                let redLedBuffer = Buffer.alloc(4);
                redLedBuffer.writeUInt8(1, 0);
                redLedBuffer.writeUInt8(100, 1);
                for (let deviceId of this.speakerModeSet) {
                    // Sound
                    let soundTopic = `${deviceId}/${MqttService.soundService}/${MqttService.speakerData}/write`;
                    this.mqttConnection.client.publish(soundTopic, soundBuffer);
                    if (elapsed - lastLEDChange > ledInterval) {
                        let ledTopic = `${deviceId}/${MqttService.uiService}/${MqttService.ledCharacteristic}/write`;
                        this.mqttConnection.client.publish(ledTopic, red ? redLedBuffer : offLedBuffer);
                        console.log('Color change on ' + deviceId);
                        red = !red;
                        lastLEDChange = elapsed;
                    }
                    console.log('Noise on ' + deviceId);
                }
            }
            if (elapsed > callLength || this.buttonTriggered) {
                t.stop();
                this.resetLights();
            }
        });
    }

    resetLights() {
        let ledBuffer = Buffer.alloc(5);
        // Breathe
        ledBuffer.writeUInt8(2, 0);
        // Color
        ledBuffer.writeUInt8(6, 1);
        ledBuffer.writeUInt8(20, 2);
        ledBuffer.writeInt16LE(3500, 3);
        for (let deviceId of this.speakerModeSet) {
            // Sound
            let ledTopic = `${deviceId}/${MqttService.uiService}/${MqttService.ledCharacteristic}/write`;
            this.mqttConnection.client.publish(ledTopic, ledBuffer);
            console.log('Lights reset on ' + deviceId);
        }
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
            } else if (!this.speakerModeSet.has(cloudToken)) {
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
                    case MqttService.buttonCharacteristic:
                        this.buttonTriggered = true;
                        this.eventBus.fireButtonPressed(new ButtonPressed(thingyId));
                        console.log('Button pressed');
                        break;
                    case MqttService.speakerStatus:
                        console.log(message);
                }
            }
        });
    };

    private thingyConnected(thingyId: string, buffer?: Buffer) {
        let stringDecoder = new StringDecoder('utf8');
        let status = stringDecoder.write(buffer);
        if (status === 'true') {
            // TODO: Outsource to eventbus and alarm component
            this.setSpeakerMode(thingyId);
        }
    }

}