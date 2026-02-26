// ═══════════════════════════════════════
// Database — SQLite setup & helpers
// ═══════════════════════════════════════

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'fate.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent reads
db.pragma('journal_mode = WAL');

// ── Create Tables ──
db.exec(`
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

// ── Prepared Statements ──

// Users
const createUser = db.prepare(
    'INSERT INTO users (username, password) VALUES (?, ?)'
);
const findUserByUsername = db.prepare(
    'SELECT * FROM users WHERE username = ?'
);
const findUserById = db.prepare(
    'SELECT id, username, created_at FROM users WHERE id = ?'
);

// Characters
const getCharactersByUser = db.prepare(
    'SELECT * FROM characters WHERE user_id = ? ORDER BY updated_at DESC'
);
const getCharacterById = db.prepare(
    'SELECT * FROM characters WHERE id = ? AND user_id = ?'
);
const insertCharacter = db.prepare(
    'INSERT INTO characters (id, user_id, data) VALUES (?, ?, ?)'
);
const updateCharacter = db.prepare(
    'UPDATE characters SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
);
const deleteCharacter = db.prepare(
    'DELETE FROM characters WHERE id = ? AND user_id = ?'
);

// Sessions
const getSession = db.prepare(
    'SELECT * FROM sessions WHERE user_id = ?'
);
const upsertSession = db.prepare(`
  INSERT INTO sessions (user_id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
`);
const deleteSession = db.prepare(
    'DELETE FROM sessions WHERE user_id = ?'
);

module.exports = {
    db,
    createUser,
    findUserByUsername,
    findUserById,
    getCharactersByUser,
    getCharacterById,
    insertCharacter,
    updateCharacter,
    deleteCharacter,
    getSession,
    upsertSession,
    deleteSession,
};
