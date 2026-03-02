const Book = require('../models/book.model');

// Hiển thị trang chủ và tìm kiếm (Cập nhật logic lọc danh mục)
exports.getAllBooks = async (req, res) => {
    try {
        const keyword = req.query.search;
        let categoryId = req.query.category;

        // Xử lý nếu người dùng chọn "Tất cả" (thường gửi về "" hoặc "all")
        if (categoryId === 'all' || categoryId === '') {
            categoryId = null;
        }

        let books;
        // Nếu có từ khóa tìm kiếm HOẶC có lọc theo ID danh mục cụ thể
        if (keyword || categoryId) {
            books = await Book.searchBooks(keyword ? keyword.trim() : '', categoryId);
        } else {
            books = await Book.getAll();
        }

        res.render('home', { 
            books, 
            keyword, 
            currentCategory: categoryId 
        });
    } catch (error) {
        console.error("Lỗi hiển thị sách:", error);
        res.status(500).send('Lỗi hệ thống');
    }
};

// Hiển thị chi tiết sách
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

        res.render('book-detail', { 
            book, 
            reviews, 
            hasReviewed,
            user: req.session.user 
        });
    } catch (error) {
        console.error("Lỗi chi tiết:", error); 
        res.status(500).send('Lỗi tải trang chi tiết');
    }
};

// Xử lý gửi đánh giá mới
exports.postReview = async (req, res) => {
    try {
        const bookId = req.params.id;
        const { rating, comment, is_anonymous } = req.body; // is_anonymous từ form
        const userId = req.session.user ? req.session.user.id : null;

        if (!userId) return res.redirect('/login');

        // Chuyển đổi checkbox (thường là 'on' hoặc undefined) sang boolean
        const isAnonymous = is_anonymous === 'on' || is_anonymous === true;

        const alreadyReviewed = await Book.checkUserReview(userId, bookId);
        if (alreadyReviewed) {
            // Có thể xử lý thông báo lỗi tại đây
            return res.redirect(`/book/${bookId}`);
        }

        await Book.addReview(userId, bookId, rating, comment, isAnonymous);
        res.redirect(`/book/${bookId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi hệ thống khi gửi đánh giá');
    }
};

// --- CÁC HÀM API JSON ---
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
            average_score: parseFloat(book.average_score || 0).toFixed(1)
        });
    } catch (error) {
        res.status(500).json({ error: "Lỗi hệ thống API" });
    }
};

exports.getBooksApi = async (req, res) => {
    try {
        const books = await Book.getAll();
        res.status(200).json({ success: true, data: books });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách API" });
    }
};

exports.postReviewApi = async (req, res) => {
    try {
        const bookId = req.params.id;
        const { rating, comment } = req.body;
        const userId = req.session.user ? req.session.user.id : null;

        if (!userId) return res.status(401).json({ success: false, message: "Chưa đăng nhập" });

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

exports.readBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const chapterNum = req.query.chapter || 1;
        
        const book = await Book.getById(bookId);
        const chapters = await Book.getChapters(bookId);
        const currentChapter = await Book.getChapterDetail(bookId, chapterNum);

        // Đảm bảo file này tồn tại trong src/resources/views/read-book.hbs
        res.render('read-book', { 
            book, 
            chapters, 
            currentChapter,
            user: req.session.user // Truyền user để header hiển thị đúng
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi tải nội dung sách');
    }
};