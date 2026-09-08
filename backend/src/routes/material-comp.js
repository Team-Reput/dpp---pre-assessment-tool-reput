const express = require('express');
const router = express.Router();
const { insertMaterialComposition } = require('../controllers/dppController');

router.post('/', insertMaterialComposition);

module.exports = router;