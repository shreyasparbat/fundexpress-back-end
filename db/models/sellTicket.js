// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');

// Define sellTicket Schema
const sellTicketSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true
    },
    itemId: {
        type: ObjectId,
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
    offeredValue: [{
        upperLimit: {
            type: Number,
            required: true
        },
        lowerLimit: {
            type: Number,
            required: true
        }
    }]
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
        'expiryDate',
        'interestPayable',
        'offeredValue'
    ])
};

// Create model and export
const SellTicket = mongoose.model('SellTicket', sellTicketSchema);
module.exports = {SellTicket};