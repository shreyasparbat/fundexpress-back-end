// Library imports
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Custom imports
const {User} = require('../db/models/user');

// POST: add user (On boarding)
router.post('/onboard', async (req, res) => {
    try {
        // Get info and save
        let body = _.pick(req.body, [
            'email',
            'password',
            'fullName',
            'gender',
            'dateOfBirth',
            'ic',
            'mobileNumber',
            'landlineNumber',
            'address',
            'addressType',
            'citizenship',
            'race'
        ]);

        // Get password hash
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(body.password, salt);
        body.password = hash;

        // Save user
        let user = new User(body);
        await user.save();

        // Generate user's credit rating
        await user.generateCreditRating();

        // Generate user's block
        await user.generateBlock();

        // Generate user's authentication token
        const token = await user.generateAuthToken();

        // Send back token
        res.header('x-auth', token).send({
            msg: 'success'
        });
    } catch (error) {
        res.status(500).send(error.toString());
    }

});

// POST: User login
router.post('/login', async (req, res) => {
    try {
        let body = _.pick(req.body, ['email', 'password']);

        // Find that user
        const user = await User.findByCredentials(body.email, body.password);

        // Generate and return token
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send({
            msg: 'success'
        })
    } catch (error) {
        res.status(400).send(error.toString());
    }
});

module.exports = router;
