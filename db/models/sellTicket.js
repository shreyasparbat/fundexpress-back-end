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
sellTicketSchema.methods.toJSON = function () {
    const sellTicket = this;
    const sellTicketObject = sellTicket.toObject();
    let toReturn = _.pick(sellTicketObject, [
        'userID',
        'itemID',
        'dateCreated',
        'offeredValue',
        'approved'
    ])
    toReturn.ticketID = sellTicketObject._id;
    return toReturn;
};

// Create model and export
const SellTicket = mongoose.model('SellTicket', sellTicketSchema);
module.exports = {SellTicket};
