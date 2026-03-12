// ═══════════════════════════════════════
// Database — Vercel Postgres
// ═══════════════════════════════════════

const { createPool } = require('@vercel/postgres');

let pool = null;

async function getDb() {
    if (!pool) {
        if (!process.env.POSTGRES_URL) {
            throw new Error('POSTGRES_URL environment variable is not set. Database connection cannot be established.');
        }
        pool = createPool({
            connectionString: process.env.POSTGRES_URL
        });
    }
    return pool;
}

/**
 * Converts SQLite '?' parameters to Postgres '$1, $2...' format.
 */
function toPgQuery(sql) {
    let index = 1;
    return sql.replace(/\?/g, () => '$' + index++);
}

// ── Query Helpers (Mocking sql.js for backward compatibility) ──

async function run(sql, params = []) {
    const p = await getDb();
    const pgSql = toPgQuery(sql);
    const result = await p.query(pgSql, params);

    // Postgres doesn't return lastInsertRowid automatically unless RETURNING id is used.
    // If returning is used, result.rows[0] might contain the id.
    const lastRowId = result.rows && result.rows.length > 0 ? (result.rows[0].id || result.rows[0][Object.keys(result.rows[0])[0]]) : null;

    return {
        lastInsertRowid: lastRowId,
        changes: result.rowCount
    };
}

async function get(sql, params = []) {
    const p = await getDb();
    const pgSql = toPgQuery(sql);
    const result = await p.query(pgSql, params);
    return result.rows.length > 0 ? result.rows[0] : null;
}

async function all(sql, params = []) {
    const p = await getDb();
    const pgSql = toPgQuery(sql);
    const result = await p.query(pgSql, params);
    return result.rows;
}

// ── Schema Synchronization (One-Time / Manual) ──
async function syncSchema() {
    const p = await getDb();

    // Ensure users table has role column
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'player'
      )
    `);

    // Add role column if it doesn't exist (for existing DBs)
    try {
        await p.query(`ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'player'`);
    } catch (e) { /* Column might already exist, ignore */ }

    // Create campaign_characters table
    await p.query(`
      CREATE TABLE IF NOT EXISTS campaign_characters (
        id SERIAL PRIMARY KEY,
        dm_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        character_id VARCHAR(255) NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(dm_id, character_id)
      )
    `);

    // Create campaign_notes table
    await p.query(`
      CREATE TABLE IF NOT EXISTS campaign_notes (
        id SERIAL PRIMARY KEY,
        dm_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        content TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Database schema synced!");
}

module.exports = {
    getDb,
    run,
    get,
    all,
    syncSchema
};
