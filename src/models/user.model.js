const db = require('../config/db');

const User = {
    // --- QUẢN LÝ TÀI KHOẢN (ĐĂNG KÝ/ĐĂNG NHẬP) ---

    // Cập nhật thông tin cơ bản và ảnh
    updateProfile: async (id, username, email, image_url) => {
        const sql = 'UPDATE users SET username = ?, email = ?, image_url = ? WHERE id = ?';
        return await db.execute(sql, [username, email, image_url, id]);
    },

    // Cập nhật mật khẩu mới
    updatePassword: async (id, newPassword) => {
        const sql = 'UPDATE users SET password = ? WHERE id = ?';
        return await db.execute(sql, [newPassword, id]);
    },

    // Gộp hàm create (đảm bảo status mặc định là active khi tạo mới)
    create: async (username, password, email) => {
        const sql = 'INSERT INTO users (username, password, email, role, status) VALUES (?, ?, ?, ?, ?)';
        return await db.execute(sql, [username, password, email, 'user', 'active']);
    },

    findByUsername: async (username) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    },

    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    // --- QUẢN LÝ NGƯỜI DÙNG (ADMIN) ---

    getReviewsByUserId: async (userId) => {
        const sql = `
            SELECT r.*, b.title as book_title, b.image_url as book_image
            FROM reviews r
            JOIN books b ON r.book_id = b.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC`;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    },

    getAll: async () => {
        // Lấy thêm cột status để hiển thị trên giao diện quản lý
        const [rows] = await db.execute('SELECT id, username, email, role, status FROM users');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    updateRole: async (id, newRole) => {
        return await db.execute('UPDATE users SET role = ? WHERE id = ?', [newRole, id]);
    },

    // HÀM MỚI: Cập nhật trạng thái (Khóa/Mở khóa)
    updateStatus: async (id, newStatus) => {
        return await db.execute('UPDATE users SET status = ? WHERE id = ?', [newStatus, id]);
    },

    delete: async (id) => {
        return await db.execute('DELETE FROM users WHERE id = ?', [id]);
    },

    // --- VALIDATION ---

    validateData: (email, password) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Regex: Ít nhất 8 ký tự, có chữ hoa, chữ thường và số (Cho phép ký tự đặc biệt)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!emailRegex.test(email)) {
            return { valid: false, message: "Định dạng email không hợp lệ." };
        }
        if (!passwordRegex.test(password)) {
            return { valid: false, message: "Mật khẩu phải từ 8 ký tự, bao gồm chữ hoa, chữ thường và số." };
        }
        return { valid: true };
    }
};

module.exports = User;