// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');

// Define watchPrice Schema
const watchPriceSchema = new mongoose.Schema({
    source: {
        type: String
    },
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    serialNumber: {
        type: String,
        required: true
    },
    sellingPrice: {
        type: Number,
        required: true
    },
    pawnValue: {
        type: Number,
        required: true
    },
    buybackValue: {
        type: Number,
        required: true
    }
});

// Create model and export
const WatchPrice = mongoose.model('WatchPrice', watchPriceSchema);
module.exports = {WatchPrice};
