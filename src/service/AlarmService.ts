import {AlarmQueryService} from './database/AlarmQueryService';
import {IAlarm} from '../models/Alarm';
import {EventBus} from './EventBus';
import {MqttService} from "./MqttService";
import {IThingy} from '../models/Thingy';

export enum AlarmActive {
    ON = 'ON',
    OFF = 'OFF',
}

export class AlarmEvent {
    constructor(public alarmId: string, public active: AlarmActive) {
    }
}

export class ButtonPressed {
    constructor(public thingyId: string) {
    }
}

export class ConfigurationAdded {
    constructor(public thingy: IThingy, public username: string) {
    }
}

export class AlarmService {

    private alarmQueryService: AlarmQueryService;
    private eventBus: EventBus;

    constructor(alarmQueryService: AlarmQueryService, eventBus: EventBus) {
        this.alarmQueryService = alarmQueryService;
        this.eventBus = eventBus;
        this.eventBus.subscribeToButtonPressed(event => this.stopAllAlarms(event));
    }

    public async configureAlarm(alarm: IAlarm, username: string) {
        if (alarm) {
            // The alarm cannot be triggered and is not on as soon as it is created.
            alarm.triggered = false;
            alarm.isOn = false;
            if (this.checkIfAlarmIsInFutureAtLeast5MilliSeconds(alarm)) {
                const createdAlarm: IAlarm = await this.alarmQueryService.createAlarm(alarm, username);
                this.createTimer(createdAlarm);
                return createdAlarm;
            }
        }
    }

    public async stopAllAlarms(buttonPressed: ButtonPressed) {
        const allAlarms = await this.alarmQueryService.getAllAlarmsAllUsers();
        for (let alarm of allAlarms) {
            alarm.isOn = false;
            alarm.save();
        }
    }

    public async getAllAlarms(username: string): Promise<IAlarm[]> {
        return await this.alarmQueryService.getAllAlarms(username);
    }

    private createTimer(alarm: IAlarm) {
        const now = new Date().getTime();
        const triggerTime = alarm.triggerTime;
        const millis = triggerTime - now;
        setTimeout(this.sendDataToClientToTriggerAlarm, millis, alarm, this.alarmQueryService, this.eventBus);
    }

    private checkIfAlarmIsInFutureAtLeast5MilliSeconds(alarm: IAlarm): boolean {
        const triggerTime = alarm.triggerTime;
        const now = new Date().getTime();
        return triggerTime - now > 5;
    }

    private async sendDataToClientToTriggerAlarm(alarm: IAlarm, alarmQueryService: AlarmQueryService, eventBus: EventBus) {
        alarm.isOn = true;
        alarm.triggered = true;
        await alarmQueryService.updateAlarm(alarm);
        const alarmEvent: AlarmEvent = new AlarmEvent(alarm._id, AlarmActive.ON);
        eventBus.fireAlarmEvent(alarmEvent);
    }

}
