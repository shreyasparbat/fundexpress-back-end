// Library imports
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Custom imports
const keys = require('../keys');

// Specify aws keys
aws.config.update({
    accessKeyId: keys.awsAccessKeyId,
    secretAccessKey: keys.awsSecretAccessKey,
    region: 'sgp1'
});

// Setup S3 endpoint to DigitalOcean Spaces
var spacesEndpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com');
var s3 = new aws.S3({
    endpoint: spacesEndpoint
});

// Upload IC images
const uploadIC = multer({
    storage: multerS3({
        s3,
        bucket: 'fundexpress-api-storage/ic-images',
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, req.user.ic + '_' + file.fieldname + '.png');
        },
    }),
}).fields([{ name: 'ic-front', maxCount: 1}, {name: 'ic-back', maxCount: 1}]);

// Upload item images
const uploadItem = multer({
    storage: multerS3({
        s3,
        bucket: 'fundexpress-api-storage/item-images',
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, req.itemID + '_' + file.fieldname + '.png');
        },
    }),
}).fields([{ name: 'front', maxCount: 1}, {name: 'back', maxCount: 1}]);

// Export
module.exports = {
    uploadIC,
    uploadItem
};