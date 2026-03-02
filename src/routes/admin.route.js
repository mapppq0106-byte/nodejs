const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const categoryController = require('../controllers/category.controller');
const { isAdmin } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

// --- CẤU HÌNH LƯU TRỮ ẢNH (MULTER) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/img'));
    },
    filename: (req, file, cb) => {
        // Lấy tên file gốc, loại bỏ các timestamp cũ nếu có (chuỗi số dài phía trước)
        const originalName = file.originalname.split('-').pop(); 
        // Tạo tên duy nhất: timestamp-tên_gốc
        cb(null, Date.now() + '-' + originalName);
    }
});

// Giới hạn dung lượng và loại file
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype) return cb(null, true);
        cb(new Error("Chỉ hỗ trợ định dạng ảnh (jpg, png, webp)!"));
    }
});

// --- FIX LỖI CHUYỂN TRANG: ĐIỀU HƯỚNG GỐC ---
// Nếu người dùng vào /admin, hệ thống sẽ tự động chuyển hướng sang /admin/dashboard
router.get('/admin', isAdmin, (req, res) => {
    res.redirect('/admin/dashboard');
});

// --- ROUTES QUẢN TRỊ SÁCH ---
router.get('/admin/dashboard', isAdmin, adminController.getDashboard);
router.get('/admin/add', isAdmin, adminController.getAddBook);
router.post('/admin/add', isAdmin, upload.single('image'), adminController.postAddBook);
router.get('/admin/edit/:id', isAdmin, adminController.getEditBook);
router.post('/admin/edit/:id', isAdmin, upload.single('image'), adminController.postEditBook);
router.post('/admin/delete/:id', isAdmin, adminController.postDeleteBook);

// --- ROUTES QUẢN LÝ NGƯỜI DÙNG ---
router.get('/admin/users', isAdmin, adminController.getUserManagement);
// Route xử lý Khóa/Mở khóa người dùng
router.post('/admin/users/toggle-status/:id', isAdmin, adminController.postToggleUserStatus);
// Xóa người dùng
router.post('/admin/users/delete/:id', isAdmin, adminController.postDeleteUser);

// --- ROUTES QUẢN LÝ ĐÁNH GIÁ (CẬP NHẬT CHỨC NĂNG ẨN DANH) ---
router.get('/admin/reviews', isAdmin, adminController.getReviewManagement);

// // THÊM MỚI: Route xử lý Ẩn danh/Hiện tên đánh giá thay cho việc chỉ xóa
// router.post('/admin/reviews/toggle-anonymous/:id', isAdmin, adminController.postToggleReviewAnonymous);

// // Vẫn giữ lại route xóa nếu admin muốn xóa vĩnh viễn đánh giá rác
// router.post('/admin/reviews/delete/:id', isAdmin, adminController.postDeleteReview);

// --- ROUTES QUẢN LÝ THỐNG KÊ ---
router.get('/admin/statistics', isAdmin, adminController.getStatistics);

// --- ROUTES QUẢN LÝ DANH MỤC ---
router.get('/admin/categories', isAdmin, categoryController.getCategoryManagement);
router.post('/admin/categories/add', isAdmin, categoryController.postAddCategory);
router.get('/admin/categories/delete/:id', isAdmin, categoryController.getDeleteCategory);

module.exports = router;