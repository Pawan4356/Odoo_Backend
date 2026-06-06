const express = require("express");
const { getActivity } = require("../controllers/activity.controller");
const authorize = require("../middlewares/authorize.middleware");

const router = express.Router();

router.get(
  "/",
  authorize("Admin", "Manager", "Procurement Officer", "Vendor"),
  getActivity,
);

module.exports = router;
