import * as mongoose from 'mongoose';

interface IAlarm extends mongoose.Document {
    id: string;
    name: string;
    username: string;
    triggered: boolean;
    triggerTime: number;
    isOn: boolean;
}

const AlarmSchema = new mongoose.Schema({
    name: String,
    username: String,
    triggered: Boolean,
    triggerTime: Number,
    isOn: Boolean,
});

AlarmSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc: any, ret: any) => {
        delete ret._id;
    },
});

const Alarm = mongoose.model<IAlarm>('Alarm', AlarmSchema);

export {Alarm, IAlarm};
