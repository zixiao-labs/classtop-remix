import { getDatabase } from './connection';
import type { Course } from '../../src/types/database';
import type { CourseAddRequest, CourseUpdateRequest } from '../../src/types/ipc';

export function getCourses(): Course[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM courses ORDER BY created_at DESC').all() as Course[];
}

export function addCourse(data: CourseAddRequest): Course {
  const db = getDatabase();
  const stmt = db.prepare(
    'INSERT INTO courses (name, teacher, location, color) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(data.name, data.teacher || '', data.location || '', data.color || '#4ECDC4');
  return db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid) as Course;
}

export function updateCourse(data: CourseUpdateRequest): void {
  const db = getDatabase();
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.teacher !== undefined) { fields.push('teacher = ?'); values.push(data.teacher); }
  if (data.location !== undefined) { fields.push('location = ?'); values.push(data.location); }
  if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }

  if (fields.length === 0) return;

  values.push(data.id);
  db.prepare(`UPDATE courses SET ${fields.join(', ')} WHERE id = ?`).run(...values);
}

export function deleteCourse(id: number): void {
  const db = getDatabase();
  db.prepare('DELETE FROM courses WHERE id = ?').run(id);
}
