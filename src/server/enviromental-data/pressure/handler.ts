const storePressure = (data: any) => {
    const integerPart = data.readInt32LE(0);
    const decimalPart = data.readUInt8(4);
    const pressure = integerPart + (decimalPart / 100);
    console.log('Pressure = ', pressure);
};

export {storePressure};
