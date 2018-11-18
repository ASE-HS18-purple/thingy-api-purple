import {BaseController} from './BaseController';
import * as Router from 'koa-router';
import {EnvironmentalData, EnvironmentalDataQueryService} from '../service/database/EnvironmentalDataQueryService';
import {ThingyQueryService} from '../service/database/ThingyQueryService';

export class EnvironmentalDataController extends BaseController {

    protected zone: string = '/environmental-data';
    private environmentalDataQueryService: EnvironmentalDataQueryService;
    private thingyQueryService: ThingyQueryService;

    constructor(environmentalDataQueryService: EnvironmentalDataQueryService, thingyQueryService: ThingyQueryService) {
        super();
        this.environmentalDataQueryService = environmentalDataQueryService;
        this.thingyQueryService = thingyQueryService;
    }

    protected getRoutes(router: Router): Router {
        router.get('/temperature', this.getTemperatureData);
        return router;
    }

    getTemperatureData = async (ctx: Router.IRouterContext) => {
        const from: number = ctx.query.from;
        const to: number = ctx.query.to;
        console.log('FROM = ', from);
        console.log('TO = ', to);
        const username = ctx.state.user.user.username;
        const environmentalData: EnvironmentalData = new EnvironmentalData();
        environmentalData.datasets = [];
        environmentalData.unit = 'Temperature';
        const thingyDevices = await this.thingyQueryService.findAllThingyDevicesByUsername(username);
        for (let thingyDevice of thingyDevices) {
            let res = await this.environmentalDataQueryService.getTemperatureData(from, to, thingyDevice._id);
            let dataset = {id: thingyDevice._id, thingyName: thingyDevice.location, properties: new Array()};
            res.forEach(entry => {
                let tempVal = {value: (entry as any).value, time: (entry as any).time};
                dataset.properties.push({value: (entry as any).value, time: (entry as any).time});
            });
            environmentalData.datasets.push(dataset);
        }
        ctx.response.status = 200;
        ctx.response.body = environmentalData;
    };

}