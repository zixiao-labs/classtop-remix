import { getDatabase } from './connection';
import type { ScheduleEntry, ScheduleWithCourse, ConflictResult, WeekInfo } from '../../src/types/database';
import type { ScheduleAddRequest } from '../../src/types/ipc';

const SCHEDULE_JOIN_QUERY = `
  SELECT s.*, c.name AS course_name, c.teacher, c.location, c.color
  FROM schedule s
  JOIN courses c ON s.course_id = c.id
`;

function parseWeeks(weeksStr: string): number[] {
  try {
    return JSON.parse(weeksStr);
  } catch {
    return [];
  }
}

function rowToScheduleWithCourse(row: Record<string, unknown>): ScheduleWithCourse {
  return {
    ...row,
    weeks: parseWeeks(row.weeks as string),
  } as unknown as ScheduleWithCourse;
}

function filterByWeek(rows: Record<string, unknown>[], week: number | null | undefined): ScheduleWithCourse[] {
  const mapped = rows.map(rowToScheduleWithCourse);
  if (week == null) return mapped;
  return mapped.filter(entry => entry.weeks.length === 0 || entry.weeks.includes(week));
}

export function getSchedule(week?: number | null): ScheduleWithCourse[] {
  const db = getDatabase();
  const rows = db.prepare(`${SCHEDULE_JOIN_QUERY} ORDER BY s.day_of_week, s.start_time`).all() as Record<string, unknown>[];
  return filterByWeek(rows, week);
}

export function getScheduleByDay(dayOfWeek: number, week?: number | null): ScheduleWithCourse[] {
  const db = getDatabase();
  const rows = db.prepare(
    `${SCHEDULE_JOIN_QUERY} WHERE s.day_of_week = ? ORDER BY s.start_time`
  ).all(dayOfWeek) as Record<string, unknown>[];
  return filterByWeek(rows, week);
}

export function getScheduleForWeek(week?: number | null): ScheduleWithCourse[] {
  return getSchedule(week);
}

export function addScheduleEntry(data: ScheduleAddRequest): ScheduleEntry {
  const db = getDatabase();
  const weeksJson = JSON.stringify(data.weeks || []);
  const stmt = db.prepare(
    'INSERT INTO schedule (course_id, day_of_week, start_time, end_time, weeks, note) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(data.course_id, data.day_of_week, data.start_time, data.end_time, weeksJson, data.note || '');
  const row = db.prepare('SELECT * FROM schedule WHERE id = ?').get(result.lastInsertRowid) as Record<string, unknown>;
  return { ...row, weeks: parseWeeks(row.weeks as string) } as unknown as ScheduleEntry;
}

export function deleteScheduleEntry(id: number): void {
  const db = getDatabase();
  db.prepare('DELETE FROM schedule WHERE id = ?').run(id);
}

export function checkConflicts(
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  weeks?: number[] | null,
  excludeEntryId?: number | null
): ConflictResult {
  const db = getDatabase();
  let query = `${SCHEDULE_JOIN_QUERY} WHERE s.day_of_week = ? AND s.start_time < ? AND s.end_time > ?`;
  const params: unknown[] = [dayOfWeek, endTime, startTime];

  if (excludeEntryId) {
    query += ' AND s.id != ?';
    params.push(excludeEntryId);
  }

  const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
  let conflicts = rows.map(rowToScheduleWithCourse);

  // Filter by overlapping weeks if specified
  if (weeks && weeks.length > 0) {
    conflicts = conflicts.filter(c =>
      c.weeks.length === 0 || c.weeks.some(w => weeks.includes(w))
    );
  }

  return {
    has_conflict: conflicts.length > 0,
    conflicts,
  };
}

export function calculateWeekNumber(semesterStartDate: string): number {
  if (!semesterStartDate) return 1;
  const start = new Date(semesterStartDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const week = Math.floor(diffDays / 7) + 1;
  return Math.max(1, week);
}

export function getCurrentWeek(): WeekInfo {
  const db = getDatabase();
  const row = db.prepare("SELECT value FROM settings WHERE key = 'semester_start_date'").get() as { value: string } | undefined;
  const semesterStartDate = row?.value || '';

  if (semesterStartDate) {
    return {
      week: calculateWeekNumber(semesterStartDate),
      semester_start_date: semesterStartDate,
      is_calculated: true,
    };
  }

  return { week: 1, semester_start_date: '', is_calculated: false };
}
