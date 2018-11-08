// Library imports
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const {ObjectID} = require('mongodb');

// Custom imports
const {PawnTicket} = require('../db/models/pawnTicket');
const {Payment} = require('../db/models/payment');

// POST: create new payment item
router.post('/', async (req, res) => {
    try {
        let body = _.pick(req.body, [
            'ticketID',
            'paymentAmount',
            'date',
            'success'
        ]);

        // Create payment object
        let paymentObject = {
            'ticketID': body.ticketID,
            'paymentAmount': body.paymentAmount,
            'date': body.date,
            'success': body.success
        };
        let payment = new Payment(paymentObject);

        //update payment into db
        if (payment.success == true) {
            
            const pawnTicket = await PawnTicket.findById(new ObjectID(body.ticketID));
            if (!pawnTicket) {
                throw new Error('No Pawn Ticket found');
            } else {
                // Update pawnTicket information
                var balanceInterest = pawnTicket.outstandingInterest;
                var balancePrincipal = pawnTicket.outstandingPrincipal;
                if (payment.paymentAmount >= pawnTicket.outstandingInterest) {
                    balanceInterest = 0;
                    balancePrincipal -= (payment.paymentAmount - pawnTicket.outstandingInterest);
                    if (balancePrincipal === 0) {
                        pawnTicket.closed = true;
                    }
                } else {
                    balanceInterest -= payment.paymentAmount;
                }

                pawnTicket.set({
                    outstandingInterest: balanceInterest,
                    outstandingPrincipal: balancePrincipal
                });
                await pawnTicket.save();
            }
        }

        // Save payment object
        await payment.save();
        res.send(paymentObject);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }
});

module.exports = router;