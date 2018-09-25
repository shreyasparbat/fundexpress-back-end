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

// Add middleware
router.use(authenticate);

// POST: upload an item image
router.post('/uploadImage', async (req, res) => {
    try {
        // Upload images to digital ocean
        uploadItem(req, res, function (e) {
            if (e) {
                console.log(e)
                throw(e);
            } else {
                console.log('successfully uploaded');
            }
        });

        // Save the item
        let type = req.get('type');
        let itemObject = {
            'userID': new Object(req.user._id),
            type
        }
        let item = new Item(itemObject);
        await item.save();

        // Run Image recognition if gold bar or coin
        let responseBody = {
            itemID: item._id
        };
        if (type === 'Gold Bar' || type === 'Gold Coin') {
            let savedItem = await item.runImageRecognition(type);
            responseBody.brand = savedItem.brand;
            responseBody.material = savedItem.material;
            responseBody.weight = savedItem.weight;
            responseBody.purity = savedItem.purity;
        }

        // Send back relevant information
        res.send(responseBody);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }
});

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

        // Get percentage of gold per gram for given purity
        let meltingPercentage = undefined;
        let sellPercentage = undefined;
        if (body.type === 'Gold Bar' || body.type === 'Gold Coin') {
            // Calculate goldContentPerc
            if (body.purity === '24k/999') {
                meltingPercentage = 0.985;
                sellPercentage = 0.97;
            }
            if (body.purity === '22K/916') {
                meltingPercentage = 0.9;
                sellPercentage = 0.88;
            }
            if (body.purity === '20K/835') {
                meltingPercentage = 0.835;
                sellPercentage = 0.81;
            }
            if (body.purity === '18K/750 (Yellow gold)') {
                meltingPercentage = 0.7;
                sellPercentage = 0.7;
            }
            if (body.purity === '18K/750 (White gold)') {
                meltingPercentage = 0.65;
                sellPercentage = 0.7;
            }
            if (body.purity === '14K/585') {
                meltingPercentage = 0.5;
                sellPercentage = 0.5;
            }
            if (body.purity === '9K/375') {
                meltingPercentage = 0.3;
                sellPercentage = 0.27;
            }

            // Calculate pawn and sell offered value (Gold products only)
            await item.calculateGoldOfferedValues(req.user);
        } else {
            // Calculate pawn and sell offered value (other products)
            await item.calculateOtherOfferedValues(req.user);
        }

        // Update item
        item.set({
            name: body.name,
            type: body.type,
            material: body.material,
            brand: body.brand,
            purity: body.purity,
            meltingPercentage,
            sellPercentage,
            weight: body.weight,
            condition: body.condition,
            otherComments: body.otherComments,
            dateOfPurchase: new Date(body.dateOfPurchase)
        })
        await item.save();

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
})

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
        if (body.specifiedValue >= item.pawnOfferedValue) {
            throw new Error('Specified value is greater than offered value');
        }

        // Check whether different user is trying to pawn the item
        if (item.userID.toString() !== req.user._id.toString()) {
            throw new Error('Item was added by a different user');
        } 

        // Create Pawn ticket
        let pawnTicketObject = {
            'userID': req.user._id,
            'itemID': item._id,
            'dateCreated': new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate()),
            'expiryDate': addMonths(new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate()), 6),
            'gracePeriodEndDate': addMonths(new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate()), 7),
            'interestPayable': body.specifiedValue * 0.5,
            'value': body.specifiedValue,
            'approved': false,
            'closed': false
        }
        let pawnTicket = new PawnTicket(pawnTicketObject);

        // Save pawn ticket
        await pawnTicket.save();

        res.send(pawnTicket);
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
            'itemID': item._id,
            'dateCreated': new Date(),
            'value': item.sellOfferedValue,
            'approved': false
        }
        let sellTicket = new SellTicket(sellTicketObject);

        // Save sell ticket
        await sellTicket.save();

        res.send(sellTicket);
    } catch (e) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }
});

module.exports = router;