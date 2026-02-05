require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session'); // Bắt buộc để thực hiện phân quyền
const { engine } = require('express-handlebars');

// Import các Routes - Đã sửa lỗi đường dẫn chính xác (bỏ 'src/' vì app.js nằm trong src)
const bookRoutes = require('./routes/book.route');
const authRoutes = require('./routes/auth.route');
const adminRoutes = require('./routes/admin.route');

const app = express();
const port = 3000;

// 1. Cấu hình Session để lưu giữ trạng thái đăng nhập và quyền hạn (Role)
app.use(session({
    secret: 'secret-key-book-store',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Đặt true nếu dùng HTTPS
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 2. Cấu hình Handlebars kèm Helper 'eq' để so sánh (dùng trong phân quyền giao diện)
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'resources/views/layouts'),
    partialsDir: path.join(__dirname, 'resources/views/partials'),
    helpers: {
        eq: (a, b) => a === b // Helper kiểm tra: {{#if (eq user.role 'admin')}}
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));

// 3. Cấu hình thư mục tĩnh cho CSS, JS và Hình ảnh
app.use(express.static(path.join(__dirname, 'public')));

// 4. Middleware toàn cục: Truyền thông tin user vào res.locals
// Giúp file header.hbs và các view khác luôn nhận được dữ liệu user mà không cần truyền thủ công
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// 5. Khai báo sử dụng các Route
app.use('/', bookRoutes);
app.use('/', authRoutes);
app.use('/', adminRoutes);

// 6. Khởi chạy server
app.listen(port, () => {
    console.log(`Ứng dụng đang chạy thành công tại http://localhost:${port}`);
});