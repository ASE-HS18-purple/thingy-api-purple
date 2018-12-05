import {IThingy, Thingy} from '../../models/Thingy';
import {EnvironmentalDataQueryService} from "./EnvironmentalDataQueryService";
import {JSONProperty} from "../../controllers/WebsocketController";


export class ThingyQueryService {

    private envDataQuery: EnvironmentalDataQueryService;

    constructor(envDataQuery: EnvironmentalDataQueryService) {
        this.envDataQuery = envDataQuery;
    }

    public async findAllThingyDevicesByUsername(username: string): Promise<IThingy[]> {
        const thingyDevices = await Thingy.find({
            username: username,
        });
        if (thingyDevices) {
            for (const thingyDevice of thingyDevices) {
                thingyDevice.lastValues = new Map<number, number>();
                thingyDevice.lastTimes = new Map<number, number>();
                const temp = await this.envDataQuery.getTemperatureLastStoredProperty(thingyDevice._id);
                // Note: We are querying here only the last item stored. Hence we check and deal with only one element.
                if (temp[0]) {
                    thingyDevice.lastValues[JSONProperty.Temperature] = (temp[0] as any).value;
                    thingyDevice.lastTimes[JSONProperty.Temperature] = new Date((temp[0] as any).time).getTime();
                }
                const humidity = await this.envDataQuery.getHumidityLastStoredProperty(thingyDevice._id);
                if (humidity[0]) {
                    thingyDevice.lastValues[JSONProperty.Humidity] = (humidity[0] as any).value;
                    thingyDevice.lastTimes[JSONProperty.Humidity] = new Date((humidity[0] as any).time).getTime();
                }
                const pressure = await this.envDataQuery.getPressureLastStoredProperty(thingyDevice._id);
                if (pressure[0]) {
                    thingyDevice.lastValues[JSONProperty.Pressure] = (pressure[0] as any).value;
                    thingyDevice.lastTimes[JSONProperty.Pressure] = new Date((pressure[0] as any).time).getTime();
                }
                const co2 = await this.envDataQuery.getCo2LastStoredProperty(thingyDevice._id);
                if (co2[0]) {
                    thingyDevice.lastValues[JSONProperty.CO2] = (co2[0] as any).value;
                    thingyDevice.lastTimes[JSONProperty.CO2] = new Date((co2[0] as any).time).getTime();
                }
            }
        }
        return thingyDevices;
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