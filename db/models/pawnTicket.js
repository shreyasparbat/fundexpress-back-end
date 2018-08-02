// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

// Define pawnTicket Schema
const pawnTicketSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        minlength: 1,
    },
    itemId: {
        type: String,
        required: true,
        minlength: 6
    },
    ticketNumber: {
        type: String,
        required: true,
        minlength: 1
    },
    dateCreated: {
        type: String,
        required: true
    },
    expiryDate: {
        type: String,
        required: true
    },
    interestPayable: {
        type: double,
        required: true
    },
    offeredValue: [{
        upperLimit: {
            type: double
        },
        lowerLimit: {
            type: double
        }
    }]
});

// Override toJson (for returning pawnTicket profile)
pawnTicketSchema.methods.toJSON = function () {
    const pawnTicket = this;
    const pawnTicketObject = pawnTicket.toObject();
    return _.pick(pawnTicketObject, [
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
const PawnTicket = mongoose.model('Item', ItemSchema);
module.exports = {PawnTicket};