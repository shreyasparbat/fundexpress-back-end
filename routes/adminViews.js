const express = require('express');
const router = express.Router();
    
// Page for uploading new CSV for retraining
router.get('/retrainCreditRatingModel', function(req, res) {
    res.render('retrainCreditRatingModel', { title: 'Upload New CSV' });
});


module.exports = router;