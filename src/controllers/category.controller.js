// src/controllers/category.controller.js
const Category = require('../models/category.model');

exports.getCategoryManagement = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.render('admin/category-list', { 
            categories,
            // Đảm bảo hiển thị đúng layout nếu bạn có chia layout admin riêng
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi tải danh mục');
    }
};

exports.postAddCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).send('Tên không được để trống');
        
        // 1. Kiểm tra trùng tên
        const isDuplicate = await Category.checkDuplicateName(name);
        if (isDuplicate) {
            // Lấy lại danh sách để render lại trang cùng thông báo lỗi
            const categories = await Category.getAll();
            return res.render('admin/category-list', { 
                categories, 
                error: "Tên danh mục này đã tồn tại!" 
            });
        }
        
        // 2. Nếu không trùng thì mới tạo
        await Category.create(name, description);
        res.redirect('/admin/categories');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi thêm danh mục');
    }
};

// Thêm chức năng xóa danh mục nếu chưa có
exports.getDeleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        await Category.delete(id);
        res.redirect('/admin/categories');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi xóa danh mục');
    }
};