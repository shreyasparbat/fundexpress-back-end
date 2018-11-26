// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');
const axios = require('axios');
const querystring = require('querystring');

// Custom imports
const {getGoldSilverPrice} = require('../../utils/priceScrapper');
const {get_information} = require('../../utils/imageRec');
const WatchPrice = require('./watchPrice');

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
    let sellOfferedValue = meltingPercentage * purity * valuesPerGram.silver * item.weight;
    item.set({
        pawnOfferedValue,
        sellOfferedValue,
        meltingPercentage
    });

    return item.save();
};

// Calculate pawn and sell offered values (Watches)
ItemSchema.methods.calculateWatchOfferedValues = async function() {
    try {
        // Formula not implemented as of now
        const item = this;

        var watchPawnOfferedValue = -1
        var watchSellOfferedValue = -1

        var retrieveWatchPrice = await WatchPrice.find({
            serialNumber: objSerialNumber
        });
        var existingWatchPrice = retrieveWatchPrice[0];

        if (!existingWatchPrice) {
            retrieveWatchPrice = await WatchPrice.find({
                brand: brand,
                model: model
            });
            var existingWatchPrice = retrieveWatchPrice[0];
            if (!existingWatchPrice) {
                throw new Error('Watch does not exist in database, please approach Staff for assistance');
            }
        } 

        watchPawnOfferedValue = existingWatchPrice.pawnValue
        watchSellOfferedValue = existingWatchPrice.buybackValue
        

        item.set({
            pawnOfferedValue: watchPawnOfferedValue,
            sellOfferedValue: watchSellOfferedValue
        });
        return item.save();
    } catch (error) {
        console.log(error.stack);
        return {
            brand: 'Generic',
            weight: 5,
            purity: '24k/999'
        };
    }
};

// Calculate pawn and sell offered values (Jewel)
ItemSchema.methods.calculateJewelOfferedValues = async function(user) {
    // Formula not implemented as of now
    const item = this;

    // Get user's current ltv percentage
    let ltvPercentage = user.currentLtvPercentage;
    if (user.registrationCompleted == false) {
        ltvPercentage = 0.9;
    }

    // Get gold prices
    const valuesPerGram = await getGoldSilverPrice();

    // Set prices
    item.set({
        pawnOfferedValue: ltvPercentage * 0.985 * valuesPerGram.gold * item.weight,
        sellOfferedValue: 0.97 * valuesPerGram.gold * item.weight
    });
    return item.save();
};

ItemSchema.methods.runImageRecognition = async function(itemID) {
    try {
        // Get predicted default probabilities and credit rating
        const response = await axios.post('http://206.189.145.2:5000/bar_ocr', querystring.stringify({
            itemID: itemID.toString()
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        let front_text = response.data.front_text;
        let back_text = response.data.back_text;

        // Get and return information
        return get_information(front_text, back_text);
    } catch (error) {
        console.log(error.stack);
        return {
            brand: 'Generic',
            weight: 5,
            purity: '24k/999',
            err: 'An error occured during image recognition'
        };
    }
};

// Create model and export
const Item = mongoose.model('Item', ItemSchema);
module.exports = {Item};
