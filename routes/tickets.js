// Library imports
const express = require('express');
const router = express.Router();

// Custom imports
const {PawnTicket} = require('../db/models/pawnTicket');
const {SellTicket} = require('../db/models/sellTicket');
const {authenticate} = require('../middleware/authenticate');

// Add middleware
router.use(authenticate);

// POST: get user's history
router.post('/', async (req, res) => {
    try {
        // Get current pawn tickets
        let currentPawnTickets = await PawnTicket.find({
            userID: req.user._id,
            approved: true,
            closed: false
        }).lean();

        // Get pawn tickets pending approval
        let pawnTicketsPendingApproval = await PawnTicket.find({
            userID: req.user._id,
            approved: false,
            closed: false
        }).lean();

        // Get expired pawn tickets
        let expiredPawnTickets = await PawnTicket.find({
            userID: req.user._id,
            approved: true,
            gracePeriodEnded: true
        }).lean();

        // Get sell tickets pending approval
        let sellTicketPendingApproval = await SellTicket.find({
            userID: req.user._id,
            approved: false
        }).lean();

        // get approved sell tickets
        let approvedSellTickets = await SellTicket.find({
            userID: req.user._id,
            approved: true
        }).lean();

        // Send back result
        res.send({
            currentPawnTickets,
            pawnTicketsPendingApproval,
            expiredPawnTickets,
            sellTicketPendingApproval,
            approvedSellTickets
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }    
});


module.exports = router;