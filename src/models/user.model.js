const db = require('../config/db');

const User = {
    // Tạo người dùng mới (đã gộp các phiên bản trùng lặp)
    create: async (username, password, email) => {
        const sql = 'INSERT INTO users (username, password, email, role, is_locked) VALUES (?, ?, ?, ?, ?)';
        return await db.execute(sql, [username, password, email, 'user', 0]);
    },

    findByUsername: async (username) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    },

    // --- QUẢN LÝ NGƯỜI DÙNG ---

    // Lấy danh sách: Cần lấy thêm trường is_locked để hiển thị ngoài giao diện
    getAll: async () => {
        const [rows] = await db.execute('SELECT id, username, email, role, is_locked FROM users');
        return rows;
    },

    updateRole: async (id, newRole) => {
        return await db.execute('UPDATE users SET role = ? WHERE id = ?', [newRole, id]);
    },

    // HÀM MỚI: Cập nhật trạng thái khóa thay cho hàm delete cũ
    updateLockStatus: async (id, isLocked) => {
        return await db.execute('UPDATE users SET is_locked = ? WHERE id = ?', [isLocked, id]);
    },

    getById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    // Kiểm tra email đã tồn tại chưa
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    // Hàm kiểm tra định dạng email và độ mạnh mật khẩu
    validateData: (email, password) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

        if (!emailRegex.test(email)) {
            return { valid: false, message: "Định dạng email không hợp lệ (ví dụ: user@gmail.com)." };
        }
        if (!passwordRegex.test(password)) {
            return { valid: false, message: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số." };
        }
        return { valid: true };
    }
};

module.exports = User;