// Library imports
const _ = require('lodash');
const express = require('express');
const router = express.Router();

// Custom imports
const {User} = require('../db/models/user');
const {authenticate} = require('../middleware/authenticate');

// Add middleware
router.use(authenticate);

// POST: update user profile
router.post('/update', (req, res) => {
    // Get info and update
    let body = _.pick(req.body, [
        'email',
        'password',
        'fullName',
        'gender',
        'age',
        'phoneNumber',
        'address'
    ]);

    // Save user
    user.save().then(() => {
        // Generate user's credit rating
        return user.generateCreditRating();
    }).then(() => {
        // Generate user's authentication token
        return user.generateAuthToken();
    }).then((token) => {
        // Send back token
        res.header('x-auth', token).send({
            msg: 'success'
        });
    }).catch((err) => {
        res.status(500).send({
            error: err
        });
    });
});

// POST: User login
router.post('/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);

    // Find that user
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send({
            msg: 'success'
        });
    }).catch((error) => {
        res.status(400).send({error});
    });
});

module.exports = router;
