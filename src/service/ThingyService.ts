import {IThingy, Thingy} from '../models/Thingy';
import {ThingyQueryService} from './database/ThingyQueryService';
import {MqttService} from './MqttService';

export class ThingyService {

    thingyQuerier: ThingyQueryService;
    mqttService: MqttService;

    constructor(thingyQuerier: ThingyQueryService, mqttService: MqttService) {
        this.thingyQuerier = thingyQuerier;
        this.mqttService = mqttService;
    }

    public configureNewThingyDevice = async (thingyModel: IThingy, username: string): Promise<IThingy> => {
        let configuredThingy: IThingy = null;
        const deviceId = thingyModel.deviceId;
        const name = thingyModel.name;
        const location = thingyModel.location;
        const thingyByDeviceId = await this.thingyQuerier.findThingyDeviceByDeviceIdAndUsername(deviceId, username);
        const thingyByName = await this.thingyQuerier.findThingyByNameAndUsername(name, username);
        console.log(thingyByDeviceId, thingyByName);
        //If it is unique by name and by device id, create it!
        if (!thingyByDeviceId && !thingyByName) {
            // Create one.
            configuredThingy = await Thingy.create(new Thingy({
                name: name,
                username: username,
                deviceId: deviceId,
                location: location,
            }));
            this.mqttService.subscribe(configuredThingy.deviceId);
        }
        return configuredThingy;
    };

}