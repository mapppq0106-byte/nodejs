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

    // 4. Lấy thông tin chi tiết
    getById: async (id) => {
        const sql = `
            SELECT b.*, c.name as category_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id 
            WHERE b.id = ?`;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    // 5. Lấy reviews của sách
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

    // 7. Lấy toàn bộ đánh giá cho Admin
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

    // --- MỚI: Kiểm tra trùng tên sách (Ràng buộc yêu cầu) ---
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

    // 8. Lấy chương
    getChapters: async (bookId) => {
        const [rows] = await db.execute('SELECT * FROM chapters WHERE book_id = ? ORDER BY chapter_number ASC', [bookId]);
        return rows;
    },
    
    getChapterDetail: async (bookId, chapterNumber) => {
        const [rows] = await db.execute('SELECT * FROM chapters WHERE book_id = ? AND chapter_number = ?', [bookId, chapterNumber]);
        return rows[0];
    },

    // --- MỚI: Tăng lượt xem khi đọc sách ---
    incrementViewCount: async (id) => {
        return await db.execute('UPDATE books SET view_count = view_count + 1 WHERE id = ?', [id]);
    },

    checkUserReview: async (userId, bookId) => {
        const [rows] = await db.execute('SELECT * FROM reviews WHERE user_id = ? AND book_id = ?', [userId, bookId]);
        return rows.length > 0;
    },

    addReview: async (userId, bookId, rating, comment) => {
        const sql = 'INSERT INTO reviews (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)';
        return await db.execute(sql, [userId, bookId, rating, comment]);
    },

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

    getStatistics: async () => {
        // 1. Lấy Top 5 sách được xem nhiều nhất
        const [mostViewed] = await db.execute(`
            SELECT title, view_count 
            FROM books 
            ORDER BY view_count DESC 
            LIMIT 5`);

        // 2. Lấy Top 5 sách được đánh giá nhiều nhất (kèm số lượt đánh giá và sao trung bình)
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