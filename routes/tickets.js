// Library imports
const express = require('express');
const router = express.Router();

// Custom imports
const PawnTicket = require('../db/models/pawnTicket');
const SellTicket = require('../db/models/sellTicket');
const {authenticate} = require('../middleware/authenticate');

// Add middleware
router.use(authenticate);

// POST: get user's history
router.post('/', (req, res) => {

});


// POST: retrieve tickets
router.post('/tickets', (req, res) => {
    try {
        var today = moment().startOf('day')
        //retrieve current pawn tickets
        var results1 = mongoose.find({ userId: req.user.userId, approval: true, expiry: { $gt: today.toDate() }});
        console.log(results1)
        
        //retrieve pawn tickets pending approval
        var results2 = mongoose.find({ userId: req.user.userId, approval: false, expiry: { $gt: today.toDate() }});
        console.log(results2)
        
        //retrieve expired pawn tickets
        var results3 = mongoose.find({ userId: req.user.userId, approval: true, expiry: { $lte: today.toDate() }});
        console.log(results3)
        
        //retrieve sell tickets pending approval
        var results4 = mongoose.find({ userId: req.user.userId, approval: false});
        console.log(results4)
        
        //retrieve approved sell tickets
        var results5 = mongoose.find({ userId: req.user.userId, approval: true});
        console.log(results5)
        
    } catch (e) {
        res.status(400).send(e);
    }
  });


module.exports = router;