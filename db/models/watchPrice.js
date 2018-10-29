// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');

// Define watchPrice Schema
const watchPriceSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    value: {
        type: Number
    }
});

// Create model and export
const WatchPrice = mongoose.model('WatchPrice', watchPriceSchema);
module.exports = {WatchPrice};
