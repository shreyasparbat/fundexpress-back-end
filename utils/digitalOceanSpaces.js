// Library imports
const aws = require('aws-sdk');

// Setup S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com');
const s3 = new aws.S3({
    endpoint: spacesEndpoint
});

// Save IC image to digitalOcean
const saveIcImage = (icNumber, icImageFront, icImageBack) => {
    return new Promise((resolve, reject) => {
        //Check if image has been passed or not
        if (icImageFront === undefined || icImageBack === undefined) {
            reject('IC image not given')
        }

        // Save front image
        s3.putObject({
            Body: icImageFront,
            ContentType: 'image/jpeg',
            Bucket: "fundexpress-api-storage",
            Key: "ic-images/" + icNumber + "-front.jpg",
        }, (err) =>  {
            if (err) reject(err)
        });

        // Save back image
        s3.putObject({
            Body: icImageBack,
            ContentType: 'image/jpeg',
            Bucket: "fundexpress-api-storage",
            Key: "ic-images/" + icNumber + "-back.jpg",
        }, (err) =>  {
            if (err) reject(err)
        });

        // Images saved successfully
        resolve();
    })
};

//Retrieve only front IC image from digitalOcean
const retrieveIcImage = (icNumber) => {
    return new Promise((resolve, reject) => {
        // Get and return image
        s3.getObject({
            Bucket: "fundexpress-api-storage",
            ResponseContentType: 'image/jpeg',
            Key: "ic-images/" + icNumber + "-front.jpg",
        }, (err, data) => {
            if (err) reject(err);
            return resolve(data);
        })
    })
};

// //Retrieve only front IC image from digitalOcean
// const retrieveIcImage = async (icNumber) => {
//     // Get and return image
//     s3.getObject({
//         Bucket: "fundexpress-api-storage",
//         ResponseContentType: 'image/jpeg',
//         Key: "ic-images/" + icNumber + "-front.jpg",
//     }, (err, data) => {
//         if (err) throw err;
//         return data;
//     })
// };

// Retrieve both front and back IC image from digitalOcean
const retrieveIcImages = (icNumber) => {
    return new Promise((resolve, reject) => {
        let imageList = [];

        // Get front image
        s3.getObject({
            Bucket: "fundexpress-api-storage",
            ResponseContentType: 'image/jpeg',
            Key: "ic-images/" + icNumber + "-front.jpg",
        }, (err, data) =>  {
            if (err) reject(err);
            imageList.push({
                type: 'front',
                image: data
            })
        });

        // Get back image
        s3.getObject({
            Bucket: "fundexpress-api-storage",
            ResponseContentType: 'image/jpeg',
            Key: "ic-images/" + icNumber + "-back.jpg",
        }, (err, data) =>  {
            if (err) reject(err);
            imageList.push({
                type: 'back',
                image: data
            })
        });

        resolve(imageList)
    })
};

module.exports = {
    saveIcImage,
    retrieveIcImage,
    retrieveIcImages
};