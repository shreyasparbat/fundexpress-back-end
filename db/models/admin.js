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
    },
    expoPushToken: {
        type: String
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
    });
};

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
    });
};

// Find admin by credentials
AdminSchema.statics.findByCredentials = async function (email, password) {
    const Admin = this;
    
    // Get admin with that email
    const admin = await Admin.findOne({email});

    // Check if admin exists
    if (!admin) {
        // Return reject promise
        throw new Error('Admin does not exist');
    } else {
        // Compare passwords
        const result = await bcrypt.compare(password, admin.password);
        if (result) {
            return admin;
        } else {
            throw new Error('Passwords do not match');
        }
    }
};

// Create model and export
const Admin = mongoose.model('Admin', AdminSchema);
module.exports = {Admin};
