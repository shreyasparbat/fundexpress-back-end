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
        var jsonArray = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        console.log(sheet_name_list);

        var objSource = ""
        var objBrandName = ""
        var objModelName = ""
        var objSerialNumber = ""
        var objSellingPrice = 0
        var objPawnValue = 0
        var objBuybackValue = 0
            
        for(var i = 0; i < jsonArray.length; i++) {
            let obj = jsonArray[i];
            if (obj["Source"]) {
                objSource = obj["Source"];
            }
            if (obj["Brand"]) {
                objBrandName = obj["Brand"];
            }
            
            objModelName = obj["Model"];
            objSerialNumber = obj["S/N"];
            objSellingPrice = obj["Selling Price"];
            objPawnValue = obj["Pawn Value"];
            objBuybackValue = obj["Buyback value"];
            
            var retrieveWatchPrice = await WatchPrice.find({
                serialNumber: objSerialNumber
            });
            var currentWatchPrice = retrieveWatchPrice[0];

            if(!currentWatchPrice) {
                //create new watchPrice item
                let newWatchPrice = new WatchPrice({
                    source: objSource,
                    brand: objBrandName,
                    model: objModelName,
                    serialNumber: objSerialNumber,
                    sellingPrice: objSellingPrice,
                    pawnValue: objPawnValue,
                    buybackValue: objBuybackValue
                });
                await newWatchPrice.save();
            } else {
                //code to update existing price
                currentWatchPrice.set({
                    source: objSource,
                    sellingPrice: objSellingPrice,
                    pawnValue: objPawnValue,
                    buybackValue: objBuybackValue
                });
                await currentWatchPrice.save();
            }
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

        console.log(newFirstMonthRate);
        console.log(newNormalRate);
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