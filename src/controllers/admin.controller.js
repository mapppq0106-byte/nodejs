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

// Xử lý xóa sách
exports.postDeleteBook = async (req, res) => {
    try {
        await Book.delete(req.params.id);
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi xóa sách');
    }
};