const db = require('../config/db')

const Book = {
    getAll: async () => {
        const [rows] = await db.execute('SELECT * FROM books');
        return rows
    }
}
module.exports = Book 