const db = require('../config/db');

const Book = {
    // 1. Lấy toàn bộ danh sách sách
    getAll: async () => {
        const sql = `
            SELECT b.*, c.name as category_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id
            ORDER BY b.id DESC`;
        const [rows] = await db.execute(sql);
        return rows;
    },

    // 2. Hàm tìm kiếm và lọc theo danh mục
    searchBooks: async (keyword, categoryId) => {
        let sql = `
            SELECT b.*, c.name as category_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE 1=1`;
        const params = [];

        if (keyword) {
            sql += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)`;
            const searchTerm = `%${keyword}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (categoryId) {
            sql += ` AND b.category_id = ?`;
            params.push(categoryId);
        }

        sql += ` ORDER BY b.id DESC`;
        const [rows] = await db.execute(sql, params);
        return rows;
    },

    // 3. Tìm kiếm cũ
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

    // 4. Lấy thông tin chi tiết sách
    getById: async (id) => {
        const sql = `
            SELECT b.*, c.name as category_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id 
            WHERE b.id = ?`;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    // 5. CẬP NHẬT: Lấy reviews của sách (Xử lý hiển thị ẩn danh cho người dùng)
    getReviews: async (bookId) => {
        const sql = `
            SELECT r.*, 
            CASE 
                WHEN r.is_anonymous = 1 THEN 'Người dùng ẩn danh' 
                ELSE u.username 
            END as username
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.book_id = ? 
            ORDER BY r.created_at DESC`;
        const [rows] = await db.execute(sql, [bookId]);
        return rows;
    },

    // 6. Lấy thông tin cho API
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

    // 7. CẬP NHẬT: Lấy toàn bộ đánh giá cho Admin (Xử lý logic Ẩn danh thống nhất)
    getAllReviews: async () => {
        const sql = `
            SELECT r.*, b.title as book_title,
            CASE 
                WHEN r.is_anonymous = 1 THEN 'Người dùng ẩn danh' 
                ELSE u.username 
            END as username
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            JOIN books b ON r.book_id = b.id 
            ORDER BY r.created_at DESC`;
        const [rows] = await db.execute(sql);
        return rows;
    },

    // --- Chức năng Admin: Đảo trạng thái Ẩn danh/Hiện tên ---
    toggleReviewAnonymous: async (reviewId) => {
        const sql = `UPDATE reviews SET is_anonymous = NOT is_anonymous WHERE id = ?`;
        return await db.execute(sql, [reviewId]);
    },

    // --- KIỂM TRA TRÙNG TÊN SÁCH ---
    checkDuplicateTitle: async (title, excludeId = null) => {
        let sql = 'SELECT * FROM books WHERE title = ?';
        const params = [title];

        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }

        const [rows] = await db.execute(sql, params);
        return rows.length > 0;
    },

    // 8. Quản lý chương sách
    getChapters: async (bookId) => {
        const [rows] = await db.execute('SELECT * FROM chapters WHERE book_id = ? ORDER BY chapter_number ASC', [bookId]);
        return rows;
    },
    
    getChapterDetail: async (bookId, chapterNumber) => {
        const [rows] = await db.execute('SELECT * FROM chapters WHERE book_id = ? AND chapter_number = ?', [bookId, chapterNumber]);
        return rows[0];
    },

    // --- TĂNG LƯỢT XEM ---
    incrementViewCount: async (id) => {
        return await db.execute('UPDATE books SET view_count = view_count + 1 WHERE id = ?', [id]);
    },

    // --- QUẢN LÝ ĐÁNH GIÁ (USER) ---
    checkUserReview: async (userId, bookId) => {
        const [rows] = await db.execute('SELECT * FROM reviews WHERE user_id = ? AND book_id = ?', [userId, bookId]);
        return rows.length > 0;
    },

    // CẬP NHẬT: Thêm tham số isAnonymous
    addReview: async (userId, bookId, rating, comment, isAnonymous) => {
        const sql = 'INSERT INTO reviews (user_id, book_id, rating, comment, is_anonymous) VALUES (?, ?, ?, ?, ?)';
        return await db.execute(sql, [userId, bookId, rating, comment, isAnonymous ? 1 : 0]);
    },

    // --- QUẢN LÝ SÁCH (ADMIN) ---
    create: async (data) => {
        const { title, author, description, image_url, price, isbn, category_id } = data;
        const sql = 'INSERT INTO books (title, author, description, image_url, price, isbn, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
        return await db.execute(sql, [title, author, description, image_url, price, isbn || null, category_id || null]);
    },

    update: async (id, data) => {
        const { title, author, description, image_url, price, isbn, category_id } = data;
        const sql = `
            UPDATE books 
            SET title = ?, author = ?, description = ?, image_url = ?, price = ?, isbn = ?, category_id = ? 
            WHERE id = ?`;
        return await db.execute(sql, [title, author, description, image_url, price, isbn, category_id || null, id]);
    },

    delete: async (id) => {
        return await db.execute('DELETE FROM books WHERE id = ?', [id]);
    },
    
    deleteReview: async (reviewId) => {
        return await db.execute('DELETE FROM reviews WHERE id = ?', [reviewId]);
    },

    // --- THỐNG KÊ ---
    getStatistics: async () => {
        const [mostViewed] = await db.execute(`
            SELECT title, view_count 
            FROM books 
            ORDER BY view_count DESC 
            LIMIT 5`);

        const [mostReviewed] = await db.execute(`
            SELECT 
                b.title, 
                COUNT(r.id) as total_reviews, 
                IFNULL(AVG(r.rating), 0) as avg_rating 
            FROM books b 
            JOIN reviews r ON b.id = r.book_id 
            GROUP BY b.id 
            ORDER BY total_reviews DESC 
            LIMIT 5`);

        return { mostViewed, mostReviewed };
    }
};

module.exports = Book;