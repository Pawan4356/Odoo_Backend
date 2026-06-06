const express = require('express');
const { createRFQ, getRFQs, getRFQById } = require('../controllers/rfq.controller');
const validate = require('../middlewares/validate.middleware');
const authorize = require('../middlewares/authorize.middleware');
const { createRFQValidators, getRFQByIdValidators } = require('../validators/rfq.validator');

const router = express.Router();

router.post('/', authorize('Admin', 'Procurement Officer'), createRFQValidators, validate, createRFQ);
router.get('/', getRFQs);
router.get('/:id', getRFQByIdValidators, validate, getRFQById);

module.exports = router;
