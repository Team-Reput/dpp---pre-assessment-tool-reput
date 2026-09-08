const express = require('express');
const router = express.Router();
const { insertMaterialOrigin } = require('../controllers/dppController');
router.post('/', insertMaterialOrigin);
module.exports = router;