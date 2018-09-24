const {Admin} = require('../db/models/admin');


const authenticate = (req, res, next) => {
    const token = req.header('x-auth');

    // Find admin with that token
    Admin.findByToken(token).then((admin) => {
        if (!admin) {
            return Promise.reject('Admin not found or logged out');
        } else {
            // Add admin data to req
            req.admin = admin;
            req.token = token;

            // Call next() so that program moves forward
            next();
        }
    }).catch((error) => {
        console.log(error);
        res.status(401).send({error});
    });
};

module.exports = {
    authenticate
};