export class EnvironmentalDataParserService {

    parsePressure = (data: Buffer): number => {
        const integerPart = data.readInt32LE(0);
        const decimalPart = data.readUInt8(4);
        const pressure = integerPart + (decimalPart / 100);
        console.log('Pressure = ', pressure);
        return pressure;
    };

    parseAirQuality = (data: Buffer): [number, number] => {
        const co2 = data.readUInt16LE(0);
        const tvoc = data.readUInt16LE(2);
        console.log('Air quality = ', co2, tvoc);
        return [co2, tvoc];
    };

    parseTemperature = (data: Buffer): number => {
        const integerPart = data.readInt8(0);
        const decimalPart = data.readUInt8(1);
        const temperature = integerPart + (decimalPart / 100);
        console.log('Temperature = ', temperature);
        return temperature;
    };

    parseHumidity = (data: Buffer): number => {
        const humidity = data.readUInt8(0);
        console.log('Humidity = ', humidity);
        return humidity
    };

}
