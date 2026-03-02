const db = require('../config/db');

const Category = {
    // Lấy tất cả danh mục
    getAll: async () => {
        const [rows] = await db.execute('SELECT * FROM categories ORDER BY id DESC');
        return rows;
    },

    // Thêm danh mục mới
    create: async (name, description) => {
        return await db.execute(
            'INSERT INTO categories (name, description) VALUES (?, ?)',
            [name, description]
        );
    },

    // Kiểm tra trùng tên danh mục
    checkDuplicateName: async (name) => {
        const [rows] = await db.execute('SELECT * FROM categories WHERE name = ?', [name]);
        return rows.length > 0;
    },

    // HÀM MỚI BỔ SUNG: Đếm số lượng sách thuộc một danh mục
    // Mục đích: Kiểm tra xem danh mục có sách hay không trước khi xóa
    countBooksInCategory: async (categoryId) => {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM books WHERE category_id = ?',
            [categoryId]
        );
        return rows[0].count;
    },

    // Xóa danh mục
    delete: async (id) => {
        return await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    }
};

module.exports = Category;