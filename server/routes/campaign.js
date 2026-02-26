// ═══════════════════════════════════════
// Campaign Routes — CRUD for Serüven
// ═══════════════════════════════════════

const express = require('express');
const { run, get, all } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// --- DM: ADD CHARACTER BY ID ---
router.post('/campaign/add-character', async (req, res) => {
    try {
        const { characterId } = req.body;

        // Ensure user is DM
        const user = await get('SELECT role FROM users WHERE id = ?', [req.userId]);
        if (!user || user.role !== 'dm') {
            return res.status(403).json({ error: 'Sadece Oyun Yöneticisi (DM) karakter ekleyebilir' });
        }

        if (!characterId) {
            return res.status(400).json({ error: 'Karakter Kodu gerekli' });
        }

        // Check if character exists in database
        const characterCheck = await get('SELECT id FROM characters WHERE id = ?', [characterId]);
        if (!characterCheck) {
            return res.status(404).json({ error: 'Bu koda sahip bir karakter bulunamadı' });
        }

        // Add to campaign
        await run('INSERT INTO campaign_characters (dm_id, character_id) VALUES (?, ?)', [req.userId, characterId]);

        res.status(201).json({ message: 'Karakter serüvene eklendi!' });
    } catch (err) {
        if (err.message && (err.message.includes('UNIQUE') || err.message.includes('duplicate key'))) {
            return res.status(409).json({ error: 'Bu karakter zaten serüveninize ekli' });
        }
        console.error('Add character error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// --- DM & PLAYER: GET ALL CHARACTERS IN CAMPAIGN ---
router.get('/campaign/characters', async (req, res) => {
    try {
        // If the user is a DM, get all characters added to their campaign
        const user = await get('SELECT role FROM users WHERE id = ?', [req.userId]);

        if (user && user.role === 'dm') {
            const rows = await all(`
                SELECT c.data FROM characters c
                JOIN campaign_characters cc ON c.id = cc.character_id
                WHERE cc.dm_id = ?
            `, [req.userId]);

            const characters = rows.map(r => JSON.parse(r.data));
            return res.json(characters);
        } else {
            // Else if Player, get only their own characters
            const rows = await all('SELECT data FROM characters WHERE user_id = ?', [req.userId]);
            const characters = rows.map(r => JSON.parse(r.data));
            return res.json(characters);
        }
    } catch (err) {
        console.error('Get campaign characters error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// --- DM & PLAYER: GET SHARED CAMPAIGN NOTES ---
router.get('/campaign/notes', async (req, res) => {
    try {
        const user = await get('SELECT role FROM users WHERE id = ?', [req.userId]);
        let dm_id = req.userId;

        // If player, find the DM they are playing with.
        // For simplicity, we assume a player is in ONE campaign and gets the first DM they are linked to.
        if (user && user.role !== 'dm') {
            const link = await get(`
                SELECT dm_id FROM campaign_characters cc
                JOIN characters c ON cc.character_id = c.id
                WHERE c.user_id = ? LIMIT 1
            `, [req.userId]);

            if (!link) {
                return res.json({ content: 'Bir serüvene dahil olduğunuzda ortak notları burada görebileceksiniz.' });
            }
            dm_id = link.dm_id;
        }

        const notes = await get('SELECT content FROM campaign_notes WHERE dm_id = ?', [dm_id]);
        res.json({ content: notes ? notes.content : '' });
    } catch (err) {
        console.error('Get notes error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// --- DM & PLAYER: SAVE SHARED CAMPAIGN NOTES ---
router.post('/campaign/notes', async (req, res) => {
    try {
        const { content } = req.body;
        const user = await get('SELECT role FROM users WHERE id = ?', [req.userId]);
        let dm_id = req.userId;

        // If player, find their DM
        if (user && user.role !== 'dm') {
            const link = await get(`
                SELECT dm_id FROM campaign_characters cc
                JOIN characters c ON cc.character_id = c.id
                WHERE c.user_id = ? LIMIT 1
            `, [req.userId]);

            if (!link) {
                return res.status(403).json({ error: 'Henüz bir serüvene dahil değilsiniz.' });
            }
            dm_id = link.dm_id;
        }

        // Insert or Update the notes for this DM
        await run(`
            INSERT INTO campaign_notes (dm_id, content) 
            VALUES (?, ?) 
            ON CONFLICT(dm_id) 
            DO UPDATE SET content = excluded.content, last_updated = CURRENT_TIMESTAMP
        `, [dm_id, content]);

        res.json({ message: 'Notlar kaydedildi' });
    } catch (err) {
        console.error('Save notes error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
