// Library imports
const express = require('express');
const router = express.Router();
const _ = require('lodash');

// Custom imports
const {User} = require('../db/models/user');
const {PawnTicket} = require('../db/models/pawnTicket');
const {SellTicket} = require('../db/models/sellTicket');
const {authenticateAdmin} = require('../middleware/authenticateAdmin');

// Add middleware
router.use(authenticateAdmin);

// POST: Approve a pawn ticket
router.post('/approvePawnTicket', async (req, res) => {
    try {
        let body = _.pick(req.body, ['pawnTicketID']);

        // Find Pawn ticket
        const pawnTicket = await PawnTicket.findById(new ObjectID(body.pawnTicketID));
        if (!pawnTicket) {
            throw new Error('No pawn ticket found');
        }
        
        // Approve it
        pawnTicket.set({
            approved: true
        })
        await pawnTicket.save();

        // Send back success message
        res.send({
            msg: 'Pawn Ticket successfully approved'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error.toString());
    }
});

// POST: Reject a pawn ticket
router.post('/rejectPawnTicket', async (req, res) => {
    try {
        let body = _.pick(req.body, ['pawnTicketID']);

        // Find Pawn ticket
        const pawnTicket = await PawnTicket.findById(new ObjectID(body.pawnTicketID));
        if (!pawnTicket) {
            throw new Error('No pawn ticket found');
        }
        
        // Delete (reject) it
        pawnTicket.remove();

        // Send back success message
        res.send({
            msg: 'Pawn Ticket successfully deleted'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error.toString());
    }
});

// POST: Approve a sell ticket
router.post('/approveSellTicket', async (req,res) => {
    try {
        let body = _.pick(req.body, ['sellTicketID']);

        // Find Sell ticket
        const sellTicket = await SellTicket.findById(new ObjectID(body.sellTicketID));
        if (!sellTicket) {
            throw new Error('No sell ticket found');
        }
        
        // Approve it
        sellTicket.set({
            approved: true
        })
        await sellTicket.save();

        // Send back success message
        res.send({
            msg: 'Sell Ticket successfully approved'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error.toString());
    }
});

// POST: Reject a sell ticket
router.post('/rejectSellTicket', async (req, res) => {
    try {
        let body = _.pick(req.body, ['sellTicketID']);

        // Find Sell ticket
        const sellTicket = await SellTicket.findById(new ObjectID(body.sellTicketID));
        if (!sellTicket) {
            throw new Error('No sell ticket found');
        }
        
        // Delete (reject) it
        sellTicket.remove();

        // Send back success message
        res.send({
            msg: 'Sell Ticket successfully deleted'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error.toString());
    }
});

// POST: Get all information about a user
router.post('/getUser', async (req, res) => {
    try {
        let body = _.pick(req.body, ['userID']);

        // Get that user
        const user = await User.findById(new ObjectID(body.userID));

        // Send back user
        res.send(user);
    } catch (error) {
        console.log(error);
        res.status(500).send(error.toString());
    }
});

// POST: Update all information of the user
router.post('/updateUser', async (req, res) => {
    try {
        const userID = req.body.userID;
        const body = _.pick(req.body, [
            'email',
            'fullName',
            'gender',
            'dateOfBirth',
            'age',
            'ic',
            'mobileNumber',
            'landlineNumber',
            'address',
            'addressType',
            'citizenship',
            'race',
            'noOfC',
            'noOfL',
            'noOfD',
            'ethHash',
            'expoPushToken'
        ]);

        // Update the user
        const _id = new ObjectID(userID);
        User.findByIdAndUpdate(_id, {
            $set: body
        }, (error) => {
            if (error) throw error;

            // Send back updated user (the user provided to this callback is the old one)
            const updatedUser = await User.findById(_id);
            res.send(updatedUser);
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error.toString());
    }
});

module.exports = router;