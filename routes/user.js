// Library imports
const express = require('express');
const router = express.Router();

// Custom imports
const {mongoose} = require('../db/mongoose');
const {User} = require('../db/models/user');
const {authenticate} = require('../middleware/authenticate');

// POST: add user (On boarding)
app.post('/onboard', (req, res) => {
    // Get info and save
    let body = _.pick(req.body, ['email', 'password', 'tokens']);
    let user = new User(body);

    // Save user
    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
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

// GET: get user profile
app.get('/profile', authenticate, (req, res) => {
    res.send(req.user);
});

// POST: User login
app.post('/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);

    // Find that user
    User.findByCredentials(body.email, body.password).then((user) => {
        res.send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

module.exports = router;
