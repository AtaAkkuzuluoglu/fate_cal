// ═══════════════════════════════════════
// FATE CONDENSED — Express Server
// ═══════════════════════════════════════

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/characters');

const app = express();
const PORT = process.env.PORT || 3001;

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

// ── Start Server ──
app.listen(PORT, () => {
    console.log(`\n  ⚡ Fate Condensed Server running on http://localhost:${PORT}\n`);
});
