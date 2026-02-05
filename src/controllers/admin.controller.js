const Book = require('../models/book.model');

// Hiển thị danh sách quản lý sách cho admin
exports.getDashboard = async (req, res) => {
    try {
        const books = await Book.getAll();
        res.render('admin/dashboard', { books });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi tải trang quản trị');
    }
};

// Hiển thị form thêm sách mới
exports.getAddBook = (req, res) => {
    res.render('admin/add-book');
};

// Xử lý thêm sách mới
exports.postAddBook = async (req, res) => {
    try {
        const { title, author, description, price, isbn } = req.body;
        const image_url = req.file ? req.file.filename : 'default-book.jpg';
        
        await Book.create({ title, author, description, image_url, price, isbn });
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi thêm sách');
    }
};

// Hiển thị form chỉnh sửa sách
exports.getEditBook = async (req, res) => {
    try {
        const book = await Book.getById(req.params.id);
        if (!book) return res.status(404).send('Không tìm thấy sách');
        res.render('admin/edit-book', { book });
    } catch (error) {
        res.status(500).send('Lỗi hệ thống');
    }
};

// Xử lý cập nhật thông tin sách
exports.postEditBook = async (req, res) => {
    try {
        const { title, author, description, price, isbn } = req.body;
        const bookId = req.params.id;
        
        // Lấy lại thông tin cũ để giữ ảnh nếu người dùng không upload ảnh mới
        const oldBook = await Book.getById(bookId);
        const image_url = req.file ? req.file.filename : oldBook.image_url;

        await Book.update(bookId, { title, author, description, image_url, price, isbn });
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi cập nhật sách');
    }
};

// Xử lý xóa sách
// File: admin.controller.js
exports.postDeleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        await Book.delete(bookId); // Gọi hàm delete từ book.model.js
        res.redirect('/admin');   // Xóa xong quay lại trang Dashboard
    } catch (error) {
        console.error("Lỗi xóa sách:", error);
        res.status(500).send('Lỗi khi xóa sách. Vui lòng kiểm tra lại cơ sở dữ liệu!');
    }
};