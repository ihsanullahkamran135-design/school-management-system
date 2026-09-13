const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== API ROUTES ====================

// 1) ټول زده کونکي راوړل (GET)
app.get('/api/students', (req, res) => {
    const sql = 'SELECT * FROM students ORDER BY id DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// 2) یو ځانګړی زده کونکی راوړل (GET by id)
app.get('/api/students/:id', (req, res) => {
    const sql = 'SELECT * FROM students WHERE id = ?';
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'زده کونکی ونه موندل شو' });
        }
        res.json(row);
    });
});

// 3) نوی زده کونکی اضافه کول (POST)
app.post('/api/students', (req, res) => {
    const { full_name, father_name, class_name, age, phone, address } = req.body;

    if (!full_name || full_name.trim() === '') {
        return res.status(400).json({ error: 'د زده کونکي نوم اړین دی' });
    }

    const sql = `INSERT INTO students (full_name, father_name, class_name, age, phone, address)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [full_name, father_name || '', class_name || '', age || null, phone || '', address || ''];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, full_name, father_name, class_name, age, phone, address });
    });
});

// 4) د زده کونکي معلومات بدلول / ایډیټ کول (PUT)
app.put('/api/students/:id', (req, res) => {
    const { full_name, father_name, class_name, age, phone, address } = req.body;
    const { id } = req.params;

    if (!full_name || full_name.trim() === '') {
        return res.status(400).json({ error: 'د زده کونکي نوم اړین دی' });
    }

    const sql = `UPDATE students
                 SET full_name = ?, father_name = ?, class_name = ?, age = ?, phone = ?, address = ?
                 WHERE id = ?`;
    const params = [full_name, father_name || '', class_name || '', age || null, phone || '', address || '', id];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'زده کونکی ونه موندل شو' });
        }
        res.json({ message: 'معلومات بریالیتوب سره بدل شول' });
    });
});

// 5) زده کونکی حذف کول (DELETE)
app.delete('/api/students/:id', (req, res) => {
    const sql = 'DELETE FROM students WHERE id = ?';
    db.run(sql, [req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'زده کونکی ونه موندل شو' });
        }
        res.json({ message: 'زده کونکی بریالیتوب سره حذف شو' });
    });
});

// سرور پیل کول
app.listen(PORT, () => {
    console.log(`🚀 سرور فعال دی: http://localhost:${PORT}`);
});
