// ═══════════════════════════════════════
// Vercel Serverless Handler
// ═══════════════════════════════════════

const app = require('../server/app');
const { getDb } = require('../server/db');

// Add a test route so we can see the exact initialization error
app.get('/api/test-db', async (req, res) => {
    try {
        await getDb();
        res.json({ status: 'Database initialized successfully' });
    } catch (err) {
        res.status(500).json({
            error: 'Failed to initialize database',
            message: err.message,
            stack: err.stack
        });
    }
});

module.exports = app;
