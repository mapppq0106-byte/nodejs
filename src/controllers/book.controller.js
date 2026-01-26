const Book = require('../models/book.model');

// Hiển thị trang chủ và tìm kiếm
exports.getAllBooks = async (req, res) => {
    try {
        const keyword = req.query.search;
        let books = keyword ? await Book.search(keyword.trim()) : await Book.getAll();
        res.render('home', { books, keyword });
    } catch (error) {
        res.status(500).send('Lỗi khi lấy dữ liệu sách');
    }
};

// src/controllers/book.controller.js
exports.getBookDetail = async (req, res) => {
    try {
        const bookId = req.params.id;
        const book = await Book.getById(bookId);
        
        if (!book) {
            return res.status(404).send('Không tìm thấy sách');
        }

        const reviews = await Book.getReviews(bookId);
        
        // Kiểm tra xem người dùng đã đánh giá chưa
        let hasReviewed = false;
        if (req.session.user) {
            hasReviewed = await Book.checkUserReview(req.session.user.id, bookId);
        }

        // Render trang với đầy đủ dữ liệu
        res.render('book-detail', { 
            book, 
            reviews, 
            hasReviewed,
            user: req.session.user 
        });
    } catch (error) {
        // In lỗi ra console để bạn dễ dàng debug xem cụ thể lỗi ở dòng nào
        console.error("Lỗi chi tiết:", error); 
        res.status(500).send('Lỗi tải trang chi tiết');
    }
};

// Xử lý gửi đánh giá mới (Web)
exports.postReview = async (req, res) => {
    try {
        const bookId = req.params.id;
        const { rating, comment } = req.body;
        const userId = req.session.user ? req.session.user.id : null; 

        if (!userId) return res.redirect('/login');

        const alreadyReviewed = await Book.checkUserReview(userId, bookId);
        if (alreadyReviewed) return res.status(400).send('Bạn đã đánh giá sách này rồi');

        await Book.addReview(userId, bookId, rating, comment);
        res.redirect(`/book/${bookId}`);
    } catch (error) {
        res.status(500).send('Lỗi khi gửi đánh giá');
    }
};

// Xử lý API trả về JSON theo ISBN (API)
exports.getBookApi = async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const book = await Book.getByIsbn(isbn);

        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy sách với mã ISBN này" });
        }

        res.json({
            title: book.title,
            author: book.author,
            published_date: "2026-01-26",
            isbn: book.isbn,
            view_count: 100,
            average_score: parseFloat(book.average_score).toFixed(1)
        });
    } catch (error) {
        res.status(500).json({ error: "Lỗi hệ thống API" });
    }
};

// API Lấy toàn bộ danh sách sách (API JSON)
exports.getBooksApi = async (req, res) => {
    try {
        const books = await Book.getAll();
        res.status(200).json({
            success: true,
            data: books
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách API" });
    }
};

// API Gửi đánh giá (API JSON)
exports.postReviewApi = async (req, res) => {
    try {
        const bookId = req.params.id;
        const { rating, comment } = req.body;
        const userId = req.session.user ? req.session.user.id : null;

        const alreadyReviewed = await Book.checkUserReview(userId, bookId);
        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: "Bạn đã đánh giá sách này rồi" });
        }

        await Book.addReview(userId, bookId, rating, comment);
        res.status(201).json({ success: true, message: "Đánh giá thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi gửi đánh giá API" });
    }
};