const express = require('express');
const router = express.Router();
const { insertTraceabilityData } = require('../controllers/dppController');
router.post('/', insertTraceabilityData);
module.exports = router;