import * as mongoose from 'mongoose';

const BrokerConnectionSchema = new mongoose.Schema({
    state: {
        type: String,
    },
});

BrokerConnectionSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc: any, ret: any) => {
        delete ret._id;
    },
});

const BrokerConnection = mongoose.model('BrokerConnection', BrokerConnectionSchema);

export {BrokerConnection};
