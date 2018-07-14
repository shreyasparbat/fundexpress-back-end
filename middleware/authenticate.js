const {User} = require('../db/models/user');

const authenticate = (req, res, next) => {
    const token = req.header('x-auth');

    // Find user with that token
    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject('User not found');
        } else {
            // Add user data to req
            req.user = user;
            req.token = token;

            // Call next() so that program moves forward
            next();
        }
    }).catch((e) => {
        res.status(401).send(e);
    });
};

module.exports = authenticate;