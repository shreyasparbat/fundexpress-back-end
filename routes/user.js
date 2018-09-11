// Library imports
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Custom imports
const {User} = require('../db/models/user');
const {saveIcImage} = require('../utils/digitalOceanSpaces');
const date = new Date();

aws.config.update({
    accessKeyId: 'MYGXL6K2SUTP4JYKXUOG',
    secretAccessKey: '08Ie+rca1DsgxoiHpVGeEQF9smEnkVx2Nu391xec96M',
    region: 'sgp1'
});

const spacesEndpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com/ic-images');
const s3 = new aws.S3({
    endpoint: spacesEndpoint
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'fundexpress-api-storage',
    acl: 'public-read',
    key: function (req, file, cb) {
      console.log(file);
      cb(null, date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + '_' +
            + file.fieldname + '.jpg');
    },
  }),
}).fields([{ name: 'front', maxCount: 1}, {name: 'back', maxCount: 1}]);




// POST: add user (On boarding)
router.post('/onboard', (req, res) => {
    try {
        upload(async (req, res) => {
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

            if (e) {
                console.log(e)
                return
            } else {
                console.log('image successfully uploaded');
            }
        });

        // call functions from digitalocean
        // await saveIcImage(body.ic, icImageFront, icImageBack);

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
