

import mongoose from "mongoose";


const userScheema = new mongoose.Schema({
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
    password: {
        type: String,
        required: true
    }
})

const Users = mongoose.model('Users', userScheema);

module.exports = Users;