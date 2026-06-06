const express = require('express');
const { submitQuotation, getQuotationsByRFQ, getQuotationById } = require('../controllers/quotation.controller');
const validate = require('../middlewares/validate.middleware');
const authorize = require('../middlewares/authorize.middleware');
const {
  submitQuotationValidators,
  getQuotationsByRFQValidators,
  getQuotationByIdValidators,
} = require('../validators/quotation.validator');

const router = express.Router();

router.post('/', authorize('Vendor'), submitQuotationValidators, validate, submitQuotation);
router.get('/rfq/:rfq_id', getQuotationsByRFQValidators, validate, getQuotationsByRFQ);
router.get('/:id', getQuotationByIdValidators, validate, getQuotationById);

module.exports = router;
