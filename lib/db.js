import sqlite3 from 'sqlite3';
import path from 'path';

// Store DB in the .palace directory for the MVP
const dbPath = path.resolve(process.cwd(), '.palace', 'palace.sqlite');

let db = null;

export async function getDb() {
    if (db) return db;
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database', err.message);
                reject(err);
            } else {
                db.run(`
          CREATE TABLE IF NOT EXISTS prompts (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            palace_id TEXT,
            memory_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (createErr) => {
                    if (createErr) reject(createErr);
                    else resolve(db);
                });
            }
        });
    });
}

export async function savePrompt({ id, content, palaceId, memoryId }) {
    const database = await getDb();
    return new Promise((resolve, reject) => {
        database.run(
            `INSERT INTO prompts (id, content, palace_id, memory_id) VALUES (?, ?, ?, ?)`,
            [id, content, palaceId, memoryId],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

export async function getPrompt(id) {
    const database = await getDb();
    return new Promise((resolve, reject) => {
        database.get(
            `SELECT * FROM prompts WHERE id = ?`,
            [id],
            (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
}
