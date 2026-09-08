const express = require('express');
const router = express.Router();
const{insertIdentification} = require('../controllers/dppController');

router.post('/', insertIdentification);
module.exports = router;