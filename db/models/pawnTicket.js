// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');

// Define pawnTicket Schema
const pawnTicketSchema = new mongoose.Schema({
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
    expiryDate: {
        type: Date,
        required: true
    },
    gracePeriodEndDate: {
        type: Date,
        required: true
    },
    indicativeTotalInterestPayable: {
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
    outstandingPrincipal: {
        type: Number,
        required: true
    }, 
    outstandingInterest: {
        type: Number,
        required: true
    },
});

// Override toJson (for returning pawnTicket)
pawnTicketSchema.methods.toJSON = async function () {
    const pawnTicket = this;
    return pawnTicket.toObject();
};
// Checks if ticket is expiring in a week
pawnTicketSchema.methods.findExpiringTicket = function () {
    const pawnTicket = this;
    const pawnTicketObject = pawnTicket.toObject();
    var daysPrior = 7;
    var oneWeekBefore = new Date();
    oneWeekBefore.setDate(pawnTicketObject.expiryDate - daysPrior);

    if (new Date().getFullYear() === oneWeekBefore.getFullYear() && new Date().getMonth() === oneWeekBefore.getMonth() && new Date().getDate() === oneWeekBefore.getDate()) {
        return true;
    }
    return false;
};

// Checks if ticket expiry date is today
pawnTicketSchema.methods.findExpiredTicket = function() {
    const pawnTicket = this;
    const pawnTicketObject = pawnTicket.toObject();

    if (new Date().getFullYear() === pawnTicketObject.expiryDate.getFullYear() && new Date().getMonth() === pawnTicketObject.expiryDate.getMonth() && new Date().getDate() === pawnTicketObject.expiryDate.getDate()) {
        pawnTicketObject.expired = true;
    }
    return pawnTicketObject.expired;
};

//Checks if grace period ends in a week
pawnTicketSchema.methods.findExpiringGracePeriod = function () {
    const pawnTicket = this;
    const pawnTicketObject = pawnTicket.toObject();
    var daysPrior = 7;
    var oneWeekBefore = new Date();
    oneWeekBefore.setDate(pawnTicketObject.gracePeriodEndDate - daysPrior);

    if (new Date().getFullYear() === oneWeekBefore.getFullYear() && new Date().getMonth() === oneWeekBefore.getMonth() && new Date().getDate() === oneWeekBefore.getDate()) {
        return true;
    }
    return false;
};

// Checks if grace period has ended and closes the ticket
pawnTicketSchema.methods.findClosedTicket = function() {
    const pawnTicket = this;
    const pawnTicketObject = pawnTicket.toObject();

    if (new Date().getFullYear() === pawnTicketObject.gracePeriodEndDate.getFullYear() && new Date().getMonth() === pawnTicketObject.gracePeriodEndDate.getMonth() && new Date().getDate() === pawnTicketObject.gracePeriodEndDate.getDate()) {
        pawnTicketObject.closed = true;
    }
    return pawnTicketObject.closed;
};

// Create model and export
const PawnTicket = mongoose.model('PawnTicket', pawnTicketSchema);
module.exports = {PawnTicket};
