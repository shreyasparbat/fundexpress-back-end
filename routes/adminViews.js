// Library imports
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const xlsx = require('xlsx');

// Custom imports
const {InterestRate} = require('../db/models/interestRate');
const {WatchPrice} = require('../db/models/watchPrice');

router.get('/', function (req, res) {
    res.render('index', {title: 'FundExpress Admin Home Page'});
});
    
// Page for uploading new CSV for retraining
router.get('/retrainCreditRatingModel', function(req, res) {
    res.render('retrainCreditRatingModel', { title: 'Upload New CSV File' });
    console.log(req);
});

// Page for uploading new CSV for watch brands
router.get('/updateWatchPrices', function(req, res) {
    res.render('updateWatchPrices', { title: 'Upload New CSV File' });
});

// Update watch price
router.post('/updateWatchPrice', async function (req, res) {
    try {
        // const body = _.pick(req.body, [
        //     'newPriceList'
        // ]);

        // console.log(body.newPriceList)

        const workbook = xlsx.readFile('Watch price list v1.xlsx');
        const sheet_name_list = workbook.SheetNames;
        var jsonArray = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])

        console.log(sheet_name_list)

        for(var i = 0; i < jsonArray.length; i++) {
            var obj = jsonArray[i];
            console.log(obj);
            console.log(obj.S/N);
        //     var source = obj.Source;
        //     var brandName = obj.Brand;
        //     var modelName = obj.Model;
        //     var serialNumber = obj.S/N;
        //     var newPrice = obj.Price;
            
        //     var retrieveWatchPrice = await WatchPrice.find({
        //         brand: brandName
        //     });
        //     var currentWatchPrice = retrieveWatchPrice[0];

        //     if(!currentWatchPrice) {
        //         //create new watchPrice item
        //         let newWatchPrice = new WatchPrice({
        //             brand: brandName,
        //             value: newPrice
        //         });
        //         await newWatchPrice.save();
        //         console.log("I am here")
        //     } else {
        //         //code to update existing price
        //         console.log(currentWatchPrice)
        //         currentWatchPrice.set({
        //             brand: brandName,
        //             value: newPrice
        //         });
        //         await currentWatchPrice.save();
        //     }
         }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }
});

// Page for displaying and requesting new interest rates
router.get('/getInterestRate', async function(req, res) {
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
        res.send(interestRate);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.toString()
        });
    }
});

module.exports = router;