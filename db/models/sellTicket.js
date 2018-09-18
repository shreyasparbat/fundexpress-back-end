// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');

// Custom import
const {Item} = require('./item');

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
sellTicketSchema.methods.toJSON = async function () {
    try {
        const sellTicket = this;

        // Get Sell ticket information
        const sellTicketObject = sellTicket.toObject();
        let toReturn = _.pick(sellTicketObject, [
            'userID',
            'itemID',
            'dateCreated',
            'offeredValue',
            'approved'
        ])
        toReturn.ticketID = sellTicketObject._id;
    
        // Get Item information
        const item = await Item.findById(sellTicketObject._id);
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
const SellTicket = mongoose.model('SellTicket', sellTicketSchema);
module.exports = {SellTicket};
