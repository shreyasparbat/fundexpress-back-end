// Library imports
const express = require('express');
const router = express.Router();

// Custom imports
const PawnTicket = require('../db/models/pawnTicket');
const SellTicket = require('../db/models/sellTicket');
const {authenticate} = require('../middleware/authenticate');

// Add middleware
router.use(authenticate);

// POST: get user's history
router.post('/', (req, res) => {

});


module.exports = router;