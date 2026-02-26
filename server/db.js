// ═══════════════════════════════════════
// Database — sql.js (Pure JS SQLite for Vercel)
// ═══════════════════════════════════════

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.VERCEL
    ? '/tmp/fate.db'
    : path.join(__dirname, 'fate.db');

let db = null;

async function getDb() {
    if (db) return db;

    const SQL = await initSqlJs({
        locateFile: file => path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file)
    });

    // Try to load existing database
    try {
        if (fs.existsSync(DB_PATH)) {
            const buffer = fs.readFileSync(DB_PATH);
            db = new SQL.Database(buffer);
        } else {
            db = new SQL.Database();
        }
    } catch {
        db = new SQL.Database();
    }

    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL COLLATE NOCASE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS characters (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS sessions (
        user_id INTEGER PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    saveDb();
    return db;
}

function saveDb() {
    if (!db) return;
    try {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    } catch (err) {
        console.error('DB save error:', err);
    }
}

// ── Query Helpers ──

async function run(sql, params = []) {
    const d = await getDb();
    d.run(sql, params);
    saveDb();
    return { lastInsertRowid: d.exec("SELECT last_insert_rowid()")[0]?.values[0][0], changes: d.getRowsModified() };
}

async function get(sql, params = []) {
    const d = await getDb();
    const stmt = d.prepare(sql);
    stmt.bind(params);
    let row = null;
    if (stmt.step()) {
        row = stmt.getAsObject();
    }
    stmt.free();
    return row;
}

async function all(sql, params = []) {
    const d = await getDb();
    const stmt = d.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
}

module.exports = {
    getDb,
    run,
    get,
    all,
    saveDb,
};
