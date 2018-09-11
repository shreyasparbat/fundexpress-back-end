// Library imports
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

aws.config.update({
    accessKeyId: 'MYGXL6K2SUTP4JYKXUOG',
    secretAccessKey: '08Ie+rca1DsgxoiHpVGeEQF9smEnkVx2Nu391xec96M',
    region: 'sgp1'
});

const spacesEndpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com/ic-images');
const s3 = new aws.S3({
    endpoint: spacesEndpoint
});

const frontUpload = multer({
  storage: multerS3({
    s3,
    bucket: 'fundexpress-api-storage',
    acl: 'public-read',
    key: function (req, file, cb) {
      console.log(file);
      cb(null, Date.now() + "_front");
    },
  }),
}).single('front');

const backUpload = multer({
  storage: multerS3({
    s3,
    bucket: 'fundexpress-api-storage',
    acl: 'public-read',
    key: function (req, file, cb) {
      console.log(file);
      cb(null, Date.getFullYear().toString() + "_back");
    },
  }),
}).single('back');

//fields([{ name: 'front', maxCount: 1}, {name: 'back', maxCount: 1}]);


// Custom imports
const {User} = require('../db/models/user');
const {saveIcImage} = require('../utils/digitalOceanSpaces');

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
        let user = new User(body);

        // Save user
        await user.save();

        // Generate user's credit rating
        await user.generateCreditRating();

        // Generate user's block
        await user.generateBlock();

        // Save IC image to digitalOcean
        // const icImageFront = req.header('x-ic-image-front');
        // const icImageBack = req.header('x-ic-image-back');
        // await saveIcImage(body.ic, icImageFront, icImageBack);

        // Generate user's authentication token
        const token = await user.generateAuthToken();

        // Send back token
        res.header('x-auth', token).send({
            msg: 'success'
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
    frontUpload(req, res, function (e) {
        if (e) {
          console.log(e)
          return
      } else {
          console.log('front image successfully uploaded');
      }
    });
     backUpload(req, res, function (e) {
        if (e) {
          console.log(e)
          return
      } else {
          console.log('back image successfully uploaded');
      }
    });
});

module.exports = router;
