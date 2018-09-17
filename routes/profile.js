// Library imports
const _ = require('lodash');
const express = require('express');
const router = express.Router();

// Custom imports
const {User} = require('../db/models/user');
const {authenticate} = require('../middleware/authenticate');
const {retrieveIcImage} = require('../utils/digitalOceanSpaces');
const {uploadIC} = require('../utils/digitalOceanSpaces');

// Add middleware
router.use(authenticate);

// POST: get user profile
router.post('/me', (req, res) => {
    res.send(req.user);
});

// DELETE: log user out
router.delete('/logout', (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.send({
            msg: 'Log out successful'
        })
    }).catch((e) => {
        res.status(400).send(e.toString());
    })
});

// POST: get ic image from digitalOcean
router.post('/icImage', (req, res) => {
    const icNumber = req.user.ic;
    retrieveIcImage(icNumber).then((image) => {
        res.send({image});
    }).catch((error) => {
        res.status(500).send(error.toString())
    })
});

// POST: update user
router.post('/edit', (req, res) => {
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

    // Update the user
    const _id = req.user._id;
    User.findByIdAndUpdate(_id, {
        $set: body
    }, (error) => {
        if (error) res.status(500).send(error.toString());

        // Send back updated user (the user provided to this callback is the old one)
        User.findById(_id).then((user) => {
        res.send(user);
        }).catch((error) => {
            res.status(500).send(error.toString());
        });
    });
});

router.post('/uploadIc', (req, res) => {
    uploadIC(req, res, function (e) {
        if (e) {
            console.log(e);
            return
        } else {
            console.log('successfully uploaded');
        }
    });
})

module.exports = router;
