// Library imports
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const {ObjectID} = require('mongodb');
const gcm = require('node-gcm');
const serverKey = require('../keys').serverKey;
// const FCM = require('fcm-node'); ignore for now, don't delete
// const fcm = new FCM (serverKey); ignore for now, don't delete

// Custom imports
const {User} = require('../db/models/user');
const {PawnTicket} = require('../db/models/pawnTicket');
const {SellTicket} = require('../db/models/sellTicket');
const {Item} = require('../db/models/item');
const {authenticateAdmin} = require('../middleware/authenticateAdmin');
const {pawnTicketApprovedMessage} = require('../utils/notifications');
const {pawnTicketRejectedMessage} = require('../utils/notifications');
const {sellTicketApprovedMessage} = require('../utils/notifications');
const {sellTicketRejectedMessage} = require('../utils/notifications');


// Define notification sender
const sender = new gcm.Sender(serverKey);

// Add middleware
router.use(authenticateAdmin);

// POST: Approve a pawn ticket
router.post('/approvePawnTicket', async (req, res) => {
    try {
        let body = _.pick(req.body, [
            'pawnTicketID',
            'item',
            'dateCreated',
            'expiryDate',
            'gracePeriodEndDate',
            'indicativeTotalInterestPayable',
            'value',
            'approved',
            'closed',
            'expired',
            'outstandingPrincipal',
            'outstandingInterest'
        ]);

        // Find Item
        const item = await Item.findById(new ObjectID(body.item._id));
        if (!item) {
            throw new Error('No pawn ticket found');
        }

        // Update it
        item.set(body.item);
        await item.save();

        // Find Pawn ticket
        const pawnTicket = await PawnTicket.findById(new ObjectID(body.pawnTicketID));
        if (!pawnTicket) {
            throw new Error('No pawn ticket found');
        }
        
        // Approve and update it
        pawnTicket.set({
            item: body.item,
            dateCreated: body.dateCreated,
            expiryDate: body.expiryDate,
            gracePeriodEndDate: body.gracePeriodEndDate,
            indicativeTotalInterestPayable: body.indicativeTotalInterestPayable,
            value: body.value,
            approved: true,
            closed: body.closed,
            expired: body.expired,
            outstandingPrincipal: body.outstandingPrincipal, 
            outstandingInterest: body.outstandingInterest,
        });
        await pawnTicket.save();

        
        // ignore code for now, don't delete

        // const pawnTicketApprovedMessage = {
        //     to: user.expoPushToken, 
            
        //     notification: {
        //         title: 'Pawn Ticket Successfully Approved', 
        //         body: 'Hello! This is to inform you that your pawn ticket request has been approved!'
        //     }
        // };

        // fcm.send(pawnTicketApprovedMessage, function(err, response){
        //     if (err) {
        //         res.write({
        //             msg: 'Not sent via fcm'
        //         })
        //         console.log("Something has gone wrong!");
        //     } else {
        //         res.write({
        //             msg: 'Sent via fcm'
        //         })
        //         console.log("Successfully sent pawn ticket approval message", response);
        //     }
        // });

        // Send back success message
        res.write('Pawn Ticket successfully approved\n');

        var user = await User.findById(new ObjectID (pawnTicket.userID));

        var registrationToken = [user.expoPushToken];
        
        // calling gcm to send approval notification to user
        sender.send(pawnTicketApprovedMessage, {registrationTokens: registrationToken}, function (err, response){
            if (err) {
                console.log('Message not sent', err.toString());
                res.write('Message not sent via gcm');
            } else {
                res.write('Message sent via gcm');
                console.log('Successfully sent pawn ticket approval message', response);
            }
            res.end();
        });
    } catch (error) {
        console.log(error.stack);
        res.status(500).send({
            error: error.toString()
        });
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

        var user = User.findById(pawnTicket.userID);
        var registrationToken = [user.expoPushToken];
        
        // calling gcm to send rejection notification to user
        sender.send(pawnTicketRejectedMessage, {registrationTokens: registrationToken}, function (err, response){
            if (err) {
                console.log('Message not sent', err.toString());
            } else {
                console.log('Successfully sent pawn ticket rejection message', response);
            }
        });
        
        // Delete (reject) it
        pawnTicket.remove();

        // Send back success message
        res.send({
            msg: 'Pawn Ticket successfully deleted'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
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
        });
        await sellTicket.save();

        var user = User.findById(sellTicket.userID);
        var registrationToken = [user.expoPushToken];
        
        sender.send(sellTicketApprovedMessage, {registrationTokens: registrationToken}, function (err, response){
            if (err) {
                console.log('Message not sent', err.toString());
            } else {
                console.log('Successfully sent sell ticket approval message', response);
            }
        });
           
        // fcm.send(sellTicketApprovedMessage, function(err, response){
        //     if (err) {
        //         console.log("Something has gone wrong!");
        //     } else {
        //         console.log("Successfully sent sell ticket approval message", response);
        //     }
        // });

        // Send back success message
        res.send({
            msg: 'Sell Ticket successfully approved'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
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

        var user = User.findById(sellTicket.userID);
        var registrationToken = [user.expoPushToken];
        
        sender.send(sellTicketRejectedMessage, {registrationTokens: registrationToken}, function (err, response){
            if (err) {
                console.log('Message not sent', err.toString());
            } else {
                console.log('Successfully sent sell ticket rejection message', response);
            }
        });
        
        // fcm.send(sellTicketRejectedMessage, function(err, response){
        //     if (err) {
        //         console.log("Something has gone wrong!");
        //     } else {
        //         console.log("Successfully sent sell ticket rejection message", response);
        //     }
        // });
        
        // Delete (reject) it
        sellTicket.remove();

        // Send back success message
        res.send({
            msg: 'Sell Ticket successfully deleted'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
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
        res.status(500).send({
            error: error.toString()
        });
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
        await User.findByIdAndUpdate(_id, {
            $set: body
        });

        // Send back updated user (the user provided to this callback is the old one)
        const updatedUser = await User.findById(_id);
        res.send(updatedUser);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }
});

// GET all users
router.get('/allUsers', async (req, res) => {
    try {
        // Get email and fullName of all users
        let allUsers = await User.find({}).select('email fullName');

        // Send back result
        res.send({
            allUsers
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }    
});

// POST: get one user's tickets
router.post('/tickets', async (req, res) => {
    try {
        let body = _.pick(req.body, ['userID']);
        
        // Get current pawn tickets
        let currentPawnTickets = await PawnTicket.find({
            userID: body.userID,
            approved: true,
            closed: false
        }).lean();

        // Get pawn tickets pending approval
        let pawnTicketsPendingApproval = await PawnTicket.find({
            userID: body.userID,
            approved: false,
            closed: false
        }).lean();

        // Get expired pawn tickets
        let expiredPawnTickets = await PawnTicket.find({
            userID: body.userID,
            approved: true,
            gracePeriodEnded: true
        }).lean();

        // Get sell tickets pending approval
        let sellTicketPendingApproval = await SellTicket.find({
            userID: body.userID,
            approved: false
        }).lean();

        // Get approved sell tickets
        let approvedSellTickets = await SellTicket.find({
            userID: body.userID,
            approved: true
        }).lean();
        
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

// POST: get all tickets pending approval regardless of user
router.post('/getTicketsPendingApproval', async (req, res) => {
    try {
        // Get pawn tickets pending approval
        let pawnTicketsPendingApproval = await PawnTicket.find({
            approved: false,
            closed: false
        }).lean();

        // Get sell tickets pending approval
        let sellTicketsPendingApproval = await SellTicket.find({
            approved: false
        }).lean();

        res.send({
            pawnTicketsPendingApproval,
            sellTicketsPendingApproval
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }
});


// DELETE: log admin out
router.delete('/logout', (req, res) => {
    req.admin.removeToken(req.token).then(() => {
        res.send({
            msg: 'Log out successful'
        });
    }).catch((error) => {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    });
});

module.exports = router;