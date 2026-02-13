import type {
  Course,
  ScheduleEntry,
  ScheduleWithCourse,
  ConflictResult,
  Statistics,
  WeekInfo,
  AttendanceRecord,
  Setting,
} from './database';

// ─── Course Channels ────────────────────────────────────────────
export type CourseListResponse = Course[];
export type CourseAddRequest = Omit<Course, 'id' | 'created_at'>;
export type CourseAddResponse = Course;
export type CourseUpdateRequest = Partial<Omit<Course, 'id' | 'created_at'>> & { id: number };
export type CourseDeleteRequest = { id: number };

// ─── Schedule Channels ──────────────────────────────────────────
export type ScheduleListRequest = { week?: number | null };
export type ScheduleListResponse = ScheduleWithCourse[];
export type ScheduleByDayRequest = { day_of_week: number; week?: number | null };
export type ScheduleForWeekRequest = { week?: number | null };
export type ScheduleAddRequest = Omit<ScheduleEntry, 'id'>;
export type ScheduleDeleteRequest = { id: number };
export type ScheduleConflictRequest = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  weeks?: number[] | null;
  exclude_entry_id?: number | null;
};

// ─── Settings Channels ──────────────────────────────────────────
export type SettingsGetAllResponse = Setting[];
export type SettingsGetRequest = { key: string };
export type SettingsSetRequest = { key: string; value: string };
export type SettingsResetResponse = void;

// ─── Week Channels ──────────────────────────────────────────────
export type WeekCurrentResponse = WeekInfo;
export type WeekSetSemesterStartRequest = { date: string };
export type WeekSetSemesterStartResponse = { success: boolean; calculated_week?: number };

// ─── Statistics Channels ────────────────────────────────────────
export type StatsAllResponse = Statistics;
export type AttendanceHistoryRequest = { course_id?: number; limit?: number };
export type AttendanceHistoryResponse = AttendanceRecord[];
export type AttendanceMarkRequest = {
  course_id: number;
  schedule_entry_id: number;
  date: string;
  start_time: string;
  end_time: string;
  attended: boolean;
  notes?: string;
};

// ─── Window Channels ────────────────────────────────────────────
export type TopBarSetupRequest = { height: number };
export type TopBarResizeRequest = { width: number; height: number };

// ─── IPC Channel Map (for type-safe invoke) ─────────────────────
export interface IpcChannelMap {
  // Courses
  'db:courses:list': { request: void; response: CourseListResponse };
  'db:courses:add': { request: CourseAddRequest; response: CourseAddResponse };
  'db:courses:update': { request: CourseUpdateRequest; response: void };
  'db:courses:delete': { request: CourseDeleteRequest; response: void };
  // Schedule
  'db:schedule:list': { request: ScheduleListRequest; response: ScheduleListResponse };
  'db:schedule:byDay': { request: ScheduleByDayRequest; response: ScheduleListResponse };
  'db:schedule:forWeek': { request: ScheduleForWeekRequest; response: ScheduleListResponse };
  'db:schedule:add': { request: ScheduleAddRequest; response: ScheduleEntry };
  'db:schedule:delete': { request: ScheduleDeleteRequest; response: void };
  'db:schedule:checkConflict': { request: ScheduleConflictRequest; response: ConflictResult };
  // Settings
  'db:settings:getAll': { request: void; response: SettingsGetAllResponse };
  'db:settings:get': { request: SettingsGetRequest; response: string };
  'db:settings:set': { request: SettingsSetRequest; response: void };
  'db:settings:reset': { request: void; response: SettingsResetResponse };
  // Week
  'db:week:current': { request: void; response: WeekCurrentResponse };
  'db:week:setSemesterStart': { request: WeekSetSemesterStartRequest; response: WeekSetSemesterStartResponse };
  // Statistics
  'db:stats:all': { request: void; response: StatsAllResponse };
  'db:stats:attendance:history': { request: AttendanceHistoryRequest; response: AttendanceHistoryResponse };
  'db:stats:attendance:mark': { request: AttendanceMarkRequest; response: void };
  // Window
  'window:topbar:setup': { request: TopBarSetupRequest; response: void };
  'window:topbar:resize': { request: TopBarResizeRequest; response: void };
  'window:topbar:toggle': { request: void; response: void };
  'window:main:toggle': { request: void; response: void };
  'window:main:show': { request: void; response: void };
}
