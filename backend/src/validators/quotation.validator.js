const { body } = require('express-validator');
const { idParam } = require('./common');

const submitQuotationValidators = [
  body('rfq_id')
    .isInt({ min: 1 })
    .withMessage('rfq_id must be a positive integer'),
  body('vendor_id')
    .isInt({ min: 1 })
    .withMessage('vendor_id must be a positive integer'),
  body('delivery_timeline')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Delivery timeline must be at most 255 characters'),
  body('notes')
    .optional({ values: 'null' })
    .isString()
    .withMessage('Notes must be a string'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.rfq_item_id')
    .isInt({ min: 1 })
    .withMessage('rfq_item_id must be a positive integer for each item'),
  body('items.*.unit_price')
    .isFloat({ min: 0 })
    .withMessage('unit_price must be a non-negative number for each item')
    .custom((value) => {
      const decimals = (String(value).split('.')[1] || '').length;
      if (decimals > 2) {
        throw new Error('unit_price must have at most 2 decimal places');
      }
      return true;
    }),
];

const getQuotationsByRFQValidators = [idParam('rfq_id')];

const getQuotationByIdValidators = [idParam()];

module.exports = {
  submitQuotationValidators,
  getQuotationsByRFQValidators,
  getQuotationByIdValidators,
};
