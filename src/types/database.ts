/** 课程 */
export interface Course {
  id: number;
  name: string;
  teacher: string;
  location: string;
  color: string;
  created_at: string;
}

/** 课表条目 */
export interface ScheduleEntry {
  id: number;
  course_id: number;
  day_of_week: number; // 1-7
  start_time: string;  // HH:MM
  end_time: string;    // HH:MM
  weeks: number[];     // JSON array stored as string in DB
  note: string;
}

/** 课表条目 + 课程信息（JOIN 查询结果） */
export interface ScheduleWithCourse extends ScheduleEntry {
  course_name: string;
  teacher: string;
  location: string;
  color: string;
}

/** 出勤记录 */
export interface CourseSession {
  id: number;
  course_id: number;
  schedule_entry_id: number;
  date: string;        // YYYY-MM-DD
  start_time: string;
  end_time: string;
  attended: boolean;
  notes: string;
  created_at: string;
}

/** 设置键值对 */
export interface Setting {
  key: string;
  value: string;
}

/** 所有设置项的类型映射 */
export interface SettingsMap {
  theme_mode: 'auto' | 'light' | 'dark';
  theme_color: string;
  font_size: string;
  topbar_height: string;
  semester_start_date: string;
  total_weeks: string;
  notification_enabled: string;
  notification_minutes: string;
  notification_sound: string;
}

/** 冲突检查结果 */
export interface ConflictResult {
  has_conflict: boolean;
  conflicts: ScheduleWithCourse[];
}

/** 统计数据 */
export interface Statistics {
  total_courses: number;
  total_hours: number;
  attendance_rate: number;
  weekly_hours: number;
  busiest_day: string;
  time_distribution: Record<string, number>;
}

/** 周信息 */
export interface WeekInfo {
  week: number;
  semester_start_date: string;
  is_calculated: boolean;
}

/** 出勤记录（带课程信息） */
export interface AttendanceRecord extends CourseSession {
  course_name: string;
  color: string;
}
