import {PressureModel} from './model';

export class PressureHandler {

    public async storePressure(data: any, deviceId: string) {
        const integerPart = data.readInt32LE(0);
        const decimalPart = data.readUInt8(4);
        const pressure = integerPart + (decimalPart / 100);
        console.log('Pressure = ', pressure);
        const pressureModel: PressureModel = new PressureModel();
        await pressureModel.storePressure(pressure, deviceId);

    };
}

