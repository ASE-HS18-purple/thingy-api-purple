import * as mongoose from 'mongoose';

interface IUser extends mongoose.Document {
    name: string,
    username: string,
    email: string,
    password: string
}

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

const User = mongoose.model<IUser>('User', UserSchema);

export {User, IUser};
