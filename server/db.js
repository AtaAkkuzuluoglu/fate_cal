// ═══════════════════════════════════════
// Database — Vercel Postgres
// ═══════════════════════════════════════

const { createPool } = require('@vercel/postgres');

let pool = null;

async function getDb() {
    if (!pool) {
        if (!process.env.POSTGRES_URL) {
            console.warn('POSTGRES_URL is not set. The database connection will fail.');
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

module.exports = {
    getDb,
    run,
    get,
    all
};
