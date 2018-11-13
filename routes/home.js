// Library imports
const express = require('express');
const router = express.Router();

// Custom imports
const {getGoldSilverPrice} = require('../utils/priceScrapper');

// POST: add a trial user
router.get('/getPrices', async (req, res) => {
    try {
        // Get and return prices
        const valuesPerGram = await getGoldSilverPrice();
        res.send(valuesPerGram);
    } catch (error) {
        console.log(error.stack);
        res.status(500).send({
            error: error.toString()
        });
    }   
});

module.exports = router;