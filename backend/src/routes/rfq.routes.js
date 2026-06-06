const express = require('express');
const { createRFQ, getRFQs, getRFQById } = require('../controllers/rfq.controller');

const router = express.Router();

router.post('/', createRFQ);
router.get('/', getRFQs);
router.get('/:id', getRFQById);

module.exports = router;
