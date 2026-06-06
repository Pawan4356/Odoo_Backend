const { body } = require('express-validator');

const generatePOValidators = [
  body('quotation_id')
    .isInt({ min: 1 })
    .withMessage('quotation_id must be a positive integer'),
];

const generateInvoiceValidators = [
  body('purchase_order_id')
    .isInt({ min: 1 })
    .withMessage('purchase_order_id must be a positive integer'),
  body('tax_amount')
    .isFloat({ min: 0 })
    .withMessage('tax_amount must be a non-negative number')
    .custom((value) => {
      const decimals = (String(value).split('.')[1] || '').length;
      if (decimals > 2) {
        throw new Error('tax_amount must have at most 2 decimal places');
      }
      return true;
    }),
];

module.exports = { generatePOValidators, generateInvoiceValidators };
