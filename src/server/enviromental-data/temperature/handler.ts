const storeTemperature = (data: any) => {
    const integerPart = data.readInt8(0);
    const decimalPart = data.readUInt8(1);
    const temperature = integerPart + (decimalPart / 100);
    console.log('Temperature = ', temperature);
};

export {storeTemperature};
