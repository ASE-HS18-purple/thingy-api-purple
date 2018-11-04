import {IThingy, Thingy} from '../../models/Thingy';


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


}