// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');
const axios = require('axios');
const querystring = require('querystring');

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
    let meltingPercentage = 0.7;
    let sellPercentage = 0.7;
    if (purity === '24k/999') {
        meltingPercentage = 0.985;
        sellPercentage = 0.97;
    }
    if (purity === '22k/916') {
        meltingPercentage = 0.9;
        sellPercentage = 0.88;
    }
    if (purity === '20k/835') {
        meltingPercentage = 0.835;
        sellPercentage = 0.81;
    }
    if (purity === '18k/750 (Yellow gold)') {
        meltingPercentage = 0.7;
        sellPercentage = 0.7;
    }
    if (purity === '18k/750 (White gold)') {
        meltingPercentage = 0.65;
        sellPercentage = 0.7;
    }
    if (purity === '14k/585') {
        meltingPercentage = 0.5;
        sellPercentage = 0.5;
    }
    if (purity === '9k/375') {
        meltingPercentage = 0.3;
        sellPercentage = 0.27;
    }

    // Get gold prices
    const valuesPerGram = await getGoldSilverPrice();

    // Get user's current ltv percentage
    let ltvPercentage = user.currentLtvPercentage;
    if (user.registrationCompleted == false) {
        ltvPercentage = 0.9;
    }
    
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

// Calculate pawn and sell offered values (Silver products only)
ItemSchema.methods.calculateSilverOfferedValues = async function(user, purity) {
    const item = this;

    // Set meltingPercentage
    let meltingPercentage = 0.65;

    //Set purity
    purity = parseInt(purity);
    purity /= 100;

    // Get gold prices
    const valuesPerGram = await getGoldSilverPrice();

    // Get user's current ltv percentage
    let ltvPercentage = user.currentLtvPercentage;
    if (user.registrationCompleted == false) {
        ltvPercentage = 0.9;
    }
    
    // Calulate and save final values
    let pawnOfferedValue = ltvPercentage * purity * meltingPercentage * valuesPerGram.silver * item.weight;
    let sellOfferedValue = meltingPercentage * purity * valuesPerGram.weight * item.weight;
    item.set({
        pawnOfferedValue,
        sellOfferedValue,
        meltingPercentage
    });

    return item.save();
};

// Calculate pawn and sell offered values (Watches)
ItemSchema.methods.calculateWatchOfferedValues = function() {
    // Formula not implemented as of now
    const item = this;
    item.set({
        pawnOfferedValue: -1,
        sellOfferedValue: -1
    });
    return item.save();
};

// Calculate pawn and sell offered values (Jewel)
ItemSchema.methods.calculateJewelOfferedValues = function() {
    // Formula not implemented as of now
    const item = this;
    item.set({
        pawnOfferedValue: -1,
        sellOfferedValue: -1
    });
    return item.save();
};

ItemSchema.methods.runImageRecognition = async function(itemID) {
    try {
        console.log(itemID);
        // Get predicted default probabilities and credit rating
        const response = await axios.post('http://206.189.145.2:5000/bar_ocr', querystring.stringify({
            itemID: itemID.toString()
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        console.log(response.data);
        
        return {
            brand: 'Generic',
            weight: 5,
            purity: '24k/999'
        };
    } catch (error) {
        throw error;
    }
};

// Create model and export
const Item = mongoose.model('Item', ItemSchema);
module.exports = {Item};
