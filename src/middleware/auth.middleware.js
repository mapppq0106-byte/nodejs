exports.isAdmin = (req, res, next) => {
    // Kiểm tra xem user đã đăng nhập và có role là admin không
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Truy cập bị từ chối: Bạn không có quyền quản trị!');
    }
};