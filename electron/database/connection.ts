import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
import fs from 'fs';

let db: Database.Database | null = null;

const DB_DIR = path.join(os.homedir(), '.classtop-remix');
const DB_PATH = path.join(DB_DIR, 'classtop.db');

export function getDatabase(): Database.Database {
  if (db) return db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  createTables(db);
  return db;
}

function createTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      teacher TEXT DEFAULT '',
      location TEXT DEFAULT '',
      color TEXT DEFAULT '#4ECDC4',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 1 AND 7),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      weeks TEXT DEFAULT '[]',
      note TEXT DEFAULT '',
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS course_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      schedule_entry_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      attended INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (schedule_entry_id) REFERENCES schedule(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS statistics_cache (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // Initialize default settings
  const defaults: Record<string, string> = {
    theme_mode: 'auto',
    theme_color: '#4ECDC4',
    font_size: '16',
    topbar_height: '3',
    semester_start_date: '',
    total_weeks: '20',
    notification_enabled: 'true',
    notification_minutes: '10',
    notification_sound: 'true',
  };

  const insertSetting = db.prepare(
    'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
  );
  for (const [key, value] of Object.entries(defaults)) {
    insertSetting.run(key, value);
  }
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
