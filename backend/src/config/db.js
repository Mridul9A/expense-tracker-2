import Database from "better-sqlite3";
import path from "path";

const dbPath = process.env.DB_PATH || path.join("data", "expenses.db");

const db = new Database(dbPath);

// create table
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    idempotency_key TEXT UNIQUE,
    amount INTEGER NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;