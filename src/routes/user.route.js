const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Middleware kiểm tra đăng nhập (để bảo vệ trang profile)
const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

router.get('/profile', isLoggedIn, userController.getProfile);
router.post('/profile/change-password', isLoggedIn, userController.postChangePassword);

module.exports = router;