// Library imports
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const {ObjectID} = require('mongodb');

// Custom imports
const {PawnTicket} = require('../db/models/pawnTicket');
const {Payment} = require('../db/models/payment');
const {User} = require('../db/models/user');
var isClosed = false;

// POST: create cc token if existing
router.post('/retrieveCcToken', async (req, res) => {
    try {
        let body = _.pick (req.body, [
            'userID'
        ])

        const user = await User.findById(new ObjectID(body.userID));
        if (!user.ccToken) {
            throw new Error('No Existing Token found found');
        } else {
            res.send(user.ccToken);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }
})

// POST: create new payment item
router.post('/', async (req, res) => {
    try {
        let body = _.pick(req.body, [
            'ticketID',
            'paymentAmount',
            'date',
            'success',
            'userID',
            'ccToken'
        ]);

        // Update ccToken
        const user = await User.findById(new ObjectID(body.userID));
        user.set({
            ccToken: ccToken
        });

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
                
                if (payment.paymentAmount >= balanceInterest) {
                    balanceInterest = 0;
                    balancePrincipal -= (payment.paymentAmount - balanceInterest);
                    if (balancePrincipal === 0) {
                        isClosed = true;
                        //check if pawnTicket is expired or not
                        if (pawnTicket.expired) {

                            var user = await User.findById(pawnTicket.userID);
                            // if pawnTicket is expired, update user's credit rating with a 'Late'
                            user.updateCreditRating('L', pawnTicket._id);

                        } else {

                            var user = await User.findById(pawnTicket.userID);
                            //if pawnTicket is not expired, update user's credit rating with a 'Cleared'
                            user.updateCreditRating('C', pawnTicket._id);

                        }
                    }
                } else {
                    balanceInterest -= payment.paymentAmount;
                }

                pawnTicket.set({
                    outstandingInterest: balanceInterest,
                    outstandingPrincipal: balancePrincipal,
                    closed: isClosed
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