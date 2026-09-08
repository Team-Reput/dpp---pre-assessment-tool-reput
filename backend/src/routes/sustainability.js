const express = require('express');
const router = express.Router();
const { insertSustainabilityData } = require('../controllers/dppController');
router.post('/', insertSustainabilityData);
module.exports = router;