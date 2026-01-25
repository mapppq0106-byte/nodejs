const Book = require('../models/book.model')

exports.getAllBooks = async (req , res) => {
    try {
        const books = await Book.getAll() // goi ham model
        res.render('home', {books})
    }catch (error) {
        console.error(error)
        res.status(500).send('Loi khi lay du lieu sach')
    }
}
