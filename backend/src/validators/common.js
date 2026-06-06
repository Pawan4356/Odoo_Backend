const { param } = require('express-validator');

const idParam = (name = 'id') =>
  param(name)
    .isInt({ min: 1 })
    .withMessage(`${name} must be a positive integer`)
    .toInt();

module.exports = { idParam };
