// IPC Channel name constants
export const Channels = {
  // Courses
  COURSES_LIST: 'db:courses:list',
  COURSES_ADD: 'db:courses:add',
  COURSES_UPDATE: 'db:courses:update',
  COURSES_DELETE: 'db:courses:delete',

  // Schedule
  SCHEDULE_LIST: 'db:schedule:list',
  SCHEDULE_BY_DAY: 'db:schedule:byDay',
  SCHEDULE_FOR_WEEK: 'db:schedule:forWeek',
  SCHEDULE_ADD: 'db:schedule:add',
  SCHEDULE_DELETE: 'db:schedule:delete',
  SCHEDULE_CHECK_CONFLICT: 'db:schedule:checkConflict',

  // Settings
  SETTINGS_GET_ALL: 'db:settings:getAll',
  SETTINGS_GET: 'db:settings:get',
  SETTINGS_SET: 'db:settings:set',
  SETTINGS_RESET: 'db:settings:reset',

  // Week
  WEEK_CURRENT: 'db:week:current',
  WEEK_SET_SEMESTER_START: 'db:week:setSemesterStart',

  // Statistics
  STATS_ALL: 'db:stats:all',
  ATTENDANCE_HISTORY: 'db:stats:attendance:history',
  ATTENDANCE_MARK: 'db:stats:attendance:mark',

  // Window
  TOPBAR_SETUP: 'window:topbar:setup',
  TOPBAR_RESIZE: 'window:topbar:resize',
  TOPBAR_TOGGLE: 'window:topbar:toggle',
  MAIN_TOGGLE: 'window:main:toggle',
  MAIN_SHOW: 'window:main:show',

  // Broadcasts (main → renderer)
  SETTING_UPDATE: 'setting-update',
  SCHEDULE_UPDATE: 'schedule-update',
} as const;
