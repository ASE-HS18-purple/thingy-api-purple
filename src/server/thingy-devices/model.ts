import * as mongoose from 'mongoose';

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

const Thingy = mongoose.model('Thingy', ThingySchema);

export {Thingy};
