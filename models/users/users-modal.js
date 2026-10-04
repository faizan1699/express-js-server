

import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        required: false,
        length: 6,
        select: false
    },
    password: {
        type: String,
        required: true,
        select: false
    }
})

const Users = mongoose.model('Users', userSchema);

export default Users;