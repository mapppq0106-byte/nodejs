const Book = require('../models/book.model');
const User = require('../models/user.model');
const Category = require('../models/category.model');
const fs = require('fs');
const path = require('path');

// Hàm tiện ích để gửi thông báo alert và quay lại trang trước
const showAlertAndBack = (res, message) => {
    return res.send(`<script>alert("${message}"); window.history.back();</script>`);
};

// Hàm xóa file vật lý dùng chung để dọn dẹp bộ nhớ/ảnh rác
const deleteFile = (filename) => {
    if (filename) {
        const filePath = path.join(__dirname, '../public/img', filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[Cleanup] Đã xóa file: ${filename}`);
        }
    }
};

// 1. Hiển thị danh sách quản lý sách cho admin (Dashboard)
exports.getDashboard = async (req, res) => {
    try {
        const books = await Book.getAll();
        res.render('admin/dashboard', { 
            books,
            user: req.session.user 
        });
    } catch (error) {
        console.error("Lỗi Dashboard Admin:", error);
        showAlertAndBack(res, 'Lỗi hệ thống: Không thể tải danh sách sách.');
    }
};

// 2. Hiển thị form thêm sách mới
exports.getAddBook = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.render('admin/add-book', { categories });
    } catch (error) {
        console.error("Lỗi getAddBook:", error);
        showAlertAndBack(res, 'Không thể lấy danh mục cho form thêm sách.');
    }
};

// 3. Xử lý thêm sách mới (CẬP NHẬT: Chống nhân bản ảnh rác)
exports.postAddBook = async (req, res) => {
    try {
        const { title, author, description, price, category_id } = req.body;
        const categories = await Category.getAll(); 
        
        // 1. Kiểm tra các trường bắt buộc
        if (!title || !author || !description || !category_id || !req.file) {
            if (req.file) deleteFile(req.file.filename); // Xóa ngay ảnh rác vừa upload
            return res.render('admin/add-book', {
                error: "Vui lòng điền đầy đủ thông tin và chọn ảnh bìa cho sách!",
                data: req.body,
                categories
            });
        }

        // 2. Kiểm tra ký tự không hợp lệ (không được chỉ chứa ký tự đặc biệt)
        const cleanPattern = /^[\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
        if (cleanPattern.test(title) || cleanPattern.test(author)) {
            deleteFile(req.file.filename);
            return res.render('admin/add-book', {
                error: "Tên sách hoặc tác giả không hợp lệ!",
                data: req.body,
                categories
            });
        }

        // 3. Kiểm tra trùng tên sách
        const isDuplicate = await Book.checkDuplicateTitle(title);
        if (isDuplicate) {
            deleteFile(req.file.filename);
            return res.render('admin/add-book', {
                error: "Lỗi: Tên sách này đã tồn tại trong hệ thống!",
                data: req.body,
                categories
            });
        }

        const image_url = req.file.filename;
        await Book.create({ 
            title, 
            author, 
            description, 
            image_url, 
            price: price || 0, 
            category_id: category_id 
        });

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error("Lỗi thêm sách:", error);
        if (req.file) deleteFile(req.file.filename);
        const categories = await Category.getAll();
        res.render('admin/add-book', { 
            error: "Lỗi hệ thống khi thêm sách. Vui lòng thử lại.",
            data: req.body,
            categories 
        });
    }
};

// 4. Hiển thị form chỉnh sửa sách
exports.getEditBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const book = await Book.getById(bookId);
        const categories = await Category.getAll();

        if (!book) return showAlertAndBack(res, 'Không tìm thấy sách yêu cầu.');
        
        res.render('admin/edit-book', { book, categories });
    } catch (error) {
        console.error("Lỗi getEditBook:", error);
        showAlertAndBack(res, 'Lỗi hệ thống khi tải thông tin chỉnh sửa.');
    }
};

// 5. Xử lý cập nhật thông tin sách (CẬP NHẬT: Thay thế ảnh cũ, tránh nhân bản)
exports.postEditBook = async (req, res) => {
    const bookId = req.params.id;
    try {
        const { title, author, description, price, category_id } = req.body;
        const categories = await Category.getAll();
        const oldBook = await Book.getById(bookId);

        if (!oldBook) {
            if (req.file) deleteFile(req.file.filename);
            return showAlertAndBack(res, 'Sách không tồn tại.');
        }

        // 1. Kiểm tra các trường bắt buộc
        if (!title || !author || !description || !category_id) {
            if (req.file) deleteFile(req.file.filename);
            return res.render('admin/edit-book', {
                error: "Vui lòng điền đầy đủ các thông tin bắt buộc (*)",
                book: { ...req.body, id: bookId, image_url: oldBook.image_url },
                categories
            });
        }

        // 2. Kiểm tra ký tự không hợp lệ
        const cleanPattern = /^[\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
        if (cleanPattern.test(title) || cleanPattern.test(author)) {
            if (req.file) deleteFile(req.file.filename);
            return res.render('admin/edit-book', {
                error: "Tiêu đề hoặc Tác giả không hợp lệ!",
                book: { ...req.body, id: bookId, image_url: oldBook.image_url },
                categories
            });
        }

        // 3. Kiểm tra trùng tên sách (Loại trừ ID hiện tại)
        const isDuplicate = await Book.checkDuplicateTitle(title, bookId);
        if (isDuplicate) {
            if (req.file) deleteFile(req.file.filename);
            return res.render('admin/edit-book', {
                error: "Tên sách này đã tồn tại ở một cuốn sách khác!",
                book: { ...req.body, id: bookId, image_url: oldBook.image_url },
                categories
            });
        }

        // 4. Xử lý ảnh: Xóa ảnh cũ nếu upload ảnh mới thành công
        let image_url = oldBook.image_url;
        if (req.file) {
            image_url = req.file.filename;
            // Xóa ảnh cũ khỏi server (trừ ảnh mặc định)
            if (oldBook.image_url && oldBook.image_url !== 'default-book.jpg') {
                deleteFile(oldBook.image_url);
            }
        }

        await Book.update(bookId, { 
            title, author, description, image_url, 
            price: price || 0, category_id: category_id 
        });

        console.log(`[Admin] Cập nhật thành công sách ID: ${bookId}`);
        res.redirect('/admin/dashboard');

    } catch (error) {
        console.error("Lỗi cập nhật sách:", error);
        if (req.file) deleteFile(req.file.filename);
        const categories = await Category.getAll();
        const book = await Book.getById(bookId);
        res.render('admin/edit-book', { 
            error: "Lỗi hệ thống khi cập nhật thông tin.",
            book,
            categories 
        });
    }
};

// 6. Xử lý xóa sách (CẬP NHẬT: Xóa ảnh vật lý khi xóa sách)
exports.postDeleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const book = await Book.getById(bookId);
        
        // Xóa ảnh vật lý để tránh rác server
        if (book && book.image_url && book.image_url !== 'default-book.jpg') {
            deleteFile(book.image_url);
        }

        await Book.delete(bookId);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error("Lỗi xóa sách:", error);
        showAlertAndBack(res, 'Lỗi khi xóa sách.');
    }
};

// 7. Lấy thống kê
exports.getStatistics = async (req, res) => {
    try {
        const stats = await Book.getStatistics();
        res.render('admin/statistics', { stats });
    } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
        res.status(500).send('Lỗi tải dữ liệu thống kê');
    }
};

// --- QUẢN LÝ NGƯỜI DÙNG ---

// 8. Hiển thị danh sách người dùng
exports.getUserManagement = async (req, res) => {
    try {
        const users = await User.getAll();
        res.render('admin/user-list', { users });
    } catch (error) {
        console.error("Lỗi lấy danh sách user:", error);
        showAlertAndBack(res, 'Lỗi: Không thể tải danh sách người dùng.');
    }
};

// 9. Xử lý Khóa/Mở khóa người dùng
exports.postToggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.getById(userId);

        if (!user) return showAlertAndBack(res, 'Người dùng này không tồn tại.');

        if (user.role === 'admin') {
            return showAlertAndBack(res, 'Hành động bị từ chối: Không thể khóa tài khoản Admin!');
        }

        const newStatus = (user.status === 'locked') ? 'active' : 'locked';
        await User.updateStatus(userId, newStatus);
        
        res.redirect('/admin/users');
    } catch (error) {
        console.error("Lỗi thay đổi trạng thái user:", error);
        showAlertAndBack(res, 'Lỗi hệ thống khi thực hiện thao tác.');
    }
};

// 10. Xử lý xóa người dùng
exports.postDeleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.getById(userId);

        if (!user) return showAlertAndBack(res, 'Người dùng này không tồn tại.');
        if (user.role === 'admin') {
            return showAlertAndBack(res, 'Hành động bị từ chối: Không thể xóa tài khoản Admin!');
        }

        await User.delete(userId);
        res.redirect('/admin/users');
    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        showAlertAndBack(res, 'Lỗi hệ thống khi xóa người dùng.');
    }
};

// --- QUẢN LÝ ĐÁNH GIÁ ---

// 11. Chỉ hiển thị danh sách đánh giá
exports.getReviewManagement = async (req, res) => {
    try {
        const reviews = await Book.getAllReviews(); 
        res.render('admin/review-list', { reviews });
    } catch (error) {
        console.error("Lỗi lấy danh sách đánh giá:", error);
        showAlertAndBack(res, 'Lỗi: Không thể tải danh sách đánh giá.');    
    }
};

// 12. Xử lý Ẩn danh / Hiện tên đánh giá
exports.postToggleReviewAnonymous = async (req, res) => {
    try {
        const reviewId = req.params.id;
        await Book.toggleReviewAnonymous(reviewId);
        res.redirect('/admin/reviews');
    } catch (error) {
        console.error("Lỗi xử lý ẩn danh đánh giá:", error);
        showAlertAndBack(res, 'Lỗi hệ thống: Không thể thực hiện thao tác ẩn danh.');
    }
};

// 13. Xử lý xóa đánh giá
exports.postDeleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        await Book.deleteReview(reviewId);
        res.redirect('/admin/reviews');
    } catch (error) {
        console.error("Lỗi xóa đánh giá:", error);
        showAlertAndBack(res, 'Lỗi: Không thể xóa đánh giá này.');
    }
}; 