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


    public async updateThingyDevice(thingyModel: IThingy, username: string): Promise<IThingy> {
        let updatedThingy: IThingy = null;
        // Initially search for the thingy
        const thingyToUpdate = await this.thingyQuerier.findThingyDeviceById(thingyModel.id);
        if (thingyToUpdate) {
            // Check if the user wants to update the name. If yes, then check if it is unique.
            if (thingyToUpdate.name != thingyModel.name) {
                const thingyByName = await this.thingyQuerier.findThingyByNameAndUsername(thingyModel.name, username);
                // If it already exists, then just return.
                if (thingyByName) {
                    return updatedThingy;
                }
            }
            // Check if the user wants to update the device id. If yes, then check if it is unique.
            if (thingyModel.deviceId != thingyToUpdate.deviceId) {
                const thingyByDeviceId = await this.thingyQuerier.findThingyDeviceByDeviceIdAndUsername(thingyModel.deviceId, username);
                if (thingyByDeviceId) {
                    return updatedThingy;
                }
            }
            // If we are here, it means that the device id and name are unique per user.
            updatedThingy = await this.thingyQuerier.updateThingyDevice(thingyModel);
            this.mqttService.subscribe(updatedThingy.id);
        }
        return updatedThingy;
    }

}