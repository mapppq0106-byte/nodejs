require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { engine } = require('express-handlebars');

// SỬA LỖI ĐƯỜNG DẪN Ở ĐÂY
const bookRoutes = require('./routes/book.route');
const authRoutes = require('./routes/auth.route');
const adminRoutes = require('./routes/admin.route');

const app = express();

app.use(session({
    secret: 'secret-key-book-store',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'resources/views/layouts'),
    partialsDir: path.join(__dirname, 'resources/views/partials'),
    helpers: {
        eq: (a, b) => a === b 
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.use('/', bookRoutes);
app.use('/', authRoutes);
app.use('/', adminRoutes);

app.listen(3000, () => {
  console.log(`Ứng dụng đang chạy tại http://localhost:3000`);
});