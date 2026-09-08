const express = require('express');
const router = express.Router();
const { insertAssessmentStructure } = require('../controllers/dppController');
router.post('/', insertAssessmentStructure);
module.exports = router;