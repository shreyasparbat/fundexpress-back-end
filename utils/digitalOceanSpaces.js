// Library imports
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Setup S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com');
const s3 = new aws.S3({
    endpoint: spacesEndpoint
});

// Upload object to digitalOcean spaces
const upload = multer({
    storage: multerS3({
        s3,
        bucket: 'fundexpress-api-storage',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key (name, file, callback) {
            console.log('Saving file' + name);
            callback(null, name);
        }
    })
}).array('upload', 1);

// Save IC image to digitalOcean
const saveIcImage = (icNumber, icImageFront, icImageBack) => {

};

// Retrieve IC image from digitalOcean
const retrieveIcImage = (icNumber) => {

};

module.exports = {
    saveIcImage,
    retrieveIcImage
};