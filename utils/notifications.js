// Library imports
const cron = require('node-cron');
const axios = require('axios');
const {ObjectID} = require('mongodb');

// Custom imports
const {PawnTicket} = require('../db/models/pawnTicket');
const {User} = require('../db/models/user');
const {Admin} = require('../db/models/admin');
const url = 'https://exp.host/--/api/v2/push/send';

cron.schedule('0 0 0 * * *', async function () {
    // run every day at midnight.

    const expiringTokens = new Array();
    const expiredTokens = new Array();
    const expiringGracePeriodTokens = new Array();
    const closedTokens = new Array();
    
    // finds all the current pawn tickets
    let pawnTickets = await PawnTicket.find({
        approved: true,
        closed: false
    }).lean();

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
            user.updateCreditRating('D', ticket._id);

        }
    });
    //expiry reminder notification template
    const expiryReminderMessage = async (expoPushToken) => {
    
        const messageInfo = {
            to: expoPushToken,
            title: 'Pawned Item Payemnt Expiry Date Reminder', 
            body: 'Hello! This is a reminder that you have only 1 week left to complete the repayment for your pawned item. You will be charged additional interest if you miss this deadline.'
        }
    
        axios({
            method: 'post',
            url: url,
            data: messageInfo
        }).then(res =>
            console.log(res.data)
        ).catch(err =>
            console.log(err)
        )
    
    };

    //send expiry reminder message to users
    for (i = 0 ; i < expiringTokens.length ; i++) {
        expiryReminderMessage(expiringTokens[i]);
    }

    //grace period started notification template
    const gracePeriodStartedMessage = async (expoPushToken) => {
    
        const messageInfo = {
            to: expoPushToken,
            title: 'Pawned Item Payment Grace Period Started',
            body: 'Hello! Your payment deadline for your pawned item has been passed. Your one month grace period has started now. You will be charged additional interest for this month.'
        }
    
        axios({
            method: 'post',
            url: url,
            data: messageInfo
        }).then(res =>
            console.log(res.data)
        ).catch(err =>
            console.log(err)
        )
    
    };

    //send grace period started message to users
    for (i = 0 ; i < expiredTokens.length ; i++) {
        gracePeriodStartedMessage(expiredTokens[i]);
    }

    //grace period expiry reminder notification template
    const gracePeriodReminderMessage = async (expoPushToken) => {
    
        const messageInfo = {
            to: expoPushToken,
            title: 'Pawned Item Payment Grace Period Expiry Reminder',
            body: 'Hello! Your one month grace period for payment will end in 1 week. Please complete your payment within that timeline.'
        }
    
        axios({
            method: 'post',
            url: url,
            data: messageInfo
        }).then(res =>
            console.log(res.data)
        ).catch(err =>
            console.log(err)
        )
    
    };

    //send grace period expiring message to users
    for (i = 0 ; i < expiringGracePeriodTokens.length ; i++) {
        gracePeriodReminderMessage(expiringGracePeriodTokens[i]);
    }

    //ticket closed notification template
    const closedMessage = async (expoPushToken) => {
    
        const messageInfo = {
            to: expoPushToken,
            title: 'Pawned Item Payment Grace Period Ended',
            body: 'Hello! Your grace period for payment has passed. Your payment has been defaulted.'
        }
    
        axios({
            method: 'post',
            url: url,
            data: messageInfo
        }).then(res =>
            console.log(res.data)
        ).catch(err =>
            console.log(err)
        )
    
    };

    //send ticket closed message to users
    for (i = 0 ; i < closedTokens.length ; i++) {
        closedMessage(closedTokens[i]);
    }
    
}, {
    scheduled: true,
    timezone: 'Asia/Singapore'
});

// setting message templates for notifications
const pawnTicketApprovedMessage = async (pawnTicket) => {
    
    var user = await User.findById(new ObjectID(pawnTicket.userID));
    var expoPushToken = user.expoPushToken;

    const messageInfo = {
        to: expoPushToken,
        title: 'Pawn Ticket Approved!',
        body: 'Hello! Your pawn ticket request has been sucessfully approved!'
    }

    axios({
        method: 'post',
        url: url,
        data: messageInfo
    }).then(res =>
        console.log(res.data)
    ).catch(err =>
        console.log(err)
    )

};

const pawnTicketRejectedMessage = async (pawnTicket) => {
    
    var user = await User.findById(new ObjectID(pawnTicket.userID));
    var expoPushToken = user.expoPushToken;

    const messageInfo = {
        to: expoPushToken,
        title: 'Pawn Ticket Rejected!',
        body: 'Hello! Your pawn ticket request has been rejected.'
    }

    axios({
        method: 'post',
        url: url,
        data: messageInfo
    }).then(res =>
        console.log(res.data)
    ).catch(err =>
        console.log(err)
    )

};

const sellTicketApprovedMessage = async (sellTicket) => {
    
    var user = await User.findById(new ObjectID(sellTicket.userID));
    console.log(user.expoPushToken);
    var expoPushToken = user.expoPushToken;

    const messageInfo = {
        to: expoPushToken,
        title: 'Sell Ticket Approved!',
        body: 'Hello! Your sell ticket request has been sucessfully approved!'
    }

    axios({
        method: 'post',
        url: url,
        data: messageInfo
    }).then(res =>
        console.log(res.data)
    ).catch(err =>
        console.log(err)
    )

};

const sellTicketRejectedMessage = async (sellTicket) => {
    
    var user = await User.findById(new ObjectID(sellTicket.userID));
    var expoPushToken = user.expoPushToken;

    const messageInfo = {
        to: expoPushToken,
        title: 'Sell Ticket Rejected!',
        body: 'Hello! Your sell ticket request has been rejected.'
    }

    axios({
        method: 'post',
        url: url,
        data: messageInfo
    }).then(res =>
        console.log(res.data)
    ).catch(err =>
        console.log(err)
    )

};

const newPawnTicketCreatedMessage = async () => {
    
    let admin = await Admin.find().limit(1).sort({$natural:-1});
    var expoPushToken = admin.expoPushToken;

    const messageInfo = {
        to: expoPushToken,
        title: 'Pawn Ticket Approval',
        body: 'Hello! A new Pawn Ticket has been created and requires your acceptance/rejection. Please check the app.'
    }

    axios({
        method: 'post',
        url: url,
        data: messageInfo
    }).then(res =>
        console.log(res.data)
    ).catch(err =>
        console.log(err)
    )

};

const newSellTicketCreatedMessage = async () => {

    let admin = await Admin.find().limit(1).sort({$natural:-1});
    var expoPushToken = admin.expoPushToken;
    
    const messageInfo = {
        to: expoPushToken,
        title: 'Sell Ticket Approval',
        body: 'Hello! A new Sell Ticket has been created and requires your acceptance/rejection. Please check the app.'
    }

    axios({
        method: 'post',
        url: url,
        data: messageInfo
    }).then(res =>
        console.log(res.data)
    ).catch(err =>
        console.log(err)
    )

};


module.exports = {
    pawnTicketApprovedMessage,
    pawnTicketRejectedMessage,
    sellTicketApprovedMessage,
    sellTicketRejectedMessage,
    newPawnTicketCreatedMessage,
    newSellTicketCreatedMessage
};