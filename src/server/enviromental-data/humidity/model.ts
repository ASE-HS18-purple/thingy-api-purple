import {ThingyDevicesHandler} from '../../thingy-devices/handler';
import {influxDatabaseClient} from '../../database';

export class HumidityModel {

    public async storeHumidity(humidity: number, deviceId: string) {
        const influxDatabaseClient = await this.getInfluxDbConnection();
        const thingyDeviceHandler: ThingyDevicesHandler = new ThingyDevicesHandler();
        const thingyDevices = await thingyDeviceHandler.findThingyByDeviceId(deviceId);
        if (thingyDevices) {
            thingyDevices.forEach(async (device) => {
                await influxDatabaseClient.writePoints([{
                    measurement: 'humidity',
                    tags: {
                        username: (device as any).username,
                        location: (device as any).location,
                    },
                    fields: {
                        value: humidity,
                    }
                }]);
            });
        }
    }

    private async getInfluxDbConnection() {
        return await influxDatabaseClient();
    }

}