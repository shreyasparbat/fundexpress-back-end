// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');

// Define sellTicket Schema
const sellTicketSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    item: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    dateCreated: {
        type: Date,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    approved: {
        type: Boolean,
        required: true
    }
});

// Override toJson (for returning sellTicket profile)
sellTicketSchema.methods.toJSON = async function () {
    const sellTicket = this;
    return sellTicket.toObject();
};

// Create model and export
const SellTicket = mongoose.model('SellTicket', sellTicketSchema);
module.exports = {SellTicket};
