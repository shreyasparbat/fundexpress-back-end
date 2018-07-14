const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}).then(() => {
    console.log('Connected to mongodb');
}).catch((err) => {
    console.log({
        msg: 'Unable to connect to mongodb',
        err
    });
});

module.exports = {
    mongoose
};