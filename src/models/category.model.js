const Category = require('../models/category.model');

// Hiển thị danh sách danh mục
exports.getCategoryManagement = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.render('admin/category-list', { 
            categories,
            layout: 'main' // Sử dụng layout chung có sidebar admin
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi hệ thống khi tải danh mục');
    }
};

// Thêm danh mục mới
exports.postAddCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).send('Tên danh mục không được để trống');
        
        await Category.create(name, description);
        res.redirect('/admin/categories');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi thêm danh mục');
    }
};

// Xóa danh mục
exports.getDeleteCategory = async (req, res) => {
    try {
        await Category.delete(req.params.id);
        res.redirect('/admin/categories');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi xóa danh mục');
    }
};