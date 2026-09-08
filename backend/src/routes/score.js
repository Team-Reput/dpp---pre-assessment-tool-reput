const express = require('express');
const router = express.Router();
const { getAssessmentScore } = require('../controllers/dppController');

router.get('/:ass_id', getAssessmentScore);   // GET, not POST — this only reads data

module.exports = router;