const express = require('express');
const { approveQuotation } = require('../controllers/approval.controller');

const router = express.Router();

router.post('/quotation/:id', approveQuotation);

module.exports = router;
