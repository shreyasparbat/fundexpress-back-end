// Library imports
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const {ObjectID} = require('mongodb');

// Custom imports
const {InterestRate} = require('../db/models/interestRate');
    
// Page for uploading new CSV for retraining
router.get('/retrainCreditRatingModel', function(req, res) {
    res.render('retrainCreditRatingModel', { title: 'Upload New CSV' });
    console.log(req);
});

// Page for uploading new CSV for watch brands
router.get('/updateWatchPrices', function(req, res) {
    res.render('updateWatchPrices', { title: 'Upload New CSV' });
});

// Page for displaying and requesting new interest rates
router.get('/updateInterestRates', async function(req, res) {
    try {
    
        const currentInterestRate = await InterestRate.find().limit(1).sort({$natural:-1});
        if (!currentInterestRate) {
            throw new Error('No Interest Rate found');
        } else {
            // res.render('updateInterestRates', { 
            //     title: 'Key in New Interest Rates' ,
            //     currentFirstMonthRate: currentInterestRate[0].firstMonthRate,
            //     currentNormalRate: currentInterestRate[0].normalRate,
            //     dateUpdated: currentInterestRate[0].dateUpdated
            // })
            res.send(currentInterestRate);
        }
    }   catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }
});

// Update interest rates
router.post('/updateInterestRate', async function(req, res) {
    try {
        const body = _.pick(req.body, [
            'firstMonthRate',
            'normalRate'
        ]);

        var newFirstMonthRate = body.firstMonthRate;
        var newNormalRate = body.normalRate;

        console.log(newFirstMonthRate)
        console.log(newNormalRate)
        // Create and save interest rate
        let interestRate = new InterestRate({
            dateUpdated: new Date(),
            firstMonthRate: newFirstMonthRate,
            normalRate: newNormalRate
        });
        await interestRate.save();
        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }
});


module.exports = router;