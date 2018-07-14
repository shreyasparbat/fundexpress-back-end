// Library imports
const express = require('express');
const router = express.Router();

// Custom imports
const {mongoose} = require('../db/mongoose');
const {User} = require('../db/models/user');
const {authenticate} = require('../middleware/authenticate');

// POST: add user (On boarding)
router.post('/onboard', (req, res) => {
    // Get info and save
    let body = _.pick(req.body, [
        'email',
        'password',
        'tokens',
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
        res.send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// GET: get user profile
router.get('/profile', authenticate, (req, res) => {
    res.send(req.user);
});

module.exports = router;