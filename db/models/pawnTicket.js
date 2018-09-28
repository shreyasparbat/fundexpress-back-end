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
        ]);
        return toReturn;
    } catch (error) {
        console.log(error);
    }
};

pawnTicketSchema.methods.findExpiringTicket = function () {
    const pawnTicket = this;
    const pawnTicketObject = pawnTicket.toObject();
    var daysPrior = 7;
    var oneWeekBefore = new Date().setDate(pawnTicketObject.expiryDate - daysPrior);
    var today = new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());

    if (today.getTime() === oneWeekBefore.getTime()) {
        return true;
    }
    return false;
};

pawnTicketSchema.methods.findExpiredTicket = function() {
    const pawnTicket = this;
    const pawnTicketObject = pawnTicket.toObject();
    var today = new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());

    if (today.getTime() === pawnTicketObject.expiryDate.getTime()) {
        pawnTicketObject.expired = true;
    }
    return pawnTicketObject.expired;
};

pawnTicketSchema.methods.findExpiringGracePeriod = function () {
    const pawnTicket = this;
    const pawnTicketObject = pawnTicket.toObject();
    var daysPrior = 7;
    var oneWeekBefore = new Date().setDate(pawnTicketObject.gracePeriodEndDate - daysPrior);
    var today = new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());

    if (today.getTime() === oneWeekBefore.getTime()) {
        return true;
    }
    return false;
};

pawnTicketSchema.methods.findClosedTicket = function() {
    const pawnTicket = this;
    const pawnTicketObject = pawnTicket.toObject();
    var today = new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());

    if (today.getTime() === pawnTicketObject.gracePeriodEndDate.getTime()) {
        pawnTicketObject.closed = true;
    }
    return pawnTicketObject.closed;
};

// Create model and export
const PawnTicket = mongoose.model('PawnTicket', pawnTicketSchema);
module.exports = {PawnTicket};
