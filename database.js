// د ډیټابیس اتصال او جوړول
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'school.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('د ډیټابیس سره د وصل کیدو خطا:', err.message);
    } else {
        console.log('✅ ډیټابیس سره وصل شو:', dbPath);
    }
});

// جدول جوړول که شتون ونلري
db.run(`
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        father_name TEXT,
        class_name TEXT,
        age INTEGER,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error('د جدول د جوړولو خطا:', err.message);
    } else {
        console.log('✅ جدول (students) چمتو دی');
    }
});

module.exports = db;
