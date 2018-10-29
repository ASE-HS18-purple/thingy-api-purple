import {AirQualityModel} from './model';

export class AirQualityHandler {

    public async storeAirQuality(data: any, deviceId: string) {
        const co2 = data.readUInt16LE(0);
        console.log('Air quality = ', co2);
        const airQualityModel: AirQualityModel = new AirQualityModel();
        await airQualityModel.storeAirQuality(co2, deviceId);
    }

}
