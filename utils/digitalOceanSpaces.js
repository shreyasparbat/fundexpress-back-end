// Library imports
const aws = require('aws-sdk');

// Setup S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com');
const s3 = new aws.S3({
    endpoint: spacesEndpoint
});

// Save IC image to digitalOcean
const saveIcImage = (icNumber, icImageFront, icImageBack) => {
    // Check if image has been passed or not
    if (icImageFront === undefined || icImageBack === undefined) {
        return Promise.reject('IC image not given')
    }

    // Save front image
    s3.putObject({
        Body: icImageFront,
        Bucket: "fundexpress-api-storage",
        Key: "ic-images/" + icNumber + "-front.png",
    }, (err) =>  {
        if (err) {
            return Promise.reject(err);
        }
    });

    // Save back image
    s3.putObject({
        Body: icImageBack,
        Bucket: "fundexpress-api-storage",
        Key: "ic-images/" + icNumber + "-back.png",
    }, (err) =>  {
        if (err) {
            return Promise.reject(err);
        }
    });

    // Images saved successfully
    return Promise.resolve()
};

// Retrieve IC image from digitalOcean
const retrieveIcImage = (icNumber) => {

};

module.exports = {
    saveIcImage,
    retrieveIcImage
};