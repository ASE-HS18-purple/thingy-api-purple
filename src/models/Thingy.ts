import * as mongoose from 'mongoose';

interface IThingy extends mongoose.Document {
    name: string,
    username: string,
    deviceId: string,
    location: string
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

const Thingy = mongoose.model<IThingy>('Thingy', ThingySchema);

export {Thingy, IThingy};
