const Book = require('../models/book.model');
const User = require('../models/user.model');
const Category = require('../models/category.model');

// 1. Hiển thị danh sách quản lý sách cho admin
exports.getDashboard = async (req, res) => {
    try {
        const books = await Book.getAll(); // Model này đã Join với categories để lấy category_name
        res.render('admin/dashboard', { books });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi tải trang quản trị');
    }
};

// 2. Hiển thị form thêm sách mới
exports.getAddBook = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.render('admin/add-book', { categories }); // Truyền categories để hiển thị trong <select>
    } catch (error) {
        res.status(500).send('Không thể lấy danh mục cho form');
    }
};

// 3. Xử lý thêm sách mới (ĐÃ SỬA: Lấy thêm category_id)
exports.postAddBook = async (req, res) => {
    try {
        const { title, author, description, price, isbn, category_id } = req.body;
        const image_url = req.file ? req.file.filename : 'default-book.jpg';
        
        // Truyền thêm category_id vào model
        await Book.create({ title, author, description, image_url, price, isbn, category_id });
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi thêm sách');
    }
};

// 4. Hiển thị form chỉnh sửa sách (ĐÃ SỬA: Lấy thêm danh sách categories)
exports.getEditBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const book = await Book.getById(bookId);
        const categories = await Category.getAll(); // Cần cái này để người dùng chọn lại danh mục khi sửa

        if (!book) return res.status(404).send('Không tìm thấy sách');
        
        res.render('admin/edit-book', { book, categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi hệ thống');
    }
};

// 5. Xử lý cập nhật thông tin sách (ĐÃ SỬA: Cập nhật category_id)
exports.postEditBook = async (req, res) => {
    try {
        const { title, author, description, price, isbn, category_id } = req.body;
        const bookId = req.params.id;
        
        const oldBook = await Book.getById(bookId);
        const image_url = req.file ? req.file.filename : oldBook.image_url;

        // Cập nhật bao gồm cả category_id mới
        await Book.update(bookId, { title, author, description, image_url, price, isbn, category_id });
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi cập nhật sách');
    }
};

// 6. Xử lý xóa sách
exports.postDeleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        await Book.delete(bookId);
        res.redirect('/admin');
    } catch (error) {
        console.error("Lỗi xóa sách:", error);
        res.status(500).send('Lỗi khi xóa sách. Vui lòng kiểm tra lại cơ sở dữ liệu!');
    }
};

// --- QUẢN LÝ NGƯỜI DÙNG ---

exports.getUserManagement = async (req, res) => {
    try {
        const users = await User.getAll();
        res.render('admin/user-list', { users });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi tải danh sách người dùng');
    }
};

exports.postUpdateUserRole = async (req, res) => {
    try {
        const { id, role } = req.body;
        const newRole = (role === 'admin') ? 'user' : 'admin';
        await User.updateRole(id, newRole);
        res.redirect('/admin/users');
    } catch (error) {
        res.status(500).send('Lỗi cập nhật quyền');
    }
};

exports.postDeleteUser = async (req, res) => {
    try {
        await User.delete(req.params.id);
        res.redirect('/admin/users');
    } catch (error) {
        res.status(500).send('Lỗi khi xóa người dùng');
    }
};

// --- QUẢN LÝ ĐÁNH GIÁ ---

exports.getReviewManagement = async (req, res) => {
    try {
        const reviews = await Book.getAllReviews();
        res.render('admin/review-list', { reviews });
    } catch (error) {
        res.status(500).send('Lỗi tải danh sách đánh giá');
    }
};

exports.postDeleteReview = async (req, res) => {
    try {
        await Book.deleteReview(req.params.id);
        res.redirect('/admin/reviews');
    } catch (error) {
        res.status(500).send('Lỗi khi xóa đánh giá');
    }
};