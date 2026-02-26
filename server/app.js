// ═══════════════════════════════════════
// Express App — shared between local dev & Vercel
// ═══════════════════════════════════════

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/characters');

const app = express();

// ── Middleware ──
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ── Health Check ──
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ──
app.use('/api', authRoutes);
app.use('/api', characterRoutes);

module.exports = app;
