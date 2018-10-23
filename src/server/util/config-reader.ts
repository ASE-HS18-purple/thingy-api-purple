const readConfigFromFile = (key: string, file: string) => {
    const configs = require(file);
    return configs && configs[key];
};

export {readConfigFromFile};
