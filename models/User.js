import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        help: "This field is required"
    },
    email: {
        type: String,
        required: true,
        unique: true,
        help: "This field is required"
    },
    password: {
        type: String,
        required: true,
        help: "This field is required"
    },
    admin: {
        type: Boolean,
        default: false
    },
    tasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }]
});

//Write some "pre" functions

//
const User = mongoose.model('User', userSchema);

export default User;