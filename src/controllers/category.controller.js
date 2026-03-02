// src/controllers/category.controller.js
const Category = require('../models/category.model');

// 1. Hiển thị danh sách quản lý danh mục
exports.getCategoryManagement = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.render('admin/category-list', { 
            categories
        });
    } catch (error) {
        console.error("Lỗi tải danh mục:", error);
        res.status(500).send('Lỗi tải danh mục');
    }
};

// 2. Xử lý thêm danh mục mới
exports.postAddCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            const categories = await Category.getAll();
            return res.render('admin/category-list', { 
                categories, 
                error: "Tên danh mục không được để trống!" 
            });
        }
        
        // Kiểm tra trùng tên
        const isDuplicate = await Category.checkDuplicateName(name);
        if (isDuplicate) {
            const categories = await Category.getAll();
            return res.render('admin/category-list', { 
                categories, 
                error: "Tên danh mục này đã tồn tại!" 
            });
        }
        
        await Category.create(name, description);
        res.redirect('/admin/categories');
    } catch (error) {
        console.error("Lỗi thêm danh mục:", error);
        res.status(500).send('Lỗi khi thêm danh mục');
    }
};

// 3. Xử lý xóa danh mục (CẬP NHẬT: Kiểm tra ràng buộc với sách)
exports.getDeleteCategory = async (req, res) => {
    try {
        const id = req.params.id;

        // BƯỚC 1: Kiểm tra xem danh mục này có chứa cuốn sách nào không
        const bookCount = await Category.countBooksInCategory(id);

        if (bookCount > 0) {
            // Nếu có ít nhất 1 cuốn sách, báo lỗi và không xóa
            const categories = await Category.getAll();
            return res.render('admin/category-list', { 
                categories, 
                error: "Danh mục này không thể xóa vì đã có sách trong danh mục đó!" 
            });
        }

        // BƯỚC 2: Nếu không có sách, tiến hành xóa
        await Category.delete(id);
        res.redirect('/admin/categories');
    } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
        res.status(500).send('Lỗi khi xóa danh mục');
    }
};