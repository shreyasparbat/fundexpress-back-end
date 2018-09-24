// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

// Custom imports
const {getGoldPrice} = require('../../utils/priceScrapper');

// Define Item Schema
const ItemSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: false,
        minlength: 1
    },
    type: {
        type: String,
        required: true
    },
    material: {
        type: String,
        required: false
    },
    condition:{
        type: String,
        required: false
    },
    weight:{
        type: Number,
        required: false
    },
    purity: {
        type: String,
        required: false
    },
    meltingPercentage: {
        type: Number,
        required: false
    },
    sellPercentage: {
        type: Number,
        required: false
    },
    brand: {
        type: String,
        required: false
    },
    otherComments: {
        type: String,
        required: false
    },
    dateOfPurchase: {
        type: Date,
        required: false
    },
    pawnOfferedValue: {
        type: Number,
        required: false
    },
    sellOfferedValue: {
        type: Number,
        required: false
    }
});

// Override toJson (for returning item profile)
ItemSchema.methods.toJSON = function () {
    const item = this;
    const itemObject = item.toObject();
    return _.pick(itemObject, [
        'name',
        'type',
        'material',
        'brand',
        'purity',
        'goldContentPercentage',
        'weight',
        'condition',
        'dateOfPurchase',
        'pawnOfferedValue',
        'sellOfferedValue'
    ])
};

// Calculate pawn and sell offered values (Gold products only)
ItemSchema.methods.calculateGoldOfferedValues = function(user) {
    try {
        const item = this;

        // Get various parameters for formula
        const goldValuePerGram = getGoldPrice();
        const ltvPercentage = user.currentLtvPercentage;

        // Calulate and save final values
        let pawnOfferedValue = ltvPercentage * user.meltingPercentage * goldValuePerGram * item.weight;
        let sellOfferedValue = user.sellPercentage * goldValuePerGram * item.weight;
        item.set({
            pawnOfferedValue,
            sellOfferedValue
        });

        return item.save()
    } catch (error) {
        throw error;
    }
};

// Calculate pawn and sell offered values (other products)
ItemSchema.methods.calculateOtherOfferedValues = function(user) {
    // Formula not implemented as of now
    const item = this;
    item.set({
        pawnOfferedValue: -1,
        sellOfferedValue: -1
    });
}

ItemSchema.methods.runImageRecognition = function(type) {
    const item = this;
    return Promise.resolve(item);
}

// Create model and export
const Item = mongoose.model('Item', ItemSchema);
module.exports = {Item};
