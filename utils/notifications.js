// Library imports
const cron = require('node-cron');
const fcm = require('fcm-node');
const serverKey = 'AAAAZL70Bas:APA91bHRU55TnhMawT0ZO9BwSyELQQbuGsQ_RugsG7VqO0Nax9OlomfC0NILPy3JXcV9l2waxXFZP1OrmZD-pDgur8B4DFDZXgZmrW723Pge0gn8ZWARFGPJLJdoLN3Vsf1vkYq6W2S4';
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
    
    PawnTicket.find().then((pawnTickets) => {
        pawnTickets.forEach(ticket => {
            if(ticket.findExpiringTicket()) {

                var user = User.findById(ticket.userID);
                expiringTokens.push(user.expoPushToken);

            } else if (ticket.findExpiredTicket()) {

                var user = User.findById(ticket.userID);
                expiredTokens.push(user.expoPushToken);

            } else if (ticket.findExpiringGracePeriod()) {

                var user = User.findById(ticket.userID);
                expiringGracePeriodTokens.push(user.expoPushToken);

            } else if (ticket.findClosedTicket()) {

                var user = User.findById(ticket.userID);
                closedTokens.push(user.expoPushToken);

            }
        });
    });

    const expiryReminderMessage = {
        to: expiringTokens, 
        
        notification: {
            title: 'Pawned Item Payemnt Expiry Date Reminder', 
            body: 'Hello! This is a reminder that you have only 1 week left to complete the repayment for your pawned item.'
        }
    };
    
    const gracePeriodStartedMessage = {
        to: expiredTokens,
    
        notification: {
            title: 'Pawned Item Payment Grace Period Started',
            body: 'Hello! Your payment deadline for your pawned item has been passed. Your one month grace period for payment has started now.'
        }
    };
    
    const gracePeriodReminderMessage = {
        to: expiringGracePeriodTokens,
    
        notification: {
            title: 'Pawned Item Payment Grace Period Expiry Reminder',
            body: 'Hello! Your one month grace period for payment will end in 1 week. Please complete your payment within that timeline.'
        }
    };
    
    const closedMessage = {
        to: closedTokens,
    
        notification: {
            title: 'Pawned Item Payment Grace Period Ended',
            body: 'Hello! Your grace period for payment has passed. Your payment has been defaulted.'
        }
    };
    
    fcm.send(expiryReminderMessage, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent expiry reminder", response);
        }
    });

    fcm.send(gracePeriodStartMessage, function(err, response){
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