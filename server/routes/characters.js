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
        let row = await get('SELECT * FROM characters WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);

        // If not owner, check if user is the DM for this character in their campaign
        if (!row) {
            const dmLink = await get('SELECT 1 FROM campaign_characters WHERE character_id = ? AND dm_id = ?', [req.params.id, req.userId]);
            if (dmLink) {
                row = await get('SELECT * FROM characters WHERE id = ?', [req.params.id]);
            }
        }

        if (!row) return res.status(404).json({ error: 'Karakter bulunamadı veya yetkiniz yok' });
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
        let existing = await get('SELECT * FROM characters WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
        let isOwner = !!existing;
        let isDM = false;

        if (!existing) {
            const dmLink = await get('SELECT 1 FROM campaign_characters WHERE character_id = ? AND dm_id = ?', [req.params.id, req.userId]);
            if (dmLink) {
                isDM = true;
                existing = await get('SELECT * FROM characters WHERE id = ?', [req.params.id]);
            }
        }

        if (!existing && !isDM) {
            // Insert if doesn't exist
            await run('INSERT INTO characters (id, user_id, data) VALUES (?, ?, ?)', [req.params.id, req.userId, JSON.stringify(character)]);
        } else if (isOwner || isDM) {
            await run('UPDATE characters SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [JSON.stringify(character), req.params.id]);
        } else {
            return res.status(403).json({ error: 'Yetkisiz erişim' });
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

module.exports = router;
