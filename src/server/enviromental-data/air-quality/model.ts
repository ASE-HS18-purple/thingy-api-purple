import {ThingyDevicesHandler} from '../../thingy-devices/handler';
import {influxDatabaseClient} from '../../database';

export class AirQualityModel {
    public async storeAirQuality(airQuality: number, deviceId: string) {
        const influxDatabaseClient = await this.getInfluxDbConnection();
        const thingyDeviceHandler: ThingyDevicesHandler = new ThingyDevicesHandler();
        const thingyDevicesAndUsers = await thingyDeviceHandler.findThingyByDeviceId(deviceId);
        thingyDevicesAndUsers.forEach(async device => {
            await influxDatabaseClient.writePoints([{
                measurement: 'airQuality',
                tags: {
                    username: (device as any).username,
                    location: (device as any).location,
                },
                fields: {
                    value: airQuality,
                }
            }]);
        });
    }

    private async getInfluxDbConnection() {
        return await influxDatabaseClient();
    }

}