const User = require('../models/user.model');

// Hiển thị giao diện đăng nhập và đăng ký
exports.getLogin = (req, res) => res.render('login');
exports.getSignup = (req, res) => res.render('signup');

// Xử lý đăng ký thành viên mới
exports.postSignup = async (req, res) => {
    const { username, password, email } = req.body;
    try {
        // 1. Kiểm tra định dạng email và mật khẩu
        const validation = User.validateData(email, password);
        if (!validation.valid) {
            return res.render('signup', { error: validation.message, data: req.body });
        }

        // 2. Kiểm tra email đã được sử dụng chưa
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.render('signup', { error: "Email này đã được đăng ký!", data: req.body });
        }

        // 3. Kiểm tra username đã tồn tại chưa
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.render('signup', { error: "Tên đăng nhập đã tồn tại!", data: req.body });
        }

        await User.create(username, password, email);
        res.redirect('/login');
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.render('signup', { error: "Lỗi hệ thống khi đăng ký", data: req.body });
    }
};

// Xử lý đăng nhập
exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findByUsername(username);
        
        if (user && user.password === password) {
            // Lưu thông tin vào session
            req.session.user = {
                id: user.id,
                username: user.username,
                role: user.role
            };

            // Lấy đường dẫn cũ đã lưu, nếu không có thì về trang chủ '/'
            const redirectUrl = req.session.returnTo || '/';
            
            // Xóa biến tạm returnTo sau khi đã dùng xong
            delete req.session.returnTo;

            console.log(`Đăng nhập thành công! Chuyển hướng về: ${redirectUrl}`);
            res.redirect(redirectUrl);
        } else {
            res.status(401).send("Sai tài khoản hoặc mật khẩu");
        }
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).send("Lỗi hệ thống");
    }
};

// Xử lý đăng xuất
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Lỗi khi hủy session:", err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/'); 
    });
};