const storeHumidity = (data: any) => {
    const humidity = data.readUInt8(0);
    console.log('Humidity = ', humidity);
};

export {storeHumidity};
