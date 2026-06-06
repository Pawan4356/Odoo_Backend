const { body } = require('express-validator');
const { idParam } = require('./common');

const createRFQValidators = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be at most 255 characters'),
  body('description')
    .optional({ values: 'null' })
    .isString()
    .withMessage('Description must be a string'),
  body('deadline')
    .notEmpty()
    .withMessage('Deadline is required')
    .isISO8601()
    .withMessage('Deadline must be a valid ISO 8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.product_name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required for each item')
    .isLength({ max: 255 })
    .withMessage('Product name must be at most 255 characters'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer for each item'),
  body('items.*.description')
    .optional({ values: 'null' })
    .isString()
    .withMessage('Item description must be a string'),
  body('vendor_ids')
    .optional()
    .isArray()
    .withMessage('vendor_ids must be an array'),
  body('vendor_ids.*')
    .isInt({ min: 1 })
    .withMessage('Each vendor_id must be a positive integer'),
];

const getRFQByIdValidators = [idParam()];

module.exports = { createRFQValidators, getRFQByIdValidators };
