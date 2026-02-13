import { getDatabase } from './connection';
import type { Statistics, AttendanceRecord } from '../../src/types/database';

export function calculateAllStatistics(): Statistics {
  const db = getDatabase();

  const courseCount = (db.prepare('SELECT COUNT(*) AS count FROM courses').get() as { count: number }).count;

  // Calculate total hours from schedule entries
  const scheduleRows = db.prepare('SELECT start_time, end_time, weeks FROM schedule').all() as {
    start_time: string;
    end_time: string;
    weeks: string;
  }[];

  let totalMinutes = 0;
  for (const row of scheduleRows) {
    const [sh, sm] = row.start_time.split(':').map(Number);
    const [eh, em] = row.end_time.split(':').map(Number);
    const duration = (eh * 60 + em) - (sh * 60 + sm);
    const weeks: number[] = JSON.parse(row.weeks || '[]');
    const weekCount = weeks.length || 1;
    totalMinutes += duration * weekCount;
  }

  // Attendance rate
  const totalSessions = (db.prepare('SELECT COUNT(*) AS count FROM course_sessions').get() as { count: number }).count;
  const attendedSessions = (db.prepare('SELECT COUNT(*) AS count FROM course_sessions WHERE attended = 1').get() as { count: number }).count;
  const attendanceRate = totalSessions > 0 ? attendedSessions / totalSessions : 0;

  // Weekly hours (average)
  const totalWeeksRow = db.prepare("SELECT value FROM settings WHERE key = 'total_weeks'").get() as { value: string } | undefined;
  const totalWeeks = parseInt(totalWeeksRow?.value || '20') || 20;
  const weeklyHours = totalMinutes / 60 / totalWeeks;

  // Busiest day
  const busiestRow = db.prepare(
    `SELECT day_of_week, COUNT(*) AS cnt FROM schedule GROUP BY day_of_week ORDER BY cnt DESC LIMIT 1`
  ).get() as { day_of_week: number; cnt: number } | undefined;
  const dayNames = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const busiestDay = busiestRow ? dayNames[busiestRow.day_of_week] : '无';

  // Time distribution
  const timeDistribution: Record<string, number> = {};
  for (const row of scheduleRows) {
    const hour = parseInt(row.start_time.split(':')[0]);
    let period: string;
    if (hour < 12) period = '上午';
    else if (hour < 14) period = '中午';
    else if (hour < 18) period = '下午';
    else period = '晚上';
    timeDistribution[period] = (timeDistribution[period] || 0) + 1;
  }

  return {
    total_courses: courseCount,
    total_hours: Math.round(totalMinutes / 60 * 10) / 10,
    attendance_rate: Math.round(attendanceRate * 1000) / 10,
    weekly_hours: Math.round(weeklyHours * 10) / 10,
    busiest_day: busiestDay,
    time_distribution: timeDistribution,
  };
}

export function markAttendance(data: {
  course_id: number;
  schedule_entry_id: number;
  date: string;
  start_time: string;
  end_time: string;
  attended: boolean;
  notes?: string;
}): void {
  const db = getDatabase();

  // Upsert: check if record exists for this date + schedule entry
  const existing = db.prepare(
    'SELECT id FROM course_sessions WHERE schedule_entry_id = ? AND date = ?'
  ).get(data.schedule_entry_id, data.date) as { id: number } | undefined;

  if (existing) {
    db.prepare(
      'UPDATE course_sessions SET attended = ?, notes = ? WHERE id = ?'
    ).run(data.attended ? 1 : 0, data.notes || '', existing.id);
  } else {
    db.prepare(
      'INSERT INTO course_sessions (course_id, schedule_entry_id, date, start_time, end_time, attended, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(data.course_id, data.schedule_entry_id, data.date, data.start_time, data.end_time, data.attended ? 1 : 0, data.notes || '');
  }
}

export function getAttendanceHistory(courseId?: number, limit?: number): AttendanceRecord[] {
  const db = getDatabase();
  let query = `
    SELECT cs.*, c.name AS course_name, c.color
    FROM course_sessions cs
    JOIN courses c ON cs.course_id = c.id
  `;
  const params: unknown[] = [];

  if (courseId) {
    query += ' WHERE cs.course_id = ?';
    params.push(courseId);
  }

  query += ' ORDER BY cs.date DESC, cs.start_time DESC';

  if (limit) {
    query += ' LIMIT ?';
    params.push(limit);
  }

  const rows = db.prepare(query).all(...params) as (Record<string, unknown>)[];
  return rows.map(row => ({
    ...row,
    attended: Boolean(row.attended),
  })) as unknown as AttendanceRecord[];
}
