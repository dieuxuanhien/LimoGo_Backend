
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   
    email: {
        type: String,
        required: [true,"Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true,"Password is required"],
        trim:true,
        select: false,
    },
    phoneNumber: {
        type: String,
        required: [true,"Phone number is required"],
        unique: true,
    },
    userRole: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    verified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
        select: false,
    },
    verificationCodeValidation: {
        type: Number,
        select: false,
    },
    resetPasswordCode: {
        type: String,
        select: false,
    },
    resetPasswordCodeValidation: {
        type: Number,
        select: false,
    },
    }, { timestamps: true });


module.exports = mongoose.model('User', userSchema);