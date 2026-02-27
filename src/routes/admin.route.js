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
        // Đảm bảo đường dẫn public/img tồn tại để tránh lỗi khi upload
        cb(null, path.join(__dirname, '../public/img'));
    },
    filename: (req, file, cb) => {
        // Sử dụng timestamp + tên gốc để file ảnh là duy nhất
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Giới hạn dung lượng và loại file (Tùy chọn bổ sung để bảo mật)
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

// --- ROUTES QUẢN TRỊ SÁCH ---
router.get('/admin', isAdmin, adminController.getDashboard);
router.get('/admin/dashboard', isAdmin, adminController.getDashboard); // Alias cho /admin
router.get('/admin/add', isAdmin, adminController.getAddBook);
router.post('/admin/add', isAdmin, upload.single('image'), adminController.postAddBook);
router.get('/admin/edit/:id', isAdmin, adminController.getEditBook);
// Đã hỗ trợ postEditBook kiểm tra trùng tên trong Controller
router.post('/admin/edit/:id', isAdmin, upload.single('image'), adminController.postEditBook);
router.post('/admin/delete/:id', isAdmin, adminController.postDeleteBook);

// --- ROUTES QUẢN LÝ NGƯỜI DÙNG ---
router.get('/admin/users', isAdmin, adminController.getUserManagement);
router.post('/admin/users/delete/:id', isAdmin, adminController.postDeleteUser);

// --- ROUTES QUẢN LÝ ĐÁNH GIÁ ---
router.get('/admin/reviews', isAdmin, adminController.getReviewManagement);
router.post('/admin/reviews/delete/:id', isAdmin, adminController.postDeleteReview);

// --- ROUTES QUẢN LÝ THỐNG KÊ (Đã cập nhật Sao & Lượt xem) ---
router.get('/admin/statistics', isAdmin, adminController.getStatistics);

// --- ROUTES QUẢN LÝ DANH MỤC ---
router.get('/admin/categories', isAdmin, categoryController.getCategoryManagement);
router.post('/admin/categories/add', isAdmin, categoryController.postAddCategory);
// Lưu ý: Nên dùng POST cho hành động xóa để bảo mật hơn thay vì GET
router.get('/admin/categories/delete/:id', isAdmin, categoryController.getDeleteCategory);

module.exports = router;