const express = require("express");
const { getReports } = require("../controllers/report.controller");
const authorize = require("../middlewares/authorize.middleware");

const router = express.Router();

router.get("/", authorize("Admin", "Manager", "Procurement Officer"), getReports);

module.exports = router;
