const User = require('../models/user.model');

// Hiển thị giao diện đăng nhập
exports.getLogin = (req, res) => {
    res.render('login');
};

// Hiển thị giao diện đăng ký
exports.getSignup = (req, res) => {
    res.render('signup');
};

// Xử lý đăng ký thành viên mới
exports.postSignup = async (req, res) => {
    const { username, password, email } = req.body;
    try {
        // 1. Kiểm tra định dạng dữ liệu (Email chuẩn, mật khẩu mạnh)
        const validation = User.validateData(email, password);
        if (!validation.valid) {
            return res.render('signup', { error: validation.message, data: req.body });
        }

        // 2. Kiểm tra trùng lặp Email
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.render('signup', { error: "Email này đã được đăng ký!", data: req.body });
        }
        
        // 3. Kiểm tra trùng lặp Tên đăng nhập
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.render('signup', { error: "Tên đăng nhập đã tồn tại!", data: req.body });
        }

        // 4. Tạo người dùng mới (Mặc định status là active trong Model)
        await User.create(username, password, email);
        res.redirect('/login');
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.render('signup', { error: "Lỗi hệ thống khi đăng ký", data: req.body });
    }
};

// Xử lý đăng nhập (CẬP NHẬT: Đăng nhập bằng Email)
exports.postLogin = async (req, res) => {
    const { email, password } = req.body; // Lấy email thay vì username
    try {
        // Kiểm tra đầu vào trống
        if (!email || !password) {
            return res.render('login', { 
                error: "Vui lòng nhập đầy đủ email và mật khẩu!", 
                email // Giữ lại email đã nhập
            });
        }

        // 1. Tìm người dùng theo Email thay vì Username
        const user = await User.findByEmail(email);
        
        // 2. Kiểm tra sự tồn tại của user và mật khẩu (So sánh text thuần)
        if (user && user.password === password) {
            
            // 3. Kiểm tra trạng thái tài khoản (Locked/Active)
            if (user.status === 'locked') {
                return res.render('login', { 
                    error: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!",
                    email 
                });
            }

            // 4. Nếu hợp lệ, lưu Session
            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status
            };

            req.session.save((err) => {
                if (err) return res.status(500).send("Lỗi hệ thống");

                let redirectUrl = '/';
                if (user.role === 'admin') {
                    redirectUrl = '/admin/dashboard';
                } else if (req.session.returnTo) {
                    redirectUrl = req.session.returnTo;
                    delete req.session.returnTo;
                }
                
                console.log(`[Login] Thành công: ${email}`);
                return res.redirect(redirectUrl);
            });

        } else {
            // Sai email hoặc mật khẩu
            return res.render('login', { 
                error: "Email hoặc mật khẩu không chính xác!", 
                email 
            });
        }
    } catch (error) {
        console.error("Lỗi xử lý đăng nhập:", error);
        res.status(500).send("Lỗi hệ thống");
    }
};

// Xử lý đăng xuất
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Lỗi khi hủy session:", err);
        }
        res.redirect('/');
    });
};