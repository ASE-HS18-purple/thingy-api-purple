import {Thingy} from './model';
import {subscribeToMqtt} from '../message-handler';

export class ThingyDevicesHandler {

    constructor() {
    }

    public async configureNewThingDevice(thingyModel: any, username: string) {
        let result: any = null;
        const deviceId = thingyModel.deviceId;
        const location = thingyModel.location;
        const thingy = await this.findThingByUsernameAndLocation(username, location);
        if (!thingy) {
            // Create one.
            result = await Thingy.create(new Thingy({
                location: location,
                username: username,
                deviceId: deviceId,
            }));
        } else {
            // Simply update it.
            const id = (thingy as any)._id;
            await Thingy.updateOne({_id: id}, {
                location: location,
                username: username,
                deviceId: deviceId,
            });
            result = await Thingy.findOne({_id: id});
        }
        subscribeToMqtt(deviceId);
        return result;
    }

    public async findAllThingyDevicesByUsername(username: string) {
        return await Thingy.find({
            username: username,
        });
    }

    public async findAllThingyDevices() {
        return await Thingy.find({});
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
                subscribeToMqtt(deviceId);
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

    private async findThingByUsernameAndLocation(username: string, location: string) {
        const thingy = await Thingy.findOne({
            username: username,
            location: location,
        });
        return thingy;
    }

}
