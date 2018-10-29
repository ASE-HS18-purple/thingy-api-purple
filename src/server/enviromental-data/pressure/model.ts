import {influxDatabaseClient} from '../../database';
import {ThingyDevicesHandler} from '../../thingy-devices/handler';

export class PressureModel {

    public async storePressure(pressure: number, deviceId: string) {
        const influxDatabaseClient = await this.getInfluxDbConnection();
        const thingyDeviceHandler: ThingyDevicesHandler = new ThingyDevicesHandler();
        const thingyDevices = await thingyDeviceHandler.findThingyByDeviceId(deviceId);
        if (thingyDevices) {
            thingyDevices.forEach(async (device) => {
                await influxDatabaseClient.writePoints([{
                    measurement: 'pressure',
                    tags: {
                        username: (device as any).username,
                        location: (device as any).location,
                    },
                    fields: {
                        value: pressure,
                    }
                }]);
            });
        }
    }

    private async getInfluxDbConnection() {
        return await influxDatabaseClient();
    }
}
