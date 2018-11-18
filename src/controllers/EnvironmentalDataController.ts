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
        router.get('/co2', this.getAirQualityData);
        router.get('/pressure', this.getPressureData);
        router.get('/humidity', this.getHumidityData);
        return router;
    }

    getTemperatureData = async (ctx: Router.IRouterContext) => {
        const environmentalData: EnvironmentalData = await this.getEnvironmentalData(ctx, 'Temperature');
        this.settleTheResponse(ctx, environmentalData);
    };

    getHumidityData = async (ctx: Router.IRouterContext) => {
        const environmentalData: EnvironmentalData = await this.getEnvironmentalData(ctx, 'Pressure');
        this.settleTheResponse(ctx, environmentalData);
    };

    getPressureData = async (ctx: Router.IRouterContext) => {
        const environmentalData: EnvironmentalData = await this.getEnvironmentalData(ctx, 'Humidity');
        this.settleTheResponse(ctx, environmentalData);
    };

    getAirQualityData = async (ctx: Router.IRouterContext) => {
        const environmentalData: EnvironmentalData = await this.getEnvironmentalData(ctx, 'CO2');
        this.settleTheResponse(ctx, environmentalData);
    };

    private getEnvironmentalData = async (ctx: Router.IRouterContext, unit: string) => {
        const from: number = ctx.query.from;
        const to: number = ctx.query.to;
        const username = ctx.state.user.user.username;
        const environmentalData: EnvironmentalData = new EnvironmentalData();
        environmentalData.datasets = [];
        environmentalData.unit = unit;
        let thingyDevices = await this.thingyQueryService.findAllThingyDevicesByUsername(username);
        for (let thingyDevice of thingyDevices) {
            let res;
            if (unit == 'Temperature') {
                res = await this.environmentalDataQueryService.getTemperatureData(from, to, thingyDevice._id);
            }
            if (unit == 'Pressure') {
                res = await this.environmentalDataQueryService.getPressureData(from, to, thingyDevice._id);
            }
            if (unit == 'Humidity') {
                res = await this.environmentalDataQueryService.getHumidityData(from, to, thingyDevice._id);
            }
            if (unit == 'CO2') {
                res = await this.environmentalDataQueryService.getAirQualityData(from, to, thingyDevice._id);
            }
            let dataset = {id: thingyDevice._id, thingyName: thingyDevice.location, properties: new Array()};
            res.forEach(entry => {
                let tempVal = {value: (entry as any).value, time: (entry as any).time};
                dataset.properties.push({value: (entry as any).value, time: (entry as any).time});
            });
            environmentalData.datasets.push(dataset);
        }
        return environmentalData;
    };

    private settleTheResponse = (ctx: Router.IRouterContext, environmentalData: EnvironmentalData) => {
        ctx.response.status = 200;
        ctx.response.body = environmentalData;
    };

}