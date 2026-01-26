const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { isAdmin } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

// Cấu hình lưu trữ ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Trỏ chính xác vào thư mục public/img từ file hiện tại (routes)
        cb(null, path.join(__dirname, '../public/img'));
    },
    filename: (req, file, cb) => {
        // Đặt tên file bằng timestamp để tránh trùng lặp
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Routes quản trị
router.get('/admin', isAdmin, adminController.getDashboard);
router.get('/admin/add', isAdmin, adminController.getAddBook);

// QUAN TRỌNG: upload.single('image') phải khớp với name="image" trong form HTML
router.post('/admin/add', isAdmin, upload.single('image'), adminController.postAddBook);

// admin.route.js
router.get('/admin/edit/:id', isAdmin, adminController.getEditBook);
router.post('/admin/edit/:id', isAdmin, upload.single('image'), adminController.postEditBook);
router.post('/admin/delete/:id', isAdmin, adminController.postDeleteBook);

// Routes Quản lý người dùng (Mới)
router.get('/admin/users', isAdmin, adminController.getUserManagement);
router.post('/admin/users/update-role', isAdmin, adminController.postUpdateUserRole);
router.post('/admin/users/delete/:id', isAdmin, adminController.postDeleteUser);

// Quản lý đánh giá
router.get('/admin/reviews', isAdmin, adminController.getReviewManagement);
router.post('/admin/reviews/delete/:id', isAdmin, adminController.postDeleteReview);

module.exports = router;