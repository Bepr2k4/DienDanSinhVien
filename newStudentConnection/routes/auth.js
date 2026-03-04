const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const verifyFirebaseToken = require('../middlewares/authMiddleware');

// Đăng ký
router.post('/register', AuthController.register);
// Đăng nhập
router.post('/login', AuthController.login);


module.exports = router;
