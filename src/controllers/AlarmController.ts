import {BaseController} from './BaseController';
import * as Router from 'koa-router';
import {IAlarm} from '../models/Alarm';
import {AlarmService} from '../service/AlarmService';

export class AlarmController extends BaseController {

    private alarmService: AlarmService;
    protected zone: string = '/alarm';

    constructor(alarmService: AlarmService) {
        super();
        this.alarmService = alarmService;
    }

    protected getRoutes(router: Router): Router {
        router.post('/', this.configureAlarm);
        router.get('/', this.getAllAlarms);
        return router;
    }

    private configureAlarm = async (ctx: Router.IRouterContext) => {
        const alarm: IAlarm = ctx.request.body as IAlarm;
        const username = ctx.state.user.user.username;
        const configuredAlarm = await this.alarmService.configureAlarm(alarm, username);
        ctx.response.body = configuredAlarm;
        ctx.response.status = configuredAlarm ? 200 : 400;
    };

    private getAllAlarms = async (ctx: Router.IRouterContext) => {
        const username = ctx.state.user.user.username;
        const alarms = await this.alarmService.getAllAlarms(username);
        ctx.response.body = alarms;
        ctx.response.status = 200;
    }

}