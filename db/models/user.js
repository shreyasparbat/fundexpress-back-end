const mongoose = require('mongoose');
const validator = require('validator');

const User = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }],
    fullName: {
        type: String,
        required: true,
        minlength: 1
    },
    gender: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true
    },
    ic: {
        type: String,
        required: true,
        minlength: 9,
        maxlength: 9
    },
    phoneNumber: {
        type: Number,
        required: true,
        minlength: 8,
        maxlength: 8
    },
    address: {
        type: String,
        required: true,
    },
    creditRating: {
        type: Number,
        required: true,
        value: 0
    },
    itemsPawned: [{
        itemId: {
            type: String
        }
    }]
});
