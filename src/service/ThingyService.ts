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
        const location = thingyModel.location;
        const foundThingy = await this.thingyQuerier.findThingByUsernameAndLocation(username, location);
        if (!foundThingy) {
            // Create one.
            configuredThingy = await Thingy.create(new Thingy({
                location: location,
                username: username,
                deviceId: deviceId,
            }));
        } else {
            // Simply update it.
            const id = (foundThingy as any)._id;
            await Thingy.updateOne({_id: id}, {
                location: location,
                username: username,
                deviceId: deviceId,
            });
            configuredThingy = await Thingy.findOne({_id: id});
        }
        this.mqttService.subscribe(configuredThingy.deviceId, configuredThingy.id);
        return configuredThingy;
    };

}