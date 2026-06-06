const express = require("express");
const {
  generatePO,
  generateInvoice,
  getPOs,
} = require("../controllers/po.controller");
const validate = require("../middlewares/validate.middleware");
const authorize = require("../middlewares/authorize.middleware");
const {
  generatePOValidators,
  generateInvoiceValidators,
} = require("../validators/po.validator");

const router = express.Router();

router.post(
  "/generate-po",
  authorize("Admin", "Manager"),
  generatePOValidators,
  validate,
  generatePO,
);
router.post(
  "/generate-invoice",
  authorize("Admin","Manager"),
  generateInvoiceValidators,
  validate,
  generateInvoice,
);
router.get(
  "/",
  authorize("Admin", "Manager", "Procurement Officer", "Vendor"),
  getPOs,
);

module.exports = router;
