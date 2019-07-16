import mongoose from 'mongoose';
const { Schema } = mongoose;

const tokenSchema = new Schema({
    _userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
        expires: 43200
    }
});

const Token = mongoose.model('Token', tokenSchema);

export default Token;