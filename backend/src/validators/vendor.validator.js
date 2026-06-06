const { body } = require('express-validator');
const { idParam } = require('./common');

const registerVendorValidators = [
  body('company_name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 255 })
    .withMessage('Company name must be at most 255 characters'),
  body('contact_person')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Contact person must be at most 255 characters'),
  body('phone')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Phone must be at most 50 characters')
    .matches(/^[+\d\s\-().]*$/)
    .withMessage('Phone contains invalid characters'),
  body('gst_details')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('GST details must be at most 100 characters'),
  body('category')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must be at most 100 characters'),
];

const getVendorByIdValidators = [idParam()];

const createVendorByStaffValidators = [
  body('name')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Name must be at most 255 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('A valid email is required')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must be at most 255 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters'),
  ...registerVendorValidators,
];

module.exports = {
  createVendorByStaffValidators,
  registerVendorValidators,
  getVendorByIdValidators,
};
