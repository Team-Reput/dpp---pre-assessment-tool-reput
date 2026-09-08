const express = require('express');
const router = express.Router();
const { insertSupplyChainData } = require('../controllers/dppController');
router.post('/', insertSupplyChainData);
module.exports = router;