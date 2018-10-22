// Library imports
const cron = require('node-cron');
const FCM = require('fcm-node');
const gcm = require('node-gcm');
const serverKey = require('../keys').serverKey;
const fcm = new FCM(serverKey);


// Custom imports
const {PawnTicket} = require('../db/models/pawnTicket');
const {User} = require('../db/models/user');

cron.schedule('0 0 0 * * *', () => {
    // run every day at midnight.

    const expiringTokens = new Array();
    const expiredTokens = new Array();
    const expiringGracePeriodTokens = new Array();
    const closedTokens = new Array();
    
    // retrieve all Pawn Tickets
    PawnTicket.find().then((pawnTickets) => {
        pawnTickets.forEach(async (ticket) => {
            //check if pawn ticket is expiring in a week
            if(ticket.findExpiringTicket()) {

                var user = await User.findById(ticket.userID);
                expiringTokens.push(user.expoPushToken);

            //check if pawn ticket has expired
            } else if (ticket.findExpiredTicket()) {

                var user = await User.findById(ticket.userID);
                expiredTokens.push(user.expoPushToken);
            
            //check if pawn ticket grace period is expiring in a week
            } else if (ticket.findExpiringGracePeriod()) {

                var user = await User.findById(ticket.userID);
                expiringGracePeriodTokens.push(user.expoPushToken);

            //check if grace period has ended
            } else if (ticket.findClosedTicket()) {

                var user = await User.findById(ticket.userID);
                closedTokens.push(user.expoPushToken);

            }
        });
    });
    //expiry reminder notification template
    const expiryReminderMessage = {
        to: expiringTokens, 
        
        notification: {
            title: 'Pawned Item Payemnt Expiry Date Reminder', 
            body: 'Hello! This is a reminder that you have only 1 week left to complete the repayment for your pawned item.'
        }
    };
    //grace period started notification template
    const gracePeriodStartedMessage = {
        to: expiredTokens,
    
        notification: {
            title: 'Pawned Item Payment Grace Period Started',
            body: 'Hello! Your payment deadline for your pawned item has been passed. Your one month grace period for payment has started now.'
        }
    };
    //grace period expiry reminder notification template
    const gracePeriodReminderMessage = {
        to: expiringGracePeriodTokens,
    
        notification: {
            title: 'Pawned Item Payment Grace Period Expiry Reminder',
            body: 'Hello! Your one month grace period for payment will end in 1 week. Please complete your payment within that timeline.'
        }
    };
    //ticket closed notification template
    const closedMessage = {
        to: closedTokens,
    
        notification: {
            title: 'Pawned Item Payment Grace Period Ended',
            body: 'Hello! Your grace period for payment has passed. Your payment has been defaulted.'
        }
    };
    
    // send message functions below
    fcm.send(expiryReminderMessage, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent expiry reminder", response);
        }
    });

    fcm.send(gracePeriodStartedMessage, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent expiry reminder", response);
        }
    });

    fcm.send(gracePeriodReminderMessage, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent expiry reminder", response);
        }
    });

    fcm.send(closedMessage, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent expiry reminder", response);
        }
    });
    
}, {
    scheduled: true,
    timezone: 'Asia/Singapore'
});

// setting message templates for gcm notifications
const pawnTicketApprovedMessage = new gcm.Message ({

    notification: {
        title: 'Pawn Ticket Approved!',
        body: 'Hello! Your pawn ticket request has been sucessfully approved!'
    }
});

const pawnTicketRejectedMessage = new gcm.Message ({

    notification: {
        title: 'Pawn Ticket Rejected!',
        body: 'Hello! Your pawn ticket request has been rejected.'
    }
});

const sellTicketApprovedMessage = new gcm.Message ({

    notification: {
        title: 'Sell Ticket Approved!',
        body: 'Hello! Your sell ticket request has been sucessfully approved!'
    }
});

const sellTicketRejectedMessage = new gcm.Message ({
    notification: {
        title: 'Sell Ticket Rejected!',
        body: 'Hello! Your sell ticket request has been rejected.'
    }
});

// scheduling task to add interest payments for existing pawn tickets
cron.schedule('0 1 0 * * *', async function () {
    // runs every day at 00:01

    // finds all the current pawn tickets
    let pawnTickets = await PawnTicket.find({
        approved: true,
        closed: false
    }).lean();
    
    pawnTickets.forEach(ticket => {
        if (new Date().getDate() - ticket.dateCreated.getDate() === 1 && ticket.dateCreated.getMonth() === new Date()          .getMonth()) {
            // adds interest for the first month
            ticket.indicativeTotalInterestPayable += ticket.value * 1 * 1 / 100;

        } else if (ticket.dateCreated.getDate() === lastday(new Date().getFullYear(), new Date().getMonth()-1) &&               new Date().getMonth() - ticket.dateCreated.getMonth() === 1 && new Date().getDate() === 1) {
            // adds interest for the first month
            ticket.indicativeTotalInterestPayable += ticket.value * 1 * 1 / 100;

        } else if (ticket.dateCreated.getDate() === new Date().getDate()) {
                // adds interest for every subsequent month
                const numMonths = new Date().getMonth() - ticket.dateCreated.getMonth();

                ticket.indicativeTotalInterestPayable = 0;
                ticket.indicativeTotalInterestPayable += ticket.value * 1.5 * numMonths / 100;

        }
    })
});


module.exports = {
    pawnTicketApprovedMessage,
    pawnTicketRejectedMessage,
    sellTicketApprovedMessage,
    sellTicketRejectedMessage
}