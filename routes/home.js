// Library imports
const express = require('express');
const router = express.Router();

// Custom imports
const {User} = require('../db/models/user');
const {authenticate} = require('../middleware/authenticate');

// Add middleware
router.use(authenticate);



module.exports = router;