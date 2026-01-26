-- Tạo cơ sở dữ liệu nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS book_store;
USE book_store;

-- 1. Bảng người dùng (Giữ nguyên phân quyền role)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' -- 'user' hoặc 'admin'
);

-- 2. Bảng sách (Cập nhật thêm published_date và view_count để phục vụ yêu cầu API Y2)
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    price DECIMAL(10, 2),
    isbn VARCHAR(50) UNIQUE, -- ISBN nên là duy nhất để truy cập API chính xác
    published_date DATE DEFAULT (CURRENT_DATE), -- Phục vụ yêu cầu image_01949c.png
    view_count INT DEFAULT 0 -- Phục vụ yêu cầu image_01949c.png
);

-- 3. Bảng đánh giá (Cập nhật logic ON DELETE CASCADE để fix lỗi không xóa được sách)
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5), -- Thang điểm 1-5
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    -- FIX: ON DELETE CASCADE giúp xóa sách sẽ tự động xóa đánh giá, tránh lỗi hệ thống
    CONSTRAINT fk_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    -- Mỗi người dùng chỉ đánh giá 1 lần cho mỗi cuốn sách
    UNIQUE KEY unique_user_review (user_id, book_id) 
);

-- ==========================================
-- DỮ LIỆU MẪU (Giữ nguyên dữ liệu cũ và cập nhật thông tin mới)
-- ==========================================

-- Thêm tài khoản Admin và User mẫu
INSERT IGNORE INTO users (username, password, email, role) VALUES 
('admin', '123', 'admin@gmail.com', 'admin'),
('quyphan', '123', 'quyphan@gmail.com', 'user'), 
('otaku', '123', 'otaku@gmail.com', 'user'); 

-- Thêm dữ liệu sách mẫu (bao gồm ISBN, Ngày xuất bản và Lượt xem)
INSERT IGNORE INTO books (title, author, description, image_url, price, isbn, published_date, view_count) VALUES 
('Lập trình Node.js', 'TG Alpha', 'Sách hướng dẫn Node.js cơ bản.', 'book1.jpg', 150000, '978-1234567890', '2024-01-15', 120),
('Mastering Express', 'TG Beta', 'Xây dựng ứng dụng web với Express.', 'book2.jpg', 200000, '978-0987654321', '2024-02-20', 85),
('TypeScript Nâng Cao', 'Trần Văn A', 'Làm chủ các tính năng phức tạp của TypeScript.', 'book3.jpg', 250000, '978-1112223334', '2024-03-10', 210),
('Fullstack với React & Node', 'Lê Thị B', 'Xây dựng ứng dụng hoàn chỉnh.', 'book1.jpg', 320000, '978-5556667778', '2024-05-12', 300),
('Database Design', 'TG Gamma', 'Thiết kế cơ sở dữ liệu chuẩn hóa.', 'book2.jpg', 180000, '978-8889990001', '2024-06-05', 45),
('Docker cho người mới', 'TG Delta', 'Triển khai ứng dụng nhanh chóng với Docker.', 'book3.jpg', 210000, '978-4443332221', '2024-08-25', 150);

-- Thêm đánh giá mẫu
INSERT IGNORE INTO reviews (user_id, book_id, rating, comment) VALUES 
(1, 1, 5, 'Sách viết rất dễ hiểu cho người mới bắt đầu.'),
(2, 1, 4, 'Nội dung tốt, nhưng phần Docker hơi ngắn.'),
(3, 1, 5, 'Rất hữu ích cho đồ án tốt nghiệp của mình.'),
(1, 2, 4, 'Kiến thức chuyên sâu, phù hợp với người đã biết cơ bản.'),
(2, 2, 5, 'Ví dụ trong sách rất thực tế.'),
(3, 2, 3, 'Hơi nhiều kiến thức nâng cao, cần đọc kỹ.'),
(2, 3, 5, 'TypeScript thực sự giúp code sạch hơn nhiều.'),
(3, 4, 4, 'Sách giúp mình hiểu rõ về Containerization.');