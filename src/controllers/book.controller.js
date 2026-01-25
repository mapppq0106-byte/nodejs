const Book = require('../models/book.model');

// Hiển thị trang chủ
exports.getAllBooks = async (req, res) => {
    try {
        const keyword = req.query.search;
        let books = keyword ? await Book.search(keyword.trim()) : await Book.getAll();
        res.render('home', { books, keyword });
    } catch (error) {
        res.status(500).send('Lỗi khi lấy dữ liệu sách');
    }
};

// Hiển thị trang chi tiết sách (Đảm bảo hàm này tồn tại)
exports.getBookDetail = async (req, res) => {
    try {
        const bookId = req.params.id;
        const book = await Book.getById(bookId);
        
        if (!book) return res.status(404).send('Không tìm thấy sách');

        const reviews = await Book.getReviews(bookId);
        res.render('book-detail', { book, reviews });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi tải trang chi tiết');
    }
};

// Xử lý gửi đánh giá mới
exports.postReview = async (req, res) => {
    try {
        const bookId = req.params.id;
        const { rating, comment } = req.body;
        const userId = req.session.userId;

        if (!userId) return res.redirect('/login');

        await Book.addReview(userId, bookId, rating, comment);
        res.redirect(`/book/${bookId}`);
    } catch (error) {
        res.status(500).send('Lỗi khi gửi đánh giá');
    }
};