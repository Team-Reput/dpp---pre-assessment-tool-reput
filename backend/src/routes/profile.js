const express = require('express');
const router = express.Router();
const { insertProfile } = require('../controllers/dppController');

router.post('/', insertProfile);

module.exports = router;