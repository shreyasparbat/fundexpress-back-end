// Library imports
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const {ObjectID} = require('mongodb');

// Custom imports
const {Item} = require('../db/models/item');
const {PawnTicket} = require('../db/models/pawnTicket');
const {SellTicket} = require('../db/models/sellTicket');
const {authenticate} = require('../middleware/authenticate');
const {uploadItem} = require('../utils/digitalOceanSpaces');
const {addMonths} = require('../utils/otherUtils');
const {newPawnTicketCreatedMessage} = require('../utils/notifications');
const {newSellTicketCreatedMessage} = require('../utils/notifications');
const {get_information} = require('../utils/imageRec');

// Add middleware
router.use(authenticate);

// POST: test image rec
router.post('/testImageRec', async (req, res) => {
    try {
        return get_information(req.body.front_text, req.body.back_text);
    } catch (error) {
        console.log(error.stack);
        res.status(500).send({
            error: error.stack
        });
    }
});

// POST: upload an item image
router.post('/uploadImage', async (req, res) => {
    try {
        // Save the item
        let type = req.get('type');
        let itemObject = {
            'userID': new Object(req.user._id),
            type
        };
        let item = new Item(itemObject);
        await item.save();

        // Upload images to digital ocean
        req.itemID = item._id;
        await uploadSync(req, res);

        // Run Image recognition if gold bar or coin
        let responseBody = {
            itemID: item._id
        };
        if (type === 'Gold Bar') {
            const itemInformation = await item.runImageRecognition(item._id);
            responseBody.brand = itemInformation.brand;
            responseBody.weight = itemInformation.weight;
            responseBody.purity = itemInformation.purity;
            responseBody.err = itemInformation.err;
        }

        // Send back relevant information
        res.send(responseBody);
    } catch (error) {
        console.log(error.stack);
        res.status(500).send({
            error: error.stack
        });
    }
});

const uploadSync = async (req, res) => {
    uploadItem(req, res, function (e) {
        if (e) {
            console.log(e);
            throw(e);
        } else {
            console.log('successfully uploaded');
        }
    });
};

// POST: add item
router.post('/add', async (req, res) => {
    try {
        // Get request body
        const body = _.pick(req.body, [
            'itemID',
            'name',
            'type',
            'material',
            'brand',
            'purity',
            'weight',
            'condition',
            'dateOfPurchase',
            'otherComments'
        ]);

        // Find item of that objectID
        const item = await Item.findById(new ObjectID(body.itemID));
        if (!item) {
            throw new Error('No item found');
        }

        // Update item information
        item.set({
            name: body.name,
            type: body.type,
            material: body.material,
            brand: body.brand,
            purity: body.purity,
            weight: parseFloat(body.weight),
            condition: body.condition,
            otherComments: body.otherComments,
            dateOfPurchase: new Date(body.dateOfPurchase)
        });
        await item.save();

        // Calculate pawn and sell offered values
        if (body.type === 'Gold Bar' || body.type === 'Gold Coin') {
            await item.calculateGoldOfferedValues(req.user, body.purity);
        }
        if (body.type === 'Silver Bar' || body.type === 'Silver Coin') {
            await item.calculateSilverOfferedValues(req.user, body.purity);
        }
        if (body.type === 'Jewel') {
            await item.calculateJewelOfferedValues(req.user, body.purity);
        }
        if (body.type === 'Watch') {
            await item.calculateWatchOfferedValues(req.user, body.purity);
        }

        // Return objectID and offered values
        res.send({
            itemID: item._id,
            pawnOfferedValue: item.pawnOfferedValue,
            sellOfferedValue: item.sellOfferedValue
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }
});

// POST: pawn new item (create pawn ticket)
router.post('/pawn', async (req, res) => {
    try {
        let body = _.pick(req.body, [
            'itemID',
            'specifiedValue'
        ]);

        // Find item of that objectID
        const item = await Item.findById(new ObjectID(body.itemID));
        if (!item) {
            throw new Error('No item found');
        }

        // Check whether specified value is greater than pawn value
        if (body.specifiedValue > item.pawnOfferedValue) {
            throw new Error('Specified value is greater than offered value');
        }

        // Check whether different user is trying to pawn the item
        if (item.userID.toString() !== req.user._id.toString()) {
            throw new Error('Item was added by a different user');
        }

        // Create Pawn ticket
        let pawnTicketObject = {
            'userID': req.user._id,
            'item': item.toObject(),
            'dateCreated': new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate()),
            'expiryDate': addMonths(new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate()), 6),
            'gracePeriodEndDate': addMonths(new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate()), 7),
            'indicativeTotalInterestPayable': body.specifiedValue * ((0.015 * 5) + 0.01),
            'value': body.specifiedValue,
            'approved': false,
            'closed': false,
            'outstandingPrincipal' : body.specifiedValue,
            'outstandingInterest' : 0
        };

        // Save pawn ticket if registrationCompleted
        if (req.user.registrationCompleted) {
            let pawnTicket = new PawnTicket(pawnTicketObject);
            await pawnTicket.save();
        }

        // calling expo to send message
        newPawnTicketCreatedMessage();

        res.send(pawnTicketObject);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }
});

// POST: sell new item (create sell ticket)
router.post('/sell', async (req, res) => {
    try {
        let body = _.pick(req.body, [
            'itemID'
        ]);

        // Find item of that objectID
        const item = await Item.findById(new ObjectID(body.itemID));
        if (!item) {
            throw new Error('No item found');
        }

        // Check whether different user is trying to pawn the item
        if (item.userID.toString() !== req.user._id.toString()) {
            throw new Error('Item was added by a different user');
        }

        // Create sell ticket
        let sellTicketObject = {
            'userID': req.user._id,
            'item': item.toObject(),
            'dateCreated': new Date(),
            'value': item.sellOfferedValue,
            'approved': false
        };
        // Save sell ticket if registrationCompleted
        if (req.user.registrationCompleted) {
            let sellTicket = new SellTicket(sellTicketObject);
            await sellTicket.save();
        }

        //calling expo to send message
        newSellTicketCreatedMessage();

        res.send(sellTicketObject);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }
});

module.exports = router;
