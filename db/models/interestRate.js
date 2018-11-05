// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');

// Define interestRate Schema
const interestRateSchema = new mongoose.Schema({
    dateUpdated: {
        type: Date,
        required: true
    },
    firstMonthRate: {
        type: Number,
        required: true
    },
    normalRate: {
        type: Number,
        required: true
    }
});

// Create model and export
const InterestRate = mongoose.model('InterestRate', interestRateSchema);
module.exports = {InterestRate};