// Library imports
const _ = require('lodash');
const express = require('express');
const router = express.Router();

// Custom imports
const {saveIcImage} = require('../utils/digitalOceanSpaces');

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
        'mobileNumber',
        'landlineNumber',
        'address',
        'citizenship',
        'nationality'
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
    }).then(() => {
        // Save IC image to digitalocean
        const icImageFront = req.header('x-ic-image-front');
        const icImageBack = req.header('x-ic-image-back');
        return saveIcImage(body.ic, icImageFront, icImageBack);
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