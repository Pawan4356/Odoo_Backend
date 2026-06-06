const { body } = require('express-validator');
const { REGISTERABLE_ROLES } = require('../constants/enums');

const registerValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
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
  body('role')
    .optional()
    .isIn(REGISTERABLE_ROLES)
    .withMessage(`Role must be one of: ${REGISTERABLE_ROLES.join(', ')}`),
];

const loginValidators = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('A valid email is required')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { registerValidators, loginValidators };
