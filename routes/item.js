// Library imports
const express = require('express');
const router = express.Router();

// Custom imports
const Item = require('../db/models/item');
const PawnTicket = require('../db/models/pawnTicket');
const SellTicket = require('../db/models/sellTicket');
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
      'ticketNumber',
      'dateCreated',
      'expiryDate',
      'interestPayable',
      'offeredValue'
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
      'ticketNumber',
      'dateCreated',
      'offeredValue'
    })
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
