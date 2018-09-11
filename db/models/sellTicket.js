// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');

// Define sellTicket Schema
const sellTicketSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    itemID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    ticketNumber: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        required: true
    },
    offeredValue: {
        type: Number,
        required: true
    },
    approvalStatus: {
        type: Boolean,
        required: true
    }
});

// Override toJson (for returning sellTicket profile)
sellTicketSchema.methods.toJSON = function () {
    const sellTicket = this;
    const sellTicketObject = sellTicket.toObject();
    return _.pick(sellTicketObject, [
        'userId',
        'itemId',
        'ticketNumber',
        'dateCreated',
        'offeredValue',
        'approvalStatus'
    ])
};

// Create model and export
const SellTicket = mongoose.model('SellTicket', sellTicketSchema);
module.exports = {SellTicket};
