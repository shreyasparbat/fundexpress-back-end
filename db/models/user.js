// Library imports
const validator = require('validator');
const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const querystring = require('querystring');

// Custom imports
const {getAge} = require('../../utils/modelUtils');

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
    dateOfBirth: {
        type: Date,
        required: false
    },
    age: {
        type: Number,
        required: false
    },
    ic: {
        type: String,
        required: true,
        minlength: 9,
        maxlength: 9
    },
    mobileNumber: {
        type: Number,
        required: true,
        minlength: 8,
        maxlength: 8
    },
    landlineNumber: {
        type: Number,
        minlength: 8,
        maxlength: 8
    },
    address: {
        type: String,
        required: true,
    },
    addressType: {
        type: String,
        required: true
    },
    citizenship: {
        type: String,
        required: true
    },
    race: {
        type: String,
        required: true
    },
    noOfC: {
        type: Number,
        required: true,
        default: 0
    },
    noOfL: {
        type: Number,
        required: true,
        default: 0
    },
    noOfD: {
        type: Number,
        required: true,
        default: 0
    },
    cPercent: {
        type: Number,
        required: true,
        default: 0
    },
    lPercent: {
        type: Number,
        required: true,
        default: 0
    },
    dPercent: {
        type: Number,
        required: true,
        default: 0
    },
    initialCreditRating: {
        type: String,
        required: true,
        default: 'B'
    },
    currentCreditRating: {
        type: String
    },
    initialLtvPercentage: {
        type: Number,
        required: true,
        default: 0.9
    },
    currentLtvPercentage: {
        type: Number
    },
    ethHash: {
        type: 'String',
        default: '0000000000'
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
        'dateOfBirth',
        'age',
        'ic',
        'mobileNumber',
        'landlineNumber',
        'address',
        'addressType',
        'citizenship',
        'race',
        'noOfC',
        'noOfL',
        'noOfD',
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

// Delete token (log out user)
UserSchema.methods.removeToken = function (token) {
    const user = this;

    // Delete token if token passed is user's
    return user.update({
        $pull: {
            tokens: {token}
        }
    })
};

// Generate credit rating when signing up
UserSchema.methods.generateCreditRating = async function () {
    try {
        const user = this;

        // Setup request parameters
        const requestBody = {
            age: getAge(user.dateOfBirth),
            nric: user.ic[0],
            race: user.race[0],
            sex: user.gender,
            nation: user.citizenship[0],
            address: user.addressType,
            tel: user.landlineNumber === null ? 'L' : 'H'
        };
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        // Get predicted default probabilities and credit rating
        const response = await axios.post('http://0.0.0.0:5000/predict', querystring.stringify(requestBody), config);
        console.log(response.data)

        // Update user
        user.set({
            cPercent: response.data.cPercent,
            dPercent: response.data.dPercent,
            lPercent: response.data.lPercent,
            initialCreditRating: response.data.creditRating,
            currentCreditRating: response.data.creditRating,
            initialLtvPercentage: response.data.ltvPercentage,
            currentLtvPercentage: response.data.ltvPercentage
        });
        return await user.save();
    } catch (error) {
        console.log(error)
        throw error
    }
};

// TODO: Generate User's block
UserSchema.methods.generateBlock = function () {
    return Promise.resolve();
};

// Update credit rating
UserSchema.methods.updateCreditRating = async function (deal) {
    const user = this;
    const userObject = user.toObject();
    let ltvPercentage = userObject.initialLtvPercentage;


    // Update ltvPercentage according to deal type
    if (deal === 'C') {
        let noOfC = userObject.noOfC;
        noOfC += 1;
        if (noOfC % 5 === 0) {
            ltvPercentage += 0.001;
        }
        user.set({noOfC});
    } else if (deal === 'L') {
        let noOfL = userObject.noOfL;
        noOfL += 1;
        user.set({noOfL})
        ltvPercentage -= 0.001;
    } else if (deal === 'D') {
        let noOfD = userObject.noOfD;
        noOfD += 1;
        user.set({noOfD});
        ltvPercentage -= 0.01;
    } else {
        throw new Error('Deal type not found');
    }

    // Check whether ltvPercentage is still within acceptable range
    if (ltvPercentage > 0.95) {
        ltvPercentage = 0.95;
    }
    if (ltvPercentage < 0.7) {
        ltvPercentage = 0.7;
    }

    // Update credit rating
    if (ltvPercentage >= 0.95) {
        const creditRating = 'A';
    } else if (ltvPercentage >= 0.9) {
        const creditRating = 'B';
    } else if (ltvPercentage >= 0.85) {
        const creditRating = 'C';
    } else if (ltvPercentage >= 0.8) {
        const creditRating = 'D';
    } else if (ltvPercentage >= 0.75) {
        const creditRating = 'E';
    } else if (ltvPercentage >= 0.7) {
        const creditRating = 'F';
    } else {
        throw new Error('Credit rating has fallen too low');
    }
    user.set({
        currentCreditRating: creditRating,
        currentLtvPercentage: ltvPercentage
    })

    // Save user
    return await user.save();
}

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
                bcrypt.compare(password, user.password, (err, result) => {
                    if (result) {
                        resolve(user);
                    } else {
                        reject('Passwords do not match');
                    }
                });
            });
        }
    });
};

// Create model and export
const User = mongoose.model('User', UserSchema);
module.exports = {User};
