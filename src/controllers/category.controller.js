const Category = require('../models/category.model');

exports.getCategoryManagement = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.render('admin/category-list', { 
            categories,
            layout: 'main' // Đảm bảo sử dụng layout admin/main của bạn
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi hệ thống khi tải danh mục');
    }
};

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

exports.getDeleteCategory = async (req, res) => {
    try {
        await Category.delete(req.params.id);
        res.redirect('/admin/categories');
    } catch (error) {
        res.status(500).send('Lỗi khi xóa danh mục');
    }
};