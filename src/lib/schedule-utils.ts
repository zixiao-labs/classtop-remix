/** Format time as HH:MM */
export function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Parse time string "HH:MM" to { hour, minute } */
export function parseTime(timeStr: string): { hour: number; minute: number } {
  const [hour, minute] = timeStr.split(':').map(Number);
  return { hour, minute };
}

/** Time difference in minutes */
export function getTimeDiff(startTime: string, endTime: string): number {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  return (end.hour - start.hour) * 60 + (end.minute - start.minute);
}

/** Generate time slots for the grid */
export function generateTimeSlots(startHour = 8, endHour = 22): { time: string; label: string }[] {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push({
      time: formatTime(hour, 0),
      label: `${hour}:00`,
    });
  }
  return slots;
}

/** Get today's weekday (1=Mon, 7=Sun) */
export function getTodayWeekday(): number {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

/** Generate week options for selector */
export function generateWeekOptions(totalWeeks = 20): { value: number; label: string }[] {
  return Array.from({ length: totalWeeks }, (_, i) => ({
    value: i + 1,
    label: `第${i + 1}周`,
  }));
}

/** Calculate course position in grid */
export function calculateCoursePosition(
  startTime: string,
  endTime: string,
  gridStartHour = 8,
  hourHeight = 60,
): { top: number; height: number } {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const top = ((start.hour - gridStartHour) * 60 + start.minute) * (hourHeight / 60);
  const height = ((end.hour - start.hour) * 60 + (end.minute - start.minute)) * (hourHeight / 60);
  return { top, height };
}

/** Group schedule entries by day of week */
export function groupScheduleByDay<T extends { day_of_week: number; start_time: string }>(
  schedule: T[],
): Record<number, T[]> {
  const grouped: Record<number, T[]> = {};
  for (let day = 1; day <= 7; day++) {
    grouped[day] = [];
  }
  for (const item of schedule) {
    if (grouped[item.day_of_week]) {
      grouped[item.day_of_week].push(item);
    }
  }
  // Sort each day by start time
  for (const day of Object.keys(grouped)) {
    grouped[Number(day)].sort((a, b) => {
      const ta = parseTime(a.start_time);
      const tb = parseTime(b.start_time);
      return (ta.hour * 60 + ta.minute) - (tb.hour * 60 + tb.minute);
    });
  }
  return grouped;
}

/** Find current class from sorted list */
export function findCurrentClass<T extends { start_time: string; end_time: string }>(
  classes: T[],
  currentTime?: Date,
): T | null {
  if (!classes || classes.length === 0) return null;
  const now = currentTime || new Date();
  const timeStr = formatTime(now.getHours(), now.getMinutes());
  for (const cls of classes) {
    if (cls.start_time <= timeStr && cls.end_time > timeStr) return cls;
  }
  return null;
}

/** Find next class from sorted list */
export function findNextClass<T extends { start_time: string }>(
  classes: T[],
  currentTime?: Date,
): T | null {
  if (!classes || classes.length === 0) return null;
  const now = currentTime || new Date();
  const timeStr = formatTime(now.getHours(), now.getMinutes());
  for (const cls of classes) {
    if (cls.start_time > timeStr) return cls;
  }
  return null;
}

/** Find last ended class */
export function findLastClass<T extends { end_time: string }>(
  classes: T[],
  currentTime?: Date,
): T | null {
  if (!classes || classes.length === 0) return null;
  const now = currentTime || new Date();
  const timeStr = formatTime(now.getHours(), now.getMinutes());
  let last: T | null = null;
  for (const cls of classes) {
    if (cls.end_time <= timeStr) last = cls;
    else break;
  }
  return last;
}

/** Find next class across the whole week */
export function findNextClassAcrossWeek<T extends { day_of_week: number; start_time: string }>(
  weekSchedule: T[],
  currentDayOfWeek: number,
  currentTime?: Date,
): T | null {
  if (!weekSchedule || weekSchedule.length === 0) return null;

  // Check today's remaining classes
  const todayClasses = weekSchedule.filter(cls => cls.day_of_week === currentDayOfWeek);
  const nextToday = findNextClass(todayClasses, currentTime);
  if (nextToday) return nextToday;

  // Check following days
  for (let offset = 1; offset < 7; offset++) {
    const targetDay = ((currentDayOfWeek - 1 + offset) % 7) + 1;
    const dayClasses = weekSchedule.filter(cls => cls.day_of_week === targetDay);
    if (dayClasses.length > 0) return dayClasses[0];
  }
  return null;
}

/** Calculate course progress (0 to 1) */
export function calculateCourseProgress(
  startTime: string,
  endTime: string,
  currentTime?: Date,
): number {
  const now = currentTime || new Date();
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const startSeconds = startHour * 3600 + startMin * 60;
  const endSeconds = endHour * 3600 + endMin * 60;
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  if (currentSeconds < startSeconds) return 0;
  if (currentSeconds >= endSeconds) return 1;
  return (currentSeconds - startSeconds) / (endSeconds - startSeconds);
}

/** Parse weeks input string like "1-8,10,12-16" to array */
export function parseWeeksInput(input: string): number[] {
  const weeks: number[] = [];
  const parts = input.split(',');
  for (const part of parts) {
    const range = part.trim();
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(Number);
      for (let i = start; i <= end; i++) weeks.push(i);
    } else {
      const week = parseInt(range);
      if (!isNaN(week)) weeks.push(week);
    }
  }
  return [...new Set(weeks)].sort((a, b) => a - b);
}

/** Format weeks array to human-readable string */
export function formatWeeksForInput(weeks: number[]): string {
  if (!weeks || weeks.length === 0) return '';
  const sorted = [...weeks].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = end = sorted[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(',');
}

/** Format remaining seconds to human-readable string */
export function formatRemainingTime(seconds: number): string {
  seconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}小时${minutes}分钟`;
  if (minutes > 0) return `${minutes}分${secs}秒`;
  return `${secs}秒`;
}

/** Convert time string to total seconds */
export function timeToSeconds(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 3600 + m * 60;
}

/** Convert total minutes to time string */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(Math.min(hours, 23)).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}
