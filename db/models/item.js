// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');

// Custom imports
const {getGoldSilverPrice} = require('../../utils/priceScrapper');

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
    ]);
};

// Calculate pawn and sell offered values (Gold products only)
ItemSchema.methods.calculateGoldOfferedValues = async function(user, purity) {
    const item = this;

    // Calculate meltingPercentage and sellPercentage
    let meltingPercentage = undefined;
    let sellPercentage = undefined;
    if (purity === '24k/999') {
        meltingPercentage = 0.985;
        sellPercentage = 0.97;
    }
    if (purity === '22K/916') {
        meltingPercentage = 0.9;
        sellPercentage = 0.88;
    }
    if (purity === '20K/835') {
        meltingPercentage = 0.835;
        sellPercentage = 0.81;
    }
    if (purity === '18K/750 (Yellow gold)') {
        meltingPercentage = 0.7;
        sellPercentage = 0.7;
    }
    if (purity === '18K/750 (White gold)') {
        meltingPercentage = 0.65;
        sellPercentage = 0.7;
    }
    if (purity === '14K/585') {
        meltingPercentage = 0.5;
        sellPercentage = 0.5;
    }
    if (purity === '9K/375') {
        meltingPercentage = 0.3;
        sellPercentage = 0.27;
    }

    // Get various parameters for formula
    const valuesPerGram = await getGoldSilverPrice();
    const ltvPercentage = user.currentLtvPercentage;

    // Calulate and save final values
    let pawnOfferedValue = ltvPercentage * meltingPercentage * valuesPerGram.gold * item.weight;
    let sellOfferedValue = sellPercentage * valuesPerGram.gold * item.weight;
    item.set({
        pawnOfferedValue,
        sellOfferedValue,
        meltingPercentage,
        sellPercentage
    });

    return item.save();
};

// Calculate pawn and sell offered values (other products)
ItemSchema.methods.calculateOtherOfferedValues = function(user) {
    // Formula not implemented as of now
    const item = this;
    item.set({
        pawnOfferedValue: -1,
        sellOfferedValue: -1
    });
    return item.save();
};

ItemSchema.methods.runImageRecognition = function(type) {
    const item = this;
    return Promise.resolve(item);
};

// Create model and export
const Item = mongoose.model('Item', ItemSchema);
module.exports = {Item};
