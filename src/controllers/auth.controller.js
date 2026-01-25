const User = require('../models/user.model');

exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findByUsername(username);
        if (user && user.password === password) {
            // Lưu id, username và role vào session
            req.session.user = {
                id: user.id,
                username: user.username,
                role: user.role
            };
            res.redirect('/');
        } else {
            res.status(401).send("Sai tài khoản hoặc mật khẩu");
        }
    } catch (error) {
        res.status(500).send("Lỗi hệ thống");
    }
};

exports.logout = (req, res) => {
    req.session.destroy(); // Xóa session khi đăng xuất
    res.redirect('/');
};