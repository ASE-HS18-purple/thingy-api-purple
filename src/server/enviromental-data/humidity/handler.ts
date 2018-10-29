import {HumidityModel} from './model';

export class HumidityHandler {

    public async storeHumidity(data: any, deviceId: string) {
        const humidity = data.readUInt8(0);
        console.log('Humidity = ', humidity);
        const humidityModel: HumidityModel = new HumidityModel();
        await humidityModel.storeHumidity(humidity, deviceId);
    }

}
