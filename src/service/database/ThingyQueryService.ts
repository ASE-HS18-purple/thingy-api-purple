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

    public async findThingByUsernameAndLocation(username: string, location: string): Promise<IThingy> {
        const thingy = await Thingy.findOne({
            username: username,
            location: location,
        });
        return thingy;
    }

    public async updateThingyDeviceByLocationId(id: string, deviceId: any, username: string) {
        // Try to search by the location id coming from client.
        const thingyDevice = await Thingy.findById(id);
        if (thingyDevice) {
            // If the device is found, check if it belongs to the user who did the request.
            if ((thingyDevice as any).username == username) {
                await Thingy.updateOne({_id: id}, {
                    deviceId: deviceId
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

}