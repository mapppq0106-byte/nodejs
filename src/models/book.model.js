const db = require('../config/db');

const Book = {
    // Lấy toàn bộ danh sách sách
    getAll: async () => {
        const [rows] = await db.execute('SELECT * FROM books');
        return rows;
    },

    // Tìm kiếm sách theo tiêu đề, tác giả hoặc ISBN
    search: async (keyword) => {
        const sql = `SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?`;
        const searchTerm = `%${keyword}%`;
        const [rows] = await db.execute(sql, [searchTerm, searchTerm, searchTerm]);
        return rows;
    },

    // Lấy thông tin chi tiết của một cuốn sách theo ID
    getById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM books WHERE id = ?', [id]);
        return rows[0];
    },

    // Đảm bảo hàm lấy review vẫn hoạt động tốt
    getReviews: async (bookId) => {
        const sql = `
            SELECT r.*, u.username 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.book_id = ? 
            ORDER BY r.created_at DESC`;
        const [rows] = await db.execute(sql, [bookId]);
        return rows;
    },

    // MỚI: Lấy thông tin sách theo ISBN kèm điểm trung bình cho API
    getByIsbn: async (isbn) => {
        const sql = `
            SELECT b.*, 
                   IFNULL(AVG(r.rating), 0) as average_score,
                   COUNT(r.id) as review_count
            FROM books b
            LEFT JOIN reviews r ON b.id = r.book_id
            WHERE b.isbn = ?
            GROUP BY b.id`;
        const [rows] = await db.execute(sql, [isbn]);
        return rows[0];
    },

    // MỚI: Lấy toàn bộ đánh giá cho trang quản trị (Admin)
    getAllReviews: async () => {
        const sql = `
            SELECT r.*, u.username, b.title as book_title 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            JOIN books b ON r.book_id = b.id 
            ORDER BY r.created_at DESC`;
        const [rows] = await db.execute(sql);
        return rows;
    },

    // Kiểm tra xem người dùng đã thực hiện đánh giá sách này chưa
    checkUserReview: async (userId, bookId) => {
        const [rows] = await db.execute('SELECT * FROM reviews WHERE user_id = ? AND book_id = ?', [userId, bookId]);
        return rows.length > 0;
    },

    // Thêm đánh giá mới từ người dùng
    addReview: async (userId, bookId, rating, comment) => {
        const sql = 'INSERT INTO reviews (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)';
        return await db.execute(sql, [userId, bookId, rating, comment]);
    },

    // Chức năng Admin: Thêm sách mới
    create: async (data) => {
        const { title, author, description, image_url, price, isbn } = data;
        const sql = 'INSERT INTO books (title, author, description, image_url, price, isbn) VALUES (?, ?, ?, ?, ?, ?)';
        return await db.execute(sql, [title, author, description, image_url, price, isbn || null]);
    },

    // Chức năng Admin: Cập nhật thông tin sách
    update: async (id, data) => {
        const { title, author, description, image_url, price, isbn } = data;
        const sql = `
            UPDATE books 
            SET title = ?, author = ?, description = ?, image_url = ?, price = ?, isbn = ? 
            WHERE id = ?`;
        return await db.execute(sql, [title, author, description, image_url, price, isbn, id]);
    },

    // Chức năng Admin: Xóa sách
    delete: async (id) => {
        const sql = 'DELETE FROM books WHERE id = ?';
        return await db.execute(sql, [id]);
    },
    
    // MỚI: Xóa một bài đánh giá cụ thể
    deleteReview: async (reviewId) => {
        return await db.execute('DELETE FROM reviews WHERE id = ?', [reviewId]);
    }

};

module.exports = Book;