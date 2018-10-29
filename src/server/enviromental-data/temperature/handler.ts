import {TemperatureModel} from './model';

export class TemperatureHandler {

    public async storeTemperature(data: any, deviceId: string) {
        const temperatureModel: TemperatureModel = new TemperatureModel();
        const integerPart = data.readInt8(0);
        const decimalPart = data.readUInt8(1);
        const temperature = integerPart + (decimalPart / 100);
        console.log('Temperature = ', temperature);
        await temperatureModel.storeTemperature(temperature, deviceId);
    }

}