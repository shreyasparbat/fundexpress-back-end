// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');

// Define pawnTicket Schema
const pawnTicketSchema = new mongoose.Schema({
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
    expiryDate: {
        type: Date,
        required: true
    },
    interestPayable: {
        type: Number,
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
        'offeredValue',
        'approvalStatus'
    ])
};

// Create model and export
const PawnTicket = mongoose.model('PawnTicket', pawnTicketSchema);
module.exports = {PawnTicket};
