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

    public async updateThingyDevice(thingy: IThingy) {
        await Thingy.updateOne({_id: thingy.id}, {
            deviceId: thingy.deviceId,
            name: thingy.name,
            location: thingy.location,
        });
        return await Thingy.findById(thingy.id);
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

    public async findThingyDeviceByDeviceId(deviceId: string) {
        return Thingy.find({deviceId: deviceId});
    }

    public async findThingyDeviceById(id: string): Promise<IThingy> {
        return Thingy.findOne({_id: id});
    }

    public async findThingyDeviceByDeviceIdAndUsername(deviceId: string, username: string): Promise<IThingy> {
        return Thingy.findOne({deviceId: deviceId, username: username});
    }

    public async findThingyByNameAndUsername(name: string, username: string): Promise<IThingy> {
        return Thingy.findOne({name: name, username: username});
    }
}