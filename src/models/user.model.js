const db = require('../config/db');

const User = {
    // Tạo tài khoản mới (hỗ trợ lưu email)
    create: async (username, password, email) => {
        return await db.execute(
            'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
            [username, password, email, 'user'] // Mặc định là 'user'
        );
    },

    // Tìm kiếm người dùng theo username để đăng nhập
    findByUsername: async (username) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }
};

module.exports = User;