import * as mongoose from 'mongoose';

interface IThingy extends mongoose.Document {
    name: string;
    username: string;
    deviceId: string;
    location: string;
    lastValues: any;
    lastTimes: any;
}

const ThingySchema = new mongoose.Schema({
    name: String,
    username: String,
    deviceId: String,
    location: String,
});

ThingySchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc: any, ret: any) => {
        delete ret._id;
    },
});

ThingySchema.virtual('lastTimes').get(function () {
    return this._lastTimes;
}).set(function (value: Map<number, number>) {
    this._lastTimes = value;
});

ThingySchema.virtual('lastValues').get(function () {
    return this._lastValues;
}).set(function (value: Map<number, number>) {
    this._lastValues = value;
});

const Thingy = mongoose.model<IThingy>('Thingy', ThingySchema);

export {Thingy, IThingy};
