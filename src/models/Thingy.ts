import * as mongoose from 'mongoose';

interface IThingy extends mongoose.Document {
    location: string,
    username: string,
    deviceId: string
}

const ThingySchema = new mongoose.Schema({
    location: String,
    username: String,
    deviceId: String,
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
