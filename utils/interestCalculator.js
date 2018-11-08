// library imports
const cron = require('node-cron');

// custom imports
const {PawnTicket} = require('../db/models/pawnTicket');

// scheduling task to add interest payments for existing pawn tickets
cron.schedule('0 1 0 * * *', async function () {
    // runs every day at 00:01

    // finds all the current pawn tickets
    let pawnTickets = await PawnTicket.find({
        approved: true,
        closed: false
    }).lean();
    
    pawnTickets.forEach(async (ticket) => {

        var interestPayable = ticket.outstandingInterest;

        if (new Date().getDate() - ticket.dateCreated.getDate() === 1 && ticket.dateCreated.getMonth() === new Date()          .getMonth()) {
            // adds interest for the first month
            interestPayable += ticket.value * config.firstMonthRate * 1 / 100;

        } else if (ticket.dateCreated.getDate() === lastday(new Date().getFullYear(), new Date().getMonth()-1) &&               new Date().getMonth() - ticket.dateCreated.getMonth() === 1 && new Date().getDate() === 1) {
            // adds interest for the first month
            interestPayable += ticket.value * config.firstMonthRate * 1 / 100;

        } else if (ticket.dateCreated.getDate() === new Date().getDate()) {
                // adds interest for every subsequent month
                const numMonths = new Date().getMonth() - ticket.dateCreated.getMonth();

                interestPayable = 0;
                interestPayable += ticket.value * config.normalRate * numMonths / 100;

        }
        ticket.set({
            outstandingInterest: interestPayable
        });
        await ticket.save();
    })
}, {
    scheduled: true,
    timezone: 'Asia/Singapore'
});