// Library imports
const mongoose = require('mongoose');

// Specify which promise library mongoose should use
mongoose.Promise = global.Promise;

// Connect to DB
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true}).then(() => {
    console.log('Connected to mongodb');
}).catch((err) => {
    console.log({
        msg: 'Unable to connect to mongodb',
        err
    });
});

// Export mongoose
module.exports = {
    mongoose
};