const storeAirQuality = (data: any) => {
    const co2 = data.readUInt16LE(0);
    const tvoc = data.readUInt16LE(2);
    console.log('Air quality = ', co2, tvoc);
};

export {storeAirQuality};
