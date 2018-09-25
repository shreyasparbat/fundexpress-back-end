//Library imports
const validator = require('validator');
const mongoose = require('mongoose');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Define Admin Schema
const AdminSchema = new mongoose.Schema({
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
    }
});

// Override toJson (for returning admin profile)
AdminSchema.methods.toJSON = function () {
    const admin = this;
    const adminObject = admin.toObject();
    return _.pick(adminObject, [
        'email',
        'fullName'
    ])
};

// Generate Authentication tokens
AdminSchema.methods.generateAuthToken = function () {
    // Create token
    const admin = this;

    // Check if token already exists
    if (admin.tokens['0'] !== undefined) {
        throw new Error('User already logged in');
    }

    // Create token
    const access = 'auth';
    const token = jwt.sign({
        _id: admin._id,
        access
    }, 'someSecretSalt');

    // Save token (using concat instead of push)
    admin.tokens = admin.tokens.concat([{access, token}]);
    return admin.save().then(() => {
        return token;
    })

// Delete token (log out admin)
AdminSchema.methods.removeToken = function (token) {
    const admin = this;

    // Delete token if token passed is admins
    return admin.update({
        $pull: {
            tokens: {token}
        }
    })
};

// Find admin by token
AdminSchema.statics.findByToken = function (token) {
    const Admin = this;
    let decoded;
    // Verify token
    try {
        decoded = jwt.verify(token, 'someSecretSalt');
    } catch (e) {
        return Promise.reject(e);
    }

    return Admin.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
};

// Find admin by credentials
AdminSchema.statics.findByCredentials = function (email, password) {
    // Get admin with that email
    return Admin.findOne({email}).then((admin) => {
        // Check if admin exists
        if (!admin) {
            // Return reject promise
            return Promise.reject('Admin does not exist');
        } else {
            return new Promise((resolve, reject) => {
                // Check if password is correct
                bcrypt.compare(password, admin.password, (err, result) => {
                    if (result) {
                        resolve(admin);
                    } else {
                        reject('Passwords do not match');
                    }
                });
            });
        }
    });
};

// Create model and export
const Admin = mongoose.model('Admin', AdminSchema);
module.exports = {Admin};
