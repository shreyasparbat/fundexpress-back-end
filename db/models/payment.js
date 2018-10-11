// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');

// Define payment Schema
const paymentSchema = new mongoose.Schema({
    ticketID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    paymentAmount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    success: {
        type: Boolean,
        required: true
    }
});

// Create model and export
const Payment = mongoose.model('Payment', paymentSchema);
module.exports = {Payment};
