import {IThingy, Thingy} from '../../models/Thingy';
import {ThingyService} from '../ThingyService';


export class ThingyQueryService {

    public async findAllThingyDevicesByUsername(username: string): Promise<IThingy[]> {
        return await Thingy.find({
            username: username,
        });
    }

    public async findAllThingyDevices(): Promise<IThingy[]> {
        return await Thingy.find({});
    }

    public async updateThingyDevice(id: string, username: string, thingy: IThingy) {
        // Try to search by the name id coming from client.
        const thingyDevice = await Thingy.findById(id);
        if (thingyDevice) {
            // If the device is found, check if it belongs to the user who did the request.
            if ((thingyDevice as any).username == username) {
                await Thingy.updateOne({_id: id}, {
                    deviceId: thingy.deviceId,
                    name: thingy.name
                });
                return await Thingy.findById(id);
            }
        }
    }

    public async deleteThingyDevice(id: string, username: string) {
        //const thingDevice =
        const thingyDevice = await Thingy.findById(id);
        if (thingyDevice) {
            if ((thingyDevice as any).username == username) {
                await Thingy.deleteOne({_id: id});
                return true;
            }
        }
        return false;
    }


    public async findThingyByIdAndUsername(id: string, username: string) {
        const thingDevice = await Thingy.findOne({_id: id});
        if (thingDevice) {
            if ((thingDevice as any).username == username) {
                return thingDevice;
            }
        }
    }

    public async findThingyDeviceById(deviceId: string) {
        return Thingy.find({deviceId: deviceId});
    }

    public async findThingyDeviceByDeviceIdAndUsername(deviceId: string, username: string): Promise<IThingy> {
        return Thingy.findOne({deviceId: deviceId, username: username});
    }

    public async findThingyByNameAndUsername(name: string, username: string): Promise<IThingy> {
        return Thingy.findOne({name: name, username: username});
    }
}