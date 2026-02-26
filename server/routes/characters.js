// ═══════════════════════════════════════
// Character Routes — CRUD per user
// ═══════════════════════════════════════

const express = require('express');
const { run, get, all } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// ── Characters ──

// GET /api/characters — list all characters for the user
router.get('/characters', async (req, res) => {
    try {
        const rows = await all('SELECT * FROM characters WHERE user_id = ? ORDER BY updated_at DESC', [req.userId]);
        const characters = rows.map(r => JSON.parse(r.data));
        res.json(characters);
    } catch (err) {
        console.error('Get characters error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// GET /api/characters/:id — get single character
router.get('/characters/:id', async (req, res) => {
    try {
        const row = await get('SELECT * FROM characters WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
        if (!row) return res.status(404).json({ error: 'Karakter bulunamadı' });
        res.json(JSON.parse(row.data));
    } catch (err) {
        console.error('Get character error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// POST /api/characters — create new character
router.post('/characters', async (req, res) => {
    try {
        const character = req.body;
        if (!character.id) {
            return res.status(400).json({ error: 'Karakter ID gerekli' });
        }
        await run('INSERT INTO characters (id, user_id, data) VALUES (?, ?, ?)', [character.id, req.userId, JSON.stringify(character)]);
        res.status(201).json(character);
    } catch (err) {
        // If duplicate, try update
        if (err.message && (err.message.includes('UNIQUE constraint failed') || err.message.includes('PRIMARY KEY'))) {
            try {
                await run('UPDATE characters SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', [JSON.stringify(req.body), req.body.id, req.userId]);
                return res.json(req.body);
            } catch (updateErr) {
                console.error('Update fallback error:', updateErr);
            }
        }
        console.error('Create character error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// PUT /api/characters/:id — update character
router.put('/characters/:id', async (req, res) => {
    try {
        const character = req.body;
        const existing = await get('SELECT * FROM characters WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
        if (!existing) {
            // Insert if doesn't exist
            await run('INSERT INTO characters (id, user_id, data) VALUES (?, ?, ?)', [req.params.id, req.userId, JSON.stringify(character)]);
        } else {
            await run('UPDATE characters SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', [JSON.stringify(character), req.params.id, req.userId]);
        }
        res.json(character);
    } catch (err) {
        console.error('Update character error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// DELETE /api/characters/:id — delete character
router.delete('/characters/:id', async (req, res) => {
    try {
        const result = await run('DELETE FROM characters WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Karakter bulunamadı' });
        }
        res.json({ message: 'Karakter silindi' });
    } catch (err) {
        console.error('Delete character error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// ── Game Session ──

// GET /api/session — get saved session
router.get('/session', async (req, res) => {
    try {
        const row = await get('SELECT * FROM sessions WHERE user_id = ?', [req.userId]);
        if (!row) return res.json(null);
        res.json(JSON.parse(row.data));
    } catch (err) {
        console.error('Get session error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// POST /api/session — save session
router.post('/session', async (req, res) => {
    try {
        const sessionData = req.body;
        await run(`
          INSERT INTO sessions (user_id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
        `, [req.userId, JSON.stringify(sessionData)]);
        res.json({ message: 'Oturum kaydedildi' });
    } catch (err) {
        console.error('Save session error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// DELETE /api/session — clear session
router.delete('/session', async (req, res) => {
    try {
        await run('DELETE FROM sessions WHERE user_id = ?', [req.userId]);
        res.json({ message: 'Oturum temizlendi' });
    } catch (err) {
        console.error('Delete session error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
