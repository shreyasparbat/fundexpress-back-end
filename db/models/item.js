// Library imports
const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

// Define Item Schema
const ItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true,
        minlength: 1
    },
    type: {
        type: String,
        required: true,
        minlength: 6
    },
    material: {
        type: String,
        required: true,
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
        type: Number,
        required: false
    },
    brand: {
        type: String,
        required: false
    },
    dateOfPurchase: {
        type: Date,
        required: true
    },
    pawnOfferedValue: {
        type: Number,
        required: true
    },
    sellOfferedValue: {
        type: Number,
        required: true
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

        // Setup request parameters
        const requestBody = {
            name: item.name,
            type: item.type,
        }
    }


    // value of gold taken as 50 for now
    const goldValue = 50;
    const ltvPercentage = req.user.currentLtvPercentage;
    const meltingPrice = item.purity * goldValue;

    const pawnOfferedValue = ltvPercentage * meltingPrice * item.weight;
    //arbitrary value of sellOfferedValue until logic is set
    const sellOfferedValue = 100;

    return Promise.resolve();
};

// Create model and export
const Item = mongoose.model('Item', ItemSchema);
module.exports = {Item};
