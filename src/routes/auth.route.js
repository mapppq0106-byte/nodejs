const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Trang Đăng nhập (GET để hiển thị form, POST để xử lý dữ liệu)
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// Trang Đăng ký (GET để hiển thị form, POST để xử lý dữ liệu)
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);

module.exports = router;