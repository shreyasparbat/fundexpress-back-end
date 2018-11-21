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
ItemSchema.methods.calculateSilverOfferedValues = async function(user, purity) {
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

ItemSchema.methods.runImageRecognition = async function(front, back) {
    // Get predicted default probabilities and credit rating
    const response = await axios.post('http://0.0.0.0:5000/bar_ocr', {
        front,
        back
    }, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    console.log(response.data);
    
    return {
        brand: 'Generic',
        weight: 5,
        purity: '24k/999'
    };
};

// Create model and export
const Item = mongoose.model('Item', ItemSchema);
module.exports = {Item};
