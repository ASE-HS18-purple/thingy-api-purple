import {AlarmQueryService} from './database/AlarmQueryService';
import {IAlarm} from '../models/Alarm';
import {IThingy} from "../models/Thingy";
import Timer = NodeJS.Timer;


export class AlarmService {

    private alarmQueryService: AlarmQueryService;

    constructor(alarmQueryService: AlarmQueryService) {
        this.alarmQueryService = alarmQueryService;
    }

    public async configureAlarm(alarm: IAlarm, username: string) {
        if (alarm) {
            // The alarm cannot be triggered and is not on as soon as it is created.
            alarm.triggered = false;
            alarm.isOn = false;
            if (this.checkIfAlarmIsInFutureAtLeast5Seconds(alarm)) {
                const createdAlarm: IAlarm = await this.alarmQueryService.createAlarm(alarm, username);
                this.createTimer(createdAlarm);
                return createdAlarm;
            }
        }
    }

    public async getAllAlarms(username: string) {
        return await this.alarmQueryService.getAllAlarms(username);
    }

    private createTimer(alarm: IAlarm) {
        const now = new Date().getTime();
        const triggerTime = alarm.triggerTime;
        const millis = triggerTime - now;
        setTimeout(this.sendDataToClientToTriggerAlarm, millis, alarm, this.alarmQueryService);
    }

    private checkIfAlarmIsInFutureAtLeast5Seconds(alarm: IAlarm): boolean {
        const triggerTime = alarm.triggerTime;
        const now = new Date().getTime();
        return triggerTime - now > 5;
    }

    private async sendDataToClientToTriggerAlarm(alarm: IAlarm, alarmQueryService: AlarmQueryService) {
        alarm.isOn = true;
        alarm.triggered = true;
        await alarmQueryService.updateAlarm(alarm);
    }

}
