import {influxDatabaseClient} from '../../database';
import {ThingyDevicesHandler} from '../../thingy-devices/handler';

export class TemperatureModel {

    public async storeTemperature(temperature: number, deviceId: string) {
        const influxDatabaseClient = await this.getInfluxDbConnection();
        const thingyDeviceHandler: ThingyDevicesHandler = new ThingyDevicesHandler();
        const thingyDevicesAndUsers = await thingyDeviceHandler.findThingyByDeviceId(deviceId);
        thingyDevicesAndUsers.forEach(async device => {
            await influxDatabaseClient.writePoints([{
                measurement: 'temperature',
                tags: {
                    username: (device as any).username,
                    location: (device as any).location,
                },
                fields: {
                    value: temperature,
                }
            }]);
        });
    }

    private async getInfluxDbConnection() {
        return await influxDatabaseClient();
    }

}
