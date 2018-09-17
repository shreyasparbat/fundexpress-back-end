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

// Add middleware
router.use(authenticate);

// POST: upload an item image
router.post('/uploadImage', async (req, res) => {
    // Upload images to digital ocean
    uploadItem(req, res, function (e) {
        if (e) {
            console.log(e)
            return
        } else {
            console.log('successfully uploaded');
        }
    });
    try {
        // Save the item
        let type = req.get('type');
        let itemObject = {
            'userId': new Object (req.user._id),
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
    } catch (e) {
        console.log(e);
        res.status(500).send(e.toString());
    }
});

// POST: add item
router.post('/add', async (req, res) => {
    try {
        // Get request body
        const body = _.pick(req.body, [
            'itemId',
            'name',
            'type',
            'material',
            'brand',
            'purity',
            'weight',
            'condition',
            'dateOfPurchase'
        ]);

        // Find item of that objectID
        const item = Item.findById(body.itemID);
        if (!item) throw new Error('No item found');        

        // Get percentage of gold per gram for given purity
        let goldContentPercentage = null;
        if (body.type === 'Gold Bar' || body.type === 'Gold Coin') {
            if (body.purity === '24k/999') {
                goldContentPercentage = 0.985;
            }
            if (body.purity === '22K/916') {
                goldContentPercentage = 0.9;
            }
            if (body.purity === '20K/835') {
                goldContentPercentage = 0.835;
            }
            if (body.purity === '18K/750 (Yellow gold)') {
                goldContentPercentage = 0.7;
            }
            if (body.purity === '18K/750 (White gold)') {
                goldContentPercentage = 0.65;
            }
            if (body.purity === '14K/585') {
                goldContentPercentage = 0.5;
            }
            if (body.purity === '9K/375') {
                goldContentPercentage = 0.3;
            }
        };

        // Update item
        item.set({
            name: body.name,
            type: body.type,
            material: body.material,
            brand: body.brand,
            purity: body.purity,
            goldContentPercentage,
            weight: body.weight,
            condition: body.condition,
            dateOfPurchase: new Date(body.dateOfPurchase)
        })
        await item.update();

        // Calculate pawn and sell offered value
        await item.calculateOfferedValues(req.user);

        // Return objectID and offered values
        res.send({
            itemID: item._id,
            pawnOfferedValue: item.pawnOfferedValue,
            sellOfferedValue: item.sellOfferedValue
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error.toString());
    }
})

// POST: pawn new item (create pawn ticket)
router.post('/pawn', async (req, res) => {
    try {
        let body = _.pick(req.body, [
            'itemId',
            'specifiedValue'
        ]);

        // Get Item

        // Create Pawn ticket
        let today = new Date ();
        let pawnTicketObject = {
            'userId': new Object (req.user._id),
            'itemId': new ObjectId (req.body.itemId),
            'ticketNumber': 'NA',
            'dateCreated': today,
            'expiryDate': 'NA',
            'interestPayable': -1,
            'offeredValue': -1,
            'approvalStatus': false
        }

        let pawnTicket = new PawnTicket (pawnTicketObject);

        //save pawn ticket
        let savedPawnTicket = await pawnTicket.save();

        res.send(savedPawnTicket);
    } catch (e) {
        console.log(e);
        res.status(500).send(e.toString());
    }
});

// POST: sell new item (create sell ticket)
router.post('/sell', async (req, res) => {
    try {
        let body = _.pick(req.body, [
            'itemId'
        ]);
        let sellTicketObject = {
            'userId': new Object (req.user._id),
            'itemId': body.itemId,
            'ticketNumber': 'NA',
            'dateCreated': new Date ('1111-01-01'),
            'offeredValue': -1,
            'approvalStatus': false
        }

        let sellTicket = new SellTicket (sellTicketObject);

        // save sell ticket
        let savedSellTicket = await sellTicket.save();

        res.send(savedSellTicket);
    } catch (e) {
        res.status(500).send(e.toString());
    }
});

module.exports = router;
