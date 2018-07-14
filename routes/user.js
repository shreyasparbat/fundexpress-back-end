// Library imports
const _ = require('lodash');
const express = require('express');
const router = express.Router();

// Custom imports
const {User} = require('../db/models/user');

// POST: add user (On boarding)
router.post('/onboard', (req, res) => {
    // Get info and save
    let body = _.pick(req.body, [
        'email',
        'password',
        'fullName',
        'gender',
        'age',
        'ic',
        'phoneNumber',
        'address'
    ]);
    let user = new User(body);

    // Save user
    user.save().then(() => {
        // Generate user's credit rating
        return user.generateCreditRating();
    }).then(() => {
        // Generate user's block
        return user.generateBlock();
    }).then(() => {
        // Generate user's authentication token
        return user.generateAuthToken();
    }).then((token) => {
        // Send back token
        res.header('x-auth', token).send({
            user
        });
    }).catch((err) => {
        res.status(500).send({
            msg: 'error',
            err
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
            user
        });
    }).catch((e) => {
        res.status(400).send(e);
    });
});

module.exports = router;