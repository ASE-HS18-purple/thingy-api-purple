import {mqttBrokerClient} from '../mqtt-broker-connection/index';
import {TemperatureHandler} from '../enviromental-data/temperature/index';
import {PressureHandler} from '../enviromental-data/pressure/index';
import {HumidityHandler} from '../enviromental-data/humidity';
import {AirQualityHandler} from '../enviromental-data/air-quality';
import {ThingyDevicesHandler} from '../thingy-devices/handler';

const temperatureCharacteristic = '/ef680200-9b35-4933-9b10-52ffa9740042/ef680201-9b35-4933-9b10-52ffa9740042';
const pressureCharacteristic = '/ef680200-9b35-4933-9b10-52ffa9740042/ef680202-9b35-4933-9b10-52ffa9740042';
const humidityCharacteristic = '/ef680200-9b35-4933-9b10-52ffa9740042/ef680203-9b35-4933-9b10-52ffa9740042';
const airQualityCharacteristic = '/ef680200-9b35-4933-9b10-52ffa9740042/ef680204-9b35-4933-9b10-52ffa9740042';

const initSubscriptionToMqtt = () => {
    const client = mqttBrokerClient();
    subscribe(client, true);
};

const subscribeToMqtt = (deviceId: string) => {
    const client = mqttBrokerClient();
    subscribe(client, false, deviceId);
};

const subscribe = async (client: any, init: boolean, deviceId?: string) => {
    const thingyDeviceHandler = new ThingyDevicesHandler();
    let device: string;
    if (init) {
        // Find all configured devices from database and subscribe to their published events.
        const thingyDevices = await thingyDeviceHandler.findAllThingyDevices() as any;
        if (thingyDevices) {
            thingyDevices.forEach((thingyDevice: any) => {
                device = thingyDevice.deviceId;
                const temperatureTopic = device + temperatureCharacteristic;
                const pressureTopic = device + pressureCharacteristic;
                const humidityTopic = device + humidityCharacteristic;
                const airQualityTopic = device + airQualityCharacteristic;
                client.subscribe(temperatureTopic);
                client.subscribe(pressureTopic);
                client.subscribe(humidityTopic);
                client.subscribe(airQualityTopic);
            });
        }
    } else {
        device = deviceId;
        const temperatureTopic = device + temperatureCharacteristic;
        const pressureTopic = device + pressureCharacteristic;
        const humidityTopic = device + humidityCharacteristic;
        const airQualityTopic = device + airQualityCharacteristic;
        client.subscribe(temperatureTopic);
        client.subscribe(pressureTopic);
        client.subscribe(humidityTopic);
        client.subscribe(airQualityTopic);
    }
    handleMessages(client);
};

const handleMessages = (client: any) => {
    client.on('message', async (topic: string, message: any) => {
        if (topic.endsWith(temperatureCharacteristic)) {
            const temperatureHandler: TemperatureHandler = new TemperatureHandler();
            await temperatureHandler.storeTemperature(message, extractDeviceId(topic));
        }
        if (topic.endsWith(pressureCharacteristic)) {
            const pressureHandler: PressureHandler = new PressureHandler();
            await pressureHandler.storePressure(message, extractDeviceId(topic));
        }
        if (topic.endsWith(humidityCharacteristic)) {
            const humidityHandler: HumidityHandler = new HumidityHandler();
            await humidityHandler.storeHumidity(message, extractDeviceId(topic));
        }
        if (topic.endsWith(airQualityCharacteristic)) {
            const airQualityHandler: AirQualityHandler = new AirQualityHandler();
            await airQualityHandler.storeAirQuality(message, extractDeviceId(topic));
        }
    });
};

const extractDeviceId = (topic: string) => {
    return topic.split('/')[0];
};

export {initSubscriptionToMqtt, subscribeToMqtt};
