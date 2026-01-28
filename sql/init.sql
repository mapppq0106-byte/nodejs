-- 1. Tạo cơ sở dữ liệu và sử dụng
CREATE DATABASE IF NOT EXISTS book_store;
USE book_store;

-- 2. Tạo bảng Danh mục (Phải tạo trước vì bảng Books tham chiếu tới nó)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- 3. Tạo bảng Người dùng
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' -- 'user' hoặc 'admin'
);

-- 4. Tạo bảng Sách (Đã có category_id và liên kết FK)
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    price DECIMAL(10, 2),
    isbn VARCHAR(50) UNIQUE,
    published_date DATE DEFAULT (CURRENT_DATE),
    view_count INT DEFAULT 0,
    category_id INT,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 5. Tạo bảng Đánh giá (Liên kết với Users và Books)
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_review (user_id, book_id) 
);

-- ==========================================
-- DỮ LIỆU MẪU (Dữ liệu khởi tạo hệ thống)
-- ==========================================

-- Thêm Danh mục
INSERT IGNORE INTO categories (id, name, description) VALUES 
(1, 'Lập trình', 'Các sách về phát triển phần mềm, ngôn ngữ lập trình và công nghệ.'),
(2, 'Cơ sở dữ liệu', 'Kiến thức về thiết kế, quản trị và tối ưu hóa hệ quản trị CSDL.'),
(3, 'Kỹ năng mềm', 'Phát triển bản thân, giao tiếp và quản lý thời gian.'),
(4, 'Kinh tế', 'Kiến thức về tài chính, quản trị kinh doanh và khởi nghiệp.');

-- Thêm Người dùng (Admin và User mẫu)
INSERT IGNORE INTO users (id, username, password, email, role) VALUES 
(1, 'admin', '123', 'admin@gmail.com', 'admin'),
(2, 'quyphan', '123', 'quyphan@gmail.com'), 
(3, 'otaku', '123', 'otaku@gmail.com'); 

-- Thêm Sách mẫu (Gán vào các category_id tương ứng)
INSERT IGNORE INTO books (title, author, description, image_url, price, isbn, published_date, view_count, category_id) VALUES 
('Lập trình Node.js', 'TG Alpha', 'Sách hướng dẫn Node.js cơ bản từ Zero đến Hero.', 'book1.jpg', 150000, '978-1234567890', '2024-01-15', 120, 1),
('Mastering Express', 'TG Beta', 'Xây dựng ứng dụng web mạnh mẽ với Express.js.', 'book2.jpg', 200000, '978-0987654321', '2024-02-20', 85, 1),
('TypeScript Nâng Cao', 'Trần Văn A', 'Làm chủ các tính năng phức tạp của TypeScript.', 'book3.jpg', 250000, '978-1112223334', '2024-03-10', 210, 1),
('Database Design', 'TG Gamma', 'Thiết kế cơ sở dữ liệu chuẩn hóa và hiệu quả.', 'book2.jpg', 180000, '978-8889990001', '2024-06-05', 45, 2),
('Kỹ năng giao tiếp', 'TG Delta', 'Bí quyết để trở thành người giao tiếp lôi cuốn.', 'book4.jpg', 120000, '978-4443332221', '2024-08-25', 150, 3),
('Khởi nghiệp tinh gọn', 'Eric Ries', 'Phương pháp xây dựng doanh nghiệp thành công.', 'book5.jpg', 220000, '978-5556667778', '2024-09-12', 300, 4);

-- Thêm Đánh giá mẫu
INSERT IGNORE INTO reviews (user_id, book_id, rating, comment) VALUES 
(2, 1, 5, 'Sách viết rất dễ hiểu cho người mới bắt đầu học Nodejs.'),
(3, 1, 4, 'Nội dung tốt, ví dụ thực tế nhưng phần nâng cao hơi ít.'),
(2, 4, 5, 'Kiến thức về Database rất chuẩn, giúp mình tối ưu được nhiều câu query.'),
(3, 5, 5, 'Cuốn sách thay đổi cách mình giao tiếp với mọi người xung quanh.');