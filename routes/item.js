// Library imports
const express = require('express');
const router = express.Router();
const {ObjectID} = require('mongodb');
const multer = require('multer');
const storage = multer.diskStorage({ destination: function (req, file, cb) {
        cb(null, 'images/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.fieldname + '.jpg')
    }
});
const upload = multer({storage: storage}).fields([
    { name: 'front', maxCount: 1},
    {name: 'back', maxCount: 1}
]);


// Custom imports
const {Item} = require('../db/models/item');
const {PawnTicket} = require('../db/models/pawnTicket');
const {SellTicket} = require('../db/models/sellTicket');
const {authenticate} = require('../middleware/authenticate');

// Add middleware
router.use(authenticate);

// POST: add item


// POST: pawn new item (create pawn ticket)
router.post('/pawn', async (req, res) => {
  try {
    let body = _.pick(req.body, [
        'itemId',
        'specifiedValue' //relation between this and offeredValue?
    ]);
    let pawnTicketObject = {
        'userId': new ObjectID (req.user._id),
        'itemId': body.itemId, // confirm this
        'ticketNumber': 'NA',
        'dateCreated': new Date (1111-01-01),
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
      res.status(500).send(e);
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
        'dateCreated': new Date (1111-01-01),
        'offeredValue': -1,
        'approvalStatus': false
    }

    let sellTicket = new SellTicket (sellTicketObject);

    // save sell ticket
    let savedSellTicket = await sellTicket.save();

    res.send(savedSellTicket);
  } catch (e) {
    res.status(500).send(e);
  }
});

// POST: upload an item image
//const itemImages = upload.fields([{ name: 'front', maxCount: 1},{name: 'back', maxCount: 1}]);

router.post('/uploadImage', async (req, res) => {
    upload(req, res, function (e) {
        if (e) {
          console.log(e)
          return
      } else {
          console.log('successfully uploaded');
      }
    });
    try {
    // create a new item
    // upload item image to digitalOcean
    // if gold bar, get details from image

        // Create new Item
        let itemObject = {
            'userId': new ObjectID (req.user._id),
            'name': 'NA',
            //'type': req.body.type,
            'type': 'gold bar',
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
        let savedItem = await item.save();

        // Upload Item image to digital Ocean
        // Send back item
        res.send(savedItem);
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});

module.exports = router;
