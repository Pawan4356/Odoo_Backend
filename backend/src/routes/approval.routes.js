const express = require('express');
const { approveQuotation } = require('../controllers/approval.controller');
const validate = require('../middlewares/validate.middleware');
const authorize = require('../middlewares/authorize.middleware');
const { approveQuotationValidators } = require('../validators/approval.validator');

const router = express.Router();

router.post(
  '/quotation/:id',
  authorize('Admin', 'Manager'),
  approveQuotationValidators,
  validate,
  approveQuotation
);

module.exports = router;
