const { Schema, model } = require('mongoose');

const userSchema = new Schema({
   
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
    name: {
        type: String,
    },
    dateOfBirth: {
        type: Date,

    },
    gender: {
        type: String,
        enum:
        ['Male', 'Female', 'Khác'],
    },


    userRole: {
        type: String,
        enum: ['admin', 'customer','provider'],
        default: 'customer',
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


module.exports = model('User', userSchema);