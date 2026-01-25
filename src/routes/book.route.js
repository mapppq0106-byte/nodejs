const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');

router.get('/', bookController.getAllBooks);

// Trang chi tiết sách
router.get('/book/:id', bookController.getBookDetail);

// Xử lý gửi đánh giá
router.post('/book/:id/review', bookController.postReview);

module.exports = router;