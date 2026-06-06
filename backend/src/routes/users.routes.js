const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const authorize = require("../middlewares/authorize.middleware");

router.use(authorize("Admin")); // Only Admin can manage users

router.get("/", usersController.getUsers);

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  usersController.createUser
);

router.put("/:id/status", usersController.updateUserStatus);

router.post("/:id/reset-password", usersController.resetPassword);

module.exports = router;
