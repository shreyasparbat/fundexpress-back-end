const {User} = require('../db/models/user');


const authenticate = (req, res, next) => {
    const token = req.body['x-auth'];
    console.log(token);

    // Find user with that token
    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject('User not found or logged out');
        } else {
            // Add user data to req
            req.user = user;
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