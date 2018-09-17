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
    dateCreated: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    gracePeriodEndDate: {
        type: Date,
        required: true
    },
    interestPayable: {
        type: Number,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    approved: {
        type: Boolean,
        required: true
    },
    closed: {
        type: Boolean,
        required: true
    },
    expired: {
        type: Boolean,
        default: false
    },
    gracePeriodEnded: {
        type: Boolean,
        defualt: true
    }
});

// Override toJson (for returning pawnTicket)
pawnTicketSchema.methods.toJSON = function () {
    const pawnTicket = this;
    const pawnTicketObject = pawnTicket.toObject();
    let toReturn = _.pick(pawnTicketObject, [
        'userID',
        'itemID',
        'dateCreated',
        'expiryDate',
        'interestPayable',
        'value',
        'approved'
    ])
    toReturn.ticketID = pawnTicketObject._id;
    return toReturn;
};

// Create model and export
const PawnTicket = mongoose.model('PawnTicket', pawnTicketSchema);
module.exports = {PawnTicket};
