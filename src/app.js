require('dotenv').config(); // Nạp biến môi trường
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { engine } = require('express-handlebars');
const bookRoutes = require('./routes/book.route');
const authRoutes = require('./routes/auth.route'); // Route cho Login/Signup

const app = express();
const port = 3000;

// Cấu hình Middleware xử lý dữ liệu từ Form và JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 1. Cấu hình Handlebars làm View Engine
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'resources/views/layouts'),
    partialsDir: path.join(__dirname, 'resources/views/partials')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));

// 2. SỬA LỖI ẢNH: Phục vụ file tĩnh từ thư mục public bên trong src
// Khi bạn dùng <img src="/img/book1.jpg">, nó sẽ tìm tại: src/public/img/book1.jpg
app.use(express.static(path.join(__dirname, 'public')));

// 3. Đăng ký các Routes
app.use('/', bookRoutes); // Route cho trang chủ và sách
app.use('/', authRoutes); // Route cho đăng ký/đăng nhập

app.listen(port, () => {
  console.log(`Ứng dụng đang chạy tại http://localhost:${port}`);
});