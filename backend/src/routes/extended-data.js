const express = require('express');
const router = express.Router();
const { insertExtendedData } = require('../controllers/dppController');
router.post('/', insertExtendedData);
module.exports = router;