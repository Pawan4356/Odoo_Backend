const express = require('express');
const { generatePO, generateInvoice, getPOs } = require('../controllers/po.controller');
const validate = require('../middlewares/validate.middleware');
const authorize = require('../middlewares/authorize.middleware');
const { generatePOValidators, generateInvoiceValidators } = require('../validators/po.validator');

const router = express.Router();

router.post('/generate-po', authorize('Admin', 'Procurement Officer'), generatePOValidators, validate, generatePO);
router.post(
  '/generate-invoice',
  authorize('Admin', 'Procurement Officer'),
  generateInvoiceValidators,
  validate,
  generateInvoice
);
router.get('/', authorize('Admin', 'Manager', 'Procurement Officer'), getPOs);

module.exports = router;
