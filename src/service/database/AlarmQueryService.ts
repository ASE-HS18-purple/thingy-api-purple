import {Alarm, IAlarm} from '../../models/Alarm';

export class AlarmQueryService {

    public async createAlarm(alarm: IAlarm, username: string): Promise<IAlarm> {
        return await Alarm.create({
            name: alarm.name,
            username: username,
            triggered: alarm.triggered,
            triggerTime: alarm.triggerTime,
            isOn: alarm.isOn,
        });
    }

    public async getAllAlarms(username: string): Promise<IAlarm[]> {
        return await Alarm.find({username: username}, null, {sort: {triggerTime: -1}});
    }

    public async updateAlarm(alarm: IAlarm) {
        return await Alarm.updateOne({_id: alarm.id}, alarm);
    }
}
