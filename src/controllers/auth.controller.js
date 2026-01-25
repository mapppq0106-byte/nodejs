const User = require('../models/user.model');

exports.getLogin = (req, res) => res.render('login');
exports.getSignup = (req, res) => res.render('signup');

exports.postSignup = async (req, res) => {
    const { username, password, email } = req.body;
    try {
        await User.create(username, password, email);
        res.redirect('/login');
    } catch (error) {
        res.status(500).send("Lỗi đăng ký");
    }
};

exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findByUsername(username);
        if (user && user.password === password) {
            res.redirect('/');
        } else {
            res.status(401).send("Sai tài khoản hoặc mật khẩu");
        }
    } catch (error) {
        res.status(500).send("Lỗi hệ thống");
    }
};