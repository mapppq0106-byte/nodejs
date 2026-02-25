-- 1. Xóa và tạo lại cơ sở dữ liệu
DROP DATABASE IF EXISTS book_store;
CREATE DATABASE book_store;
USE book_store;

-- 2. Tạo bảng Danh mục
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- 3. Tạo bảng Người dùng
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user'
);

-- 4. Tạo bảng Sách
CREATE TABLE books (
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
    -- CẬP NHẬT: Thêm ràng buộc UNIQUE cho title để chống trùng tên sách
    CONSTRAINT unique_book_title UNIQUE (title),
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 5. Tạo bảng Đánh giá
CREATE TABLE reviews (
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

-- 6. Tạo bảng Chapters
CREATE TABLE chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    chapter_number INT NOT NULL,
    title VARCHAR(255),
    content TEXT,
    CONSTRAINT fk_book_chapter FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- ==========================================
-- DỮ LIỆU MẪU (Giữ nguyên)
-- ==========================================

-- Thêm Danh mục
INSERT INTO categories (id, name, description) VALUES 
(1, 'Lập trình', 'Các sách về phát triển phần mềm, ngôn ngữ lập trình và công nghệ.'),
(2, 'Cơ sở dữ liệu', 'Kiến thức về thiết kế, quản trị và tối ưu hóa hệ quản trị CSDL.'),
(3, 'Kỹ năng mềm', 'Phát triển bản thân, giao tiếp và quản lý thời gian.'),
(4, 'Kinh tế', 'Kiến thức về tài chính, quản trị kinh doanh và khởi nghiệp.');

-- Thêm Người dùng
INSERT INTO users (id, username, password, email, role) VALUES 
(1, 'admin', '123', 'admin@gmail.com', 'admin'),
(2, 'quyphan', '123', 'quyphan@gmail.com', 'user'), 
(3, 'otaku', '123', 'otaku@gmail.com', 'user'); 

-- Thêm Sách mẫu
INSERT INTO books (id, title, author, description, image_url, price, isbn, published_date, view_count, category_id) VALUES 
(1, 'Lập trình Node.js', 'TG Alpha', 'Sách hướng dẫn Node.js cơ bản từ Zero đến Hero.', 'book1.jpg', 150000, '978-1234567890', '2024-01-15', 450, 1),
(2, 'Mastering Express', 'TG Beta', 'Xây dựng ứng dụng web mạnh mẽ với Express.js.', 'book2.jpg', 200000, '978-0987654321', '2024-02-20', 85, 1),
(3, 'TypeScript Nâng Cao', 'Trần Văn A', 'Làm chủ các tính năng phức tạp của TypeScript.', 'book3.jpg', 250000, '978-1112223334', '2024-03-10', 890, 1),
(4, 'Database Design', 'TG Gamma', 'Thiết kế cơ sở dữ liệu chuẩn hóa và hiệu quả.', 'book2.jpg', 180000, '978-8889990001', '2024-06-05', 45, 2),
(5, 'Kỹ năng giao tiếp', 'TG Delta', 'Bí quyết để trở thành người giao tiếp lôi cuốn.', 'book4.jpg', 120000, '978-4443332221', '2024-08-25', 150, 3),
(6, 'Khởi nghiệp tinh gọn', 'Eric Ries', 'Phương pháp xây dựng doanh nghiệp thành công.', 'book5.jpg', 220000, '978-5556667778', '2024-09-12', 1250, 4);

-- Thêm Chapters
INSERT INTO chapters (book_id, chapter_number, title, content) VALUES 
(1, 1, 'Chương 1: Giới thiệu Node.js', 'Nội dung chương 1...'),
(1, 2, 'Chương 2: Cài đặt môi trường', 'Nội dung chương 2...'),
(1, 3, 'Chương 3: Xây dựng Web Server', 'Nội dung chương 3...'),
(3, 1, 'Chương 1: Interface và Types', 'Nội dung TypeScript chương 1...'),
(6, 1, 'Chương 1: Tầm nhìn', 'Nội dung Khởi nghiệp chương 1...');

-- Thêm Đánh giá mẫu
INSERT INTO reviews (user_id, book_id, rating, comment) VALUES 
(2, 1, 5, 'Sách viết rất dễ hiểu cho người mới.'),
(3, 1, 4, 'Nội dung tốt, ví dụ thực tế.'),
(1, 1, 5, 'Admin cũng rất thích cuốn này!'),
(2, 6, 5, 'Rất thực tế và dễ áp dụng.');