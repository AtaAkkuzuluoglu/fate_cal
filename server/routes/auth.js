// ═══════════════════════════════════════
// Auth Routes — Register & Login
// ═══════════════════════════════════════

const express = require('express');
const bcrypt = require('bcryptjs');
const { run, get } = require('../db');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate
        if (!username || !password) {
            return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
        }
        if (username.length < 3) {
            return res.status(400).json({ error: 'Kullanıcı adı en az 3 karakter olmalı' });
        }
        if (password.length < 4) {
            return res.status(400).json({ error: 'Şifre en az 4 karakter olmalı' });
        }

        // Check if username exists
        const existing = await get('SELECT * FROM users WHERE username = ?', [username]);
        if (existing) {
            return res.status(409).json({ error: 'Bu kullanıcı adı zaten alınmış' });
        }

        // Hash password & create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await run('INSERT INTO users (username, password) VALUES (?, ?) RETURNING id', [username, hashedPassword]);

        const user = { id: result.lastInsertRowid, username };
        const token = generateToken(user);

        res.status(201).json({
            message: 'Hesap oluşturuldu',
            user: { id: user.id, username },
            token
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// POST /api/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
        }

        // Find user
        const user = await get('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) {
            return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
        }

        // Check password
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
        }

        const token = generateToken(user);

        res.json({
            message: 'Giriş başarılı',
            user: { id: user.id, username: user.username },
            token
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
