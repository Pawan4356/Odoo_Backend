const { body } = require('express-validator');
const { idParam } = require('./common');

const approveQuotationValidators = [
  idParam(),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Approved', 'Rejected'])
    .withMessage('Status must be Approved or Rejected'),
  body('remarks')
    .optional({ values: 'null' })
    .isString()
    .withMessage('Remarks must be a string'),
];

module.exports = { approveQuotationValidators };
