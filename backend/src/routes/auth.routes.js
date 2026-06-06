const express = require('express');
const { register, login, sendOtp } = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { registerValidators, loginValidators } = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', registerValidators, validate, register);
router.post('/login', loginValidators, validate, login);
router.post('/send-otp',sendOtp);

module.exports = router;
