// Library imports
const express = require('express');
const router = express.Router();
const _ = require('lodash');

// Custom imports
const {Admin} = require('../db/models/admin');
const {PawnTicket} = require('../db/models/pawnTicket');
const {SellTicket} = require('../db/models/sellTicket');
const {authenticateAdmin} = require('../middleware/authenticateAdmin');

// Add middleware
router.use(authenticateAdmin);

// POST: Admin login
router.post('/login', async (req, res) => {
    try {
        let body = _.pick(req.body, ['email', 'password']);

        // Find that admin
        const admin = await Admin.findByCredentials(body.email, body.password);

        // Generate and return token
        const token = await admin.generateAuthToken();
        res.header('x-auth', token).send({
            msg: 'success'
        })
    } catch (error) {
        res.status(400).send(error.toString());
    }
});

// POST: Approve a pawn ticket
router.post('/approvePawnTicket', async (req, res) => {
    try {
        let body = _.pick(req.body, ['pawnTicketID']);

        const pawnTicket = await PawnTicket.findById(new ObjectID(body.pawnTicketID));
        if (!pawnTicket) {
            throw new Error('No pawn ticket found');
        }
        
        pawnTicket.set({
            approved: true
        })

        await pawnTicket.save();

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

        const pawnTicket = await PawnTicket.findById(new ObjectID(body.pawnTicketID));
        if (!pawnTicket) {
            throw new Error('No pawn ticket found');
        }
        
        pawnTicket.remove();

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

        const sellTicket = await SellTicket.findById(new ObjectID(body.sellTicketID));
        if (!sellTicket) {
            throw new Error('No sell ticket found');
        }
        
        sellTicket.set({
            approved: true
        })

        await sellTicket.save();

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

        const sellTicket = await SellTicket.findById(new ObjectID(body.sellTicketID));
        if (!sellTicket) {
            throw new Error('No sell ticket found');
        }
        
        sellTicket.remove();

        res.send({
            msg: 'Sell Ticket successfully deleted'
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(error.toString());
    }
});

module.exports = router;