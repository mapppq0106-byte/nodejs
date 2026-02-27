const db = require('../config/db');

const User = {
    // --- CHỨC NĂNG CŨ: GIỮ NGUYÊN ---
    create: async (username, password, email) => {
        return await db.execute(
            'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
            [username, password, email, 'user']
        );
    },

    findByUsername: async (username) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    },

    // --- CHỨC NĂNG MỚI: QUẢN LÝ NGƯỜI DÙNG ---
    getAll: async () => {
        const [rows] = await db.execute('SELECT id, username, email, role FROM users');
        return rows;
    },

    updateRole: async (id, newRole) => {
        return await db.execute('UPDATE users SET role = ? WHERE id = ?', [newRole, id]);
    },

    delete: async (id) => {
        return await db.execute('DELETE FROM users WHERE id = ?', [id]);
    },

    getById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
    },

    // Hàm kiểm tra định dạng email và độ mạnh mật khẩu
    validateData: (email, password) => {
        // Regex kiểm tra email chuẩn
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Regex mật khẩu: Ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

        if (!emailRegex.test(email)) {
            return { valid: false, message: "Định dạng email không hợp lệ (ví dụ: user@gmail.com)." };
        }
        if (!passwordRegex.test(password)) {
            return { valid: false, message: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số." };
        }
        return { valid: true };
    },

    create: async (username, password, email) => {
        const sql = 'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)';
        return await db.execute(sql, [username, password, email, 'user']);
    },
    
    // Kiểm tra email đã tồn tại chưa
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }   
};

module.exports = User;