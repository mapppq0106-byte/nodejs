CREATE DATABASE IF NOT EXISTS book_store;
USE book_store;

-- Bảng sách
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    price DECIMAL(10, 2)
);

-- Dữ liệu mẫu (Lưu ý: image_url chỉ cần tên file)
INSERT INTO books (title, author, description, image_url, price) VALUES 
('Lập trình Node.js', 'TG Alpha', 'Sách hướng dẫn Node.js từ cơ bản đến nâng cao.', 'book1.jpg', 150000),
('Mastering Express', 'TG Beta', 'Xây dựng ứng dụng web mạnh mẽ với Express.', 'book2.jpg', 200000);

-- Bảng người dùng
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);