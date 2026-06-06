const express = require("express");
const {
  registerVendor,
  createVendorByStaff,
  getMyVendorProfile,
  getVendors,
  getVendorById,
  updateMyVendorProfile,
  updateVendorStatus,
} = require("../controllers/vendor.controller");
const validate = require("../middlewares/validate.middleware");
const authorize = require("../middlewares/authorize.middleware");
const {
  createVendorByStaffValidators,
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
router.post(
  "/staff",
  authorize("Admin", "Procurement Officer"),
  createVendorByStaffValidators,
  validate,
  createVendorByStaff,
);
router.get("/me", authorize("Vendor"), getMyVendorProfile);
router.put(
  "/me",
  authorize("Vendor"),
  registerVendorValidators,
  validate,
  updateMyVendorProfile,
);
router.get(
  "/",
  authorize("Admin", "Manager", "Procurement Officer"),
  getVendors,
);
router.get("/:id", getVendorByIdValidators, validate, getVendorById);

router.put(
  "/:id/status",
  authorize("Admin", "Manager"),
  updateVendorStatus
);

module.exports = router;
