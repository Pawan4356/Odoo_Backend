const express = require('express');
const { approveQuotation, getApprovals } = require('../controllers/approval.controller');
const validate = require('../middlewares/validate.middleware');
const authorize = require('../middlewares/authorize.middleware');
const { approveQuotationValidators } = require('../validators/approval.validator');

const router = express.Router();

router.get(
  '/',
  authorize('Admin', 'Manager', 'Procurement Officer'),
  getApprovals
);

router.post(
  '/quotation/:id',
  authorize('Admin', 'Manager'),
  approveQuotationValidators,
  validate,
  approveQuotation
);

module.exports = router;
