// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

// Custom imports
const {getGoldPrice} = require('../../utils/priceScrapper');

// Define Item Schema
const ItemSchema = new mongoose.Schema({
    userId: {
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
        required: true,
        minlength: 6
    },
    material: {
        type: String,
        required: false,
        minlength: 1
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
    goldContentPercentage: {
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

// Calculate pawn and sell offered values
ItemSchema.methods.calculateOfferedValues = function() {
    try {
        const item = this;

        // Get various parameters for formula
        const goldValuePerGram = getGoldPrice();
        const ltvPercentage = user.currentLtvPercentage;
        const meltingPrice = item.goldContentPercentage * goldValuePerGram;

        // Calulate and save final values
        let pawnOfferedValue = ltvPercentage * meltingPrice * item.weight;
        item.set({
            pawnOfferedValue,
            sellOfferedValue: pawnOfferedValue + item.weight * 1.5
        });

        return item.save()
    } catch (error) {
        throw error
    }
};

ItemSchema.methods.runImageRecognition = function(type) {
    const item = this;
    return Promise.resolve(item);
}

// Create model and export
const Item = mongoose.model('Item', ItemSchema);
module.exports = {Item};
