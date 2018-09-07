// Library imports
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const {ObjectID} = require('mongodb');

// Custom imports
const {Item} = require('../db/models/item');
const {PawnTicket} = require('../db/models/pawnTicket');
const {SellTicket} = require('../db/models/sellTicket');
const {authenticate} = require('../middleware/authenticate');

// Add middleware
router.use(authenticate);

// POST: add item


// POST: pawn new item (create pawn ticket)
router.post('/item/pawn', (req, res) => {
  try {
    let body = _.pick(req.body, [
        'itemID',
        'specifiedValue'
    ]);
    res.send({
      // 'ticketNumber',
      // 'dateCreated',
      // 'expiryDate',
      // 'interestPayable',
      // 'offeredValue'
    })
  } catch (e) {
      res.status(500).send(e);
  }
});


// POST: sell new item (create sell ticket)
router.post('/item/sell', (req, res) => {
  try {
    let body = _.pick(req.body, [
        'itemID'
    ]);
    res.send({
      // 'ticketNumber',
      // 'dateCreated',
      // 'offeredValue'
    })
  } catch (e) {
    res.status(500).send(e);
  }
});

// POST: upload an item image
const itemImages = upload.fields([{ name: 'front', maxCount: 1}, {name: 'back', maxCount: 1}]);
router.post('/uploadImage', itemImages, async (req, res) => {
    try {
    // create a new item
    // upload item to digitalOcean
    // if gold bar, get details from image
    // send back item
    console.log(req.files);

        let itemObject = {
            'userId': new ObjectID (req.user._id),
            'name': 'NA',
            'type': req.body.type,
            'material': 'NA',
            'brand': 'NA',
            'purity': -1,
            'weight': -1,
            'condition': 'NA',
            'dateOfPurchase': new Date(1111,01,01),
            'pawnOfferedValue': -1,
            'sellOfferedValue': -1,
        }

        let item = new Item(itemObject);

        // Save itemObject
        let savedItem = await item.save();

        res.send(savedItem);
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});

module.exports = router;
