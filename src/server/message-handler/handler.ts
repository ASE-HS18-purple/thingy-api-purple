import {mqttBrokerClient} from '../mqtt-broker-connection/index';
import {storeTemperature} from '../enviromental-data/temperature/index';
import {storePressure} from '../enviromental-data/pressure/index';
import {storeHumidity} from '../enviromental-data/humidity';
import {storeAirQuality} from '../enviromental-data/air-quality';
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
    client.on('message', (topic: string, message: any) => {
        if (topic.endsWith(temperatureCharacteristic)) {
            storeTemperature(message);
        }
        if (topic.endsWith(pressureCharacteristic)) {
            storePressure(message);
        }
        if (topic.endsWith(humidityCharacteristic)) {
            storeHumidity(message);
        }
        if (topic.endsWith(airQualityCharacteristic)) {
            storeAirQuality(message);
        }
    });
};

export {initSubscriptionToMqtt, subscribeToMqtt};
