// ═══════════════════════════════════════
// Character Routes — CRUD per user
// ═══════════════════════════════════════

const express = require('express');
const { getCharactersByUser, getCharacterById, insertCharacter, updateCharacter, deleteCharacter, getSession, upsertSession, deleteSession } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// ── Characters ──

// GET /api/characters — list all characters for the user
router.get('/characters', (req, res) => {
    try {
        const rows = getCharactersByUser.all(req.userId);
        const characters = rows.map(r => JSON.parse(r.data));
        res.json(characters);
    } catch (err) {
        console.error('Get characters error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// GET /api/characters/:id — get single character
router.get('/characters/:id', (req, res) => {
    try {
        const row = getCharacterById.get(req.params.id, req.userId);
        if (!row) return res.status(404).json({ error: 'Karakter bulunamadı' });
        res.json(JSON.parse(row.data));
    } catch (err) {
        console.error('Get character error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// POST /api/characters — create new character
router.post('/characters', (req, res) => {
    try {
        const character = req.body;
        if (!character.id) {
            return res.status(400).json({ error: 'Karakter ID gerekli' });
        }
        insertCharacter.run(character.id, req.userId, JSON.stringify(character));
        res.status(201).json(character);
    } catch (err) {
        // If duplicate, try update
        if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
            try {
                updateCharacter.run(JSON.stringify(req.body), req.body.id, req.userId);
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
router.put('/characters/:id', (req, res) => {
    try {
        const character = req.body;
        const existing = getCharacterById.get(req.params.id, req.userId);
        if (!existing) {
            // Insert if doesn't exist
            insertCharacter.run(req.params.id, req.userId, JSON.stringify(character));
        } else {
            updateCharacter.run(JSON.stringify(character), req.params.id, req.userId);
        }
        res.json(character);
    } catch (err) {
        console.error('Update character error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// DELETE /api/characters/:id — delete character
router.delete('/characters/:id', (req, res) => {
    try {
        const result = deleteCharacter.run(req.params.id, req.userId);
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
router.get('/session', (req, res) => {
    try {
        const row = getSession.get(req.userId);
        if (!row) return res.json(null);
        res.json(JSON.parse(row.data));
    } catch (err) {
        console.error('Get session error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// POST /api/session — save session
router.post('/session', (req, res) => {
    try {
        const sessionData = req.body;
        upsertSession.run(req.userId, JSON.stringify(sessionData));
        res.json({ message: 'Oturum kaydedildi' });
    } catch (err) {
        console.error('Save session error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// DELETE /api/session — clear session
router.delete('/session', (req, res) => {
    try {
        deleteSession.run(req.userId);
        res.json({ message: 'Oturum temizlendi' });
    } catch (err) {
        console.error('Delete session error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
