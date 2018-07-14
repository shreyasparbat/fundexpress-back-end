// Library imports
const validator = require('validator');
const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Define User Schema
const UserSchema = new mongoose.Schema({
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
    }],
    ethHash: {
        type: String,
        required: true,
        value: 'nothing here yet'
    }
});

// Add password hashing middleware
UserSchema.pre('save', function (next) {
    const user = this;

    // Check if password has already been hashed
    if (!user.isModified('password')) {
        // Generate salt and hash password
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                // Update document
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

// Override toJson (for returning user profile)
UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    return _.pick(userObject, [
        '_id',
        'email',
        'fullName',
        'gender',
        'age',
        'ic',
        'phoneNumber',
        'address',
        'ethHash'
    ])
};

// Generate Authentication tokens
UserSchema.methods.generateAuthToken = function () {
    // Create token
    const user = this;
    const access = 'auth'; // to specify the type of token
    const token = jwt.sign({
        _id: user._id,
        access
    }, 'someSecretSalt');

    // Save token (using concat instead of push)
    user.tokens = user.tokens.concat([{access, token}]);
    return user.save().then(() => {
        return token;
    })
};

// TODO: Generate credit rating when signing up
UserSchema.methods.generateCreditRating = function () {
    return Promise.resolve();
};

// TODO: Generate User's block
UserSchema.methods.generateBlock = function () {
    return Promise.resolve();
};

// Find user by token
UserSchema.statics.findByToken = function (token) {
    const User = this;
    let decoded;
    // Verify token
    try {
        decoded = jwt.verify(token, 'someSecretSalt');
    } catch (e) {
        return Promise.reject(e);
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
};

// Find user by credentials
UserSchema.statics.findByCredentials = function (email, password) {
    // Get user with that email
    return User.findOne({email}).then((user) => {
        // Check if user exists
        if (!user) {
            // Return reject promise
            return Promise.reject('User does not exist');
        } else {
            return new Promise((resolve, reject) => {
                // Check if password is correct
                bcrypt.compare(user.password, password, (err, result) => {
                    if (result) {
                        resolve(user);
                    } else {
                        reject(err);
                    }
                });
            });
        }
    });
};

// Create model and export
const User = mongoose.model('User', UserSchema);
module.exports = {User};
