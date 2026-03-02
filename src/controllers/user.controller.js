const User = require('../models/user.model');
const Book = require('../models/book.model'); // Cần import để lấy dữ liệu đánh giá

// 1. Hiển thị trang hồ sơ người dùng kèm lịch sử đánh giá
exports.getProfile = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const userId = req.session.user.id;
        const user = await User.getById(userId);

        if (!user) {
            return res.status(404).send("Người dùng không tồn tại");
        }

        // SỬA TẠI ĐÂY: Đổi Book thành User
        const reviews = await User.getReviewsByUserId(userId); 

        res.render('user/profile', { 
            user, 
            reviews, 
            success: req.query.success, 
            error: req.query.error 
        });
    } catch (error) {
        console.error("Lỗi getProfile:", error);
        res.status(500).send("Lỗi hệ thống khi tải hồ sơ");
    }
};

// 2. Xử lý đổi mật khẩu người dùng
exports.postChangePassword = async (req, res) => {
    // KIỂM TRA AN TOÀN: Tránh lỗi khi gọi .id của undefined nếu session hết hạn
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.user.id;

    try {
        const user = await User.getById(userId)
        const reviews = await User.getReviewsByUserId(userId); // Lấy lại reviews để render lại trang nếu lỗi

        // 1. Kiểm tra mật khẩu hiện tại
        if (user.password !== currentPassword) {
            return res.render('user/profile', { 
                user, 
                reviews,
                error: "Mật khẩu hiện tại không chính xác!" 
            });
        }

        // 2. Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp không
        if (newPassword !== confirmPassword) {
            return res.render('user/profile', { 
                user, 
                reviews,
                error: "Mật khẩu xác nhận không khớp!" 
            });
        }

        // 3. Thực hiện cập nhật mật khẩu mới vào database
        await User.updatePassword(userId, newPassword);
        
        // 4. Render lại trang với thông báo thành công
        res.render('user/profile', { 
            user, 
            reviews,
            success: "Đổi mật khẩu thành công!" 
        });
    } catch (error) {
        console.error("Lỗi postChangePassword:", error);
        const user = await User.getById(userId);
        res.render('user/profile', { 
            user, 
            error: "Lỗi hệ thống khi đổi mật khẩu" 
        });
    }
};