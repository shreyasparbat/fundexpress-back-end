// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');

// Custom import
const {Item} = require('./item');

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
pawnTicketSchema.methods.toJSON = async function () {
    try {
        const pawnTicket = this;

        // Get Pawn ticket information
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

        // Get Item information
        const item = await Item.findById(pawnTicketObject._id);
        if (!item) {
            throw new Error('No item found');
        }
        toReturn.item = item;

        // Return
        return toReturn;
    } catch (error) {
        console.log(error);
    }
};

// Create model and export
const PawnTicket = mongoose.model('PawnTicket', pawnTicketSchema);
module.exports = {PawnTicket};
