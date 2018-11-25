// Library imports
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Custom imports
const {User} = require('../db/models/user');
const {Admin} = require('../db/models/admin');

// POST: add a trial user
router.post('/registerTrial', async (req, res) => {
    try {
        // Generate password hash
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        const password = hash;

        // Create and save user
        let user = new User({
            email: req.body.email,
            fullName: req.body.fullName,
            registrationCompleted: false,
            password,
            expoPushToken: req.body.expoPushToken,
            ccToken: ""
        });
        await user.save();

        // Generate user's authentication token
        const token = await user.generateAuthToken();

        // Send back token
        res.header('x-auth', token).send({
            msg: 'success'
        });
    } catch (error) {
        console.log(error.stack);
        res.status(500).send({
            error: error.toString()
        });
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
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }
});

// POST: add admin (On boarding) **Backend use only**
router.post('/adminOnboard', async (req, res) => {
    try {
        // Get info and save
        let body = _.pick(req.body, [
            'email',
            'password',
            'fullName',
            'expoPushToken'
        ]);

        // Get password hash
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(body.password, salt);
        body.password = hash;

        // Save admin
        let admin = new Admin(body);
        await admin.save();

        // Generate user's authentication token
        const token = await admin.generateAuthToken();

        // Send back token
        res.header('x-auth', token).send({
            msg: 'success'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }

});

// POST: Admin login
router.post('/adminLogin', async (req, res) => {
    try {
        let body = _.pick(req.body, ['email', 'password']);

        // Find that admin
        const admin = await Admin.findByCredentials(body.email, body.password);

        // Generate and return token
        const token = await admin.generateAuthToken();
        res.header('x-auth', token).send({
            msg: 'success'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }
});

module.exports = router;
