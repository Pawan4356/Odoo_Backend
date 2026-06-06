const express = require('express');
const { generatePO, generateInvoice, getPOs } = require('../controllers/po.controller');

const router = express.Router();

router.post('/generate-po', generatePO);
router.post('/generate-invoice', generateInvoice);
router.get('/', getPOs);

module.exports = router;
