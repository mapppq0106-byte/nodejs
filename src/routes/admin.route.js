const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { isAdmin } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/img'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Tất cả các route dưới đây yêu cầu quyền admin
router.get('/admin', isAdmin, adminController.getDashboard);
router.get('/admin/add', isAdmin, adminController.getAddBook);
router.post('/admin/add', isAdmin, upload.single('image'), adminController.postAddBook);
router.post('/admin/delete/:id', isAdmin, adminController.postDeleteBook);

module.exports = router;