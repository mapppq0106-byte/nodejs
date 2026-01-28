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

// 3. Xử lý thêm sách mới
exports.postAddBook = async (req, res) => {
    try {
        const { title, author, description, price, isbn, category_id } = req.body;
        const image_url = req.file ? req.file.filename : 'default-book.jpg';
        
        // Đảm bảo dữ liệu không bị lỗi khi người dùng không chọn danh mục
        await Book.create({ 
            title, 
            author, 
            description, 
            image_url, 
            price, 
            isbn: isbn || null, 
            category_id: category_id || null 
        });
        res.redirect('/admin');
    } catch (error) {
        console.error("Lỗi thêm sách:", error);
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

// 5. Xử lý cập nhật thông tin sách
exports.postEditBook = async (req, res) => {
    try {
        const { title, author, description, price, isbn, category_id } = req.body;
        const bookId = req.params.id;
        
        const oldBook = await Book.getById(bookId);
        const image_url = req.file ? req.file.filename : oldBook.image_url;

        await Book.update(bookId, { 
            title, 
            author, 
            description, 
            image_url, 
            price, 
            isbn: isbn || null, 
            category_id: category_id || null 
        });
        res.redirect('/admin');
    } catch (error) {
        console.error("Lỗi cập nhật:", error);
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


exports.postDeleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // 1. Lấy thông tin người dùng để kiểm tra role trước khi xóa
        const user = await User.getById(userId);

        if (!user) {
            return res.status(404).send('Người dùng không tồn tại');
        }

        // 2. Kiểm tra nếu là tài khoản admin thì không cho phép xóa
        if (user.role === 'admin') {
            return res.status(403).send('Không thể xóa tài khoản quản trị hệ thống (Admin)!');
        }

        // 3. Nếu là user bình thường thì tiến hành xóa
        await User.delete(userId);
        res.redirect('/admin/users');
        
    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        res.status(500).send('Lỗi hệ thống khi xóa người dùng');
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