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


// POST: sell new item (create sell ticket)


module.exports = router;