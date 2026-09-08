const express = require('express');
const router = express.Router();
const { insertSocialLaborData } = require('../controllers/dppController');
router.post('/', insertSocialLaborData);
module.exports = router;