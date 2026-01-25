-- Tạo cơ sở dữ liệu nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS book_store;
USE book_store;

-- 1. Bảng người dùng (Đã bổ sung cột role để phân quyền)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' -- Phân quyền: 'user' hoặc 'admin'
);

-- 2. Bảng sách (Đã bổ sung cột isbn để hỗ trợ tìm kiếm nâng cao)
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    price DECIMAL(10, 2),
    isbn VARCHAR(50) -- Hỗ trợ tìm kiếm theo mã sách
);

-- 3. Bảng đánh giá (Lưu trữ nhận xét và xếp hạng của người dùng)
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5), -- Thang điểm từ 1 đến 5
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id),
    -- Đảm bảo mỗi người dùng chỉ đánh giá 1 lần cho mỗi cuốn sách
    UNIQUE KEY unique_user_review (user_id, book_id) 
);

-- ==========================================
-- DỮ LIỆU MẪU ĐỂ KIỂM TRA HỆ THỐNG
-- ==========================================

-- Thêm tài khoản Admin và User mẫu
INSERT INTO users (username, password, email, role) VALUES 
('admin', '123', 'admin@gmail.com', 'admin'), -- Tài khoản quản trị viên
('user1', '123', 'user@gmail.com', 'user');

-- Thêm dữ liệu sách mẫu (bao gồm ISBN)
INSERT INTO books (title, author, description, image_url, price, isbn) VALUES 
('Lập trình Node.js', 'TG Alpha', 'Sách hướng dẫn Node.js cơ bản.', 'book1.jpg', 150000, '978-1234567890'),
('Mastering Express', 'TG Beta', 'Xây dựng ứng dụng web với Express.', 'book2.jpg', 200000, '978-0987654321');