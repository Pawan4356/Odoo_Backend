const express = require('express');
const { submitQuotation, getQuotationsByRFQ, getQuotationById } = require('../controllers/quotation.controller');

const router = express.Router();

router.post('/', submitQuotation);
router.get('/rfq/:rfq_id', getQuotationsByRFQ);
router.get('/:id', getQuotationById);

module.exports = router;
