const db = require('../config/db');

const Book = {
    getAll: async () => {
        const [rows] = await db.execute('SELECT * FROM books');
        return rows;
    },
    search: async (keyword) => {
        const sql = `SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?`;
        const searchTerm = `%${keyword}%`; 
        const [rows] = await db.execute(sql, [searchTerm, searchTerm, searchTerm]);
        return rows;
    },
    getById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM books WHERE id = ?', [id]);
        return rows[0];
    },
    getReviews: async (bookId) => {
        const sql = `SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.book_id = ? ORDER BY r.created_at DESC`;
        const [rows] = await db.execute(sql, [bookId]);
        return rows;
    }
};
module.exports = Book;