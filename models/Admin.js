import mongoose from 'mongoose';
const { Schema } = mongoose;

const adminSchema = new Schema({
    fullname: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    password: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    email: {
        type: String,
        required: true,
        help: 'This field is required'
    }
});

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;