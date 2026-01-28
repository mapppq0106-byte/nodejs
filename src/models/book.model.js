const db = require('../config/db');

const Book = {
    // 1. Lấy toàn bộ danh sách sách (Đã JOIN lấy tên danh mục)
    getAll: async () => {
        const sql = `
            SELECT b.*, c.name as category_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id
            ORDER BY b.id DESC`;
        const [rows] = await db.execute(sql);
        return rows;
    },

    // 2. Tìm kiếm sách
    search: async (keyword) => {
        const sql = `
            SELECT b.*, c.name as category_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?`;
        const searchTerm = `%${keyword}%`;
        const [rows] = await db.execute(sql, [searchTerm, searchTerm, searchTerm]);
        return rows;
    },

    // 3. Lấy thông tin chi tiết (Đã JOIN lấy tên danh mục)
    getById: async (id) => {
        const sql = `
            SELECT b.*, c.name as category_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id 
            WHERE b.id = ?`;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    // 4. Lấy reviews của sách
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

    // 5. Lấy thông tin cho API
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

    // 6. Lấy toàn bộ đánh giá cho Admin
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

    checkUserReview: async (userId, bookId) => {
        const [rows] = await db.execute('SELECT * FROM reviews WHERE user_id = ? AND book_id = ?', [userId, bookId]);
        return rows.length > 0;
    },

    addReview: async (userId, bookId, rating, comment) => {
        const sql = 'INSERT INTO reviews (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)';
        return await db.execute(sql, [userId, bookId, rating, comment]);
    },

    // 7. SỬA LỖI: Thêm sách mới (Bắt buộc phải có thêm 1 dấu ? cho category_id)
    create: async (data) => {
        const { title, author, description, image_url, price, isbn, category_id } = data;
        const sql = 'INSERT INTO books (title, author, description, image_url, price, isbn, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
        return await db.execute(sql, [
            title, 
            author, 
            description, 
            image_url, 
            price, 
            isbn || null, 
            category_id || null // Cần truyền giá trị này xuống DB
        ]);
    },

    // 8. SỬA LỖI: Cập nhật thông tin sách (Phải update cả category_id)
    update: async (id, data) => {
        const { title, author, description, image_url, price, isbn, category_id } = data;
        const sql = `
            UPDATE books 
            SET title = ?, author = ?, description = ?, image_url = ?, price = ?, isbn = ?, category_id = ? 
            WHERE id = ?`;
        return await db.execute(sql, [
            title, 
            author, 
            description, 
            image_url, 
            price, 
            isbn, 
            category_id || null, // Cập nhật danh mục mới
            id
        ]);
    },

    delete: async (id) => {
        const sql = 'DELETE FROM books WHERE id = ?';
        return await db.execute(sql, [id]);
    },
    
    deleteReview: async (reviewId) => {
        return await db.execute('DELETE FROM reviews WHERE id = ?', [reviewId]);
    }
};

module.exports = Book;