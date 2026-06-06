const express = require('express');
const { registerVendor, getVendors, getVendorById } = require('../controllers/vendor.controller');

const router = express.Router();

router.post('/', registerVendor);
router.get('/', getVendors);
router.get('/:id', getVendorById);

module.exports = router;
