// Library imports
const cron = require('node-cron');

// Custom imports
const {PawnTicket} = require('../db/models/pawnTicket');
const {User} = require('../db/models/user');

cron.schedule('0 1 0 * * *', async function () {
    // runs every day at 00:01

    // finds all the current pawn tickets
    let pawnTickets = await PawnTicket.find({
        approved: true,
        closed: false
    }).lean();

    pawnTickets.forEach(async (ticket) => {
        
        if (ticket.findClosedTicket()) {
            var user = await User.findById(ticket.userID);
            user.updateCreditRating('D', ticket._id);
        }

    })


}, {
    scheduled: true,
    timezone: 'Asia/Singapore'
});