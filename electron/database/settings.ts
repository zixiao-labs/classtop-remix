import { getDatabase } from './connection';
import type { Setting } from '../../src/types/database';

export function getAllSettings(): Setting[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM settings').all() as Setting[];
}

export function getSetting(key: string): string {
  const db = getDatabase();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? '';
}

export function setSetting(key: string, value: string): void {
  const db = getDatabase();
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}

export function resetSettings(): void {
  const db = getDatabase();
  db.prepare('DELETE FROM settings').run();

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

  const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(defaults)) {
    stmt.run(k, v);
  }
}
