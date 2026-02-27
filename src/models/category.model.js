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

    // Hàm mới: Kiểm tra trùng tên
    checkDuplicateName: async (name) => {
        const [rows] = await db.execute('SELECT * FROM categories WHERE name = ?', [name]);
        return rows.length > 0;
    },

    // Xóa danh mục
    delete: async (id) => {
        return await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    }
};

module.exports = Category;