const express = require("express");
const {
  registerVendor,
  getVendors,
  getVendorById,
} = require("../controllers/vendor.controller");
const validate = require("../middlewares/validate.middleware");
const authorize = require("../middlewares/authorize.middleware");
const {
  registerVendorValidators,
  getVendorByIdValidators,
} = require("../validators/vendor.validator");

const router = express.Router();

router.post(
  "/",
  authorize("Vendor"),
  registerVendorValidators,
  validate,
  registerVendor,
);
router.get(
  "/",
  authorize("Admin", "Manager", "Procurement Officer"),
  getVendors,
);
router.get("/:id", getVendorByIdValidators, validate, getVendorById);

module.exports = router;
