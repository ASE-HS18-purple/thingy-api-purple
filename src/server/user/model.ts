import * as mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: String,
    username: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
});

UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc: any, ret: any) => {
        delete ret._id;
        delete ret.password;
    },
});

const User = mongoose.model('User', UserSchema);

export {User};
