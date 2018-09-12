// Library imports
const _ = require('lodash');
const express = require('express');
const router = express.Router();

// Custom imports
const {User} = require('../db/models/user');
const {uploadIC} = require('../utils/digitalOceanSpaces');

// POST: add user (On boarding)
router.post('/onboard', (req, res) => {
    try {
        uploadIC(async (req, res) => {
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
            let user = new User(body);

            // Save user
            await user.save();

            // Generate user's credit rating
            await user.generateCreditRating();

            // Generate user's block
            await user.generateBlock();
            // console.log(req.body.ic)

            // Generate user's authentication token
            const token = await user.generateAuthToken();

            // Send back token
            res.header('x-auth', token).send({
                msg: 'success'
            });

            // Console log if everything goes well
            console.log('Onboarding complete, image uploaded')
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(error);
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
        res.status(400).send({error});
    }
});

// POST: Uplaod IC Images
router.post('/uploadIc', (req, res) => {

});

module.exports = router;
