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
    placeOfPurchase: {
        type: String,
        required: true,
        minlength: 1
    },
    values: [{
        pawningOfferedValue: {
            type: Number
        },
        sellingOfferedValue: {
            type: Number
        }
    }]
});

// Override toJson (for returning item profile)
ItemSchema.methods.toJSON = function () {
    const item = this;
    const itemObject = item.toObject();
    return _.pick(itemObject, [
        'name',
        'type',
        'material',
        'dateOfPurchase',
        'placeOfPurchase',
        'values'
    ])
};

// Create model and export
const Item = mongoose.model('Item', ItemSchema);
module.exports = {Item};