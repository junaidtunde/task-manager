import mongoose from 'mongoose';
const { Schema } = mongoose;

const taskSchema = new Schema({
    status: {
        type: String,
        default: 'new'
    },
    description: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model('Task', taskSchema);
export default Task;