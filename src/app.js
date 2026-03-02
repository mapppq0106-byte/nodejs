require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { engine } = require('express-handlebars');

// Import Models
const Category = require('./models/category.model');

// Import các Routes
const bookRoutes = require('./routes/book.route');
const authRoutes = require('./routes/auth.route');
const adminRoutes = require('./routes/admin.route');
const userRoutes = require('./routes/user.route'); // <-- THÊM DÒNG NÀY

const app = express();
const port = 3000;

// 1. Cấu hình Session
app.use(session({
    secret: 'secret-key-book-store',
    resave: true,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// 2. Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 3. Handlebars Engine
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'resources/views/layouts'),
    partialsDir: path.join(__dirname, 'resources/views/partials'),
    helpers: {
        eq: (a, b) => String(a) === String(b),
        formatDate: (date) => {
            if (!date) return "";
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));

// 4. Static Files
app.use(express.static(path.join(__dirname, 'public')));

// 5. Middleware toàn cục
app.use(async (req, res, next) => {
    try {
        res.locals.user = req.session.user || null;
        res.locals.allCategories = await Category.getAll();
        next();
    } catch (error) {
        console.error("Lỗi Middleware app.js:", error);
        next();
    }
});

// 6. Quản lý Route
app.use('/', authRoutes);
app.use('/', userRoutes);  // <-- THÊM DÒNG NÀY (Đã có isLoggedIn bảo vệ)
app.use('/', adminRoutes);
app.use('/', bookRoutes);

// 7. Xử lý lỗi 404
app.use((req, res) => {
    res.status(404).render('home', { error: 'Trang bạn tìm không tồn tại!' });
});

app.listen(port, () => {
    console.log(`Ứng dụng đang chạy thành công tại http://localhost:${port}`);
});