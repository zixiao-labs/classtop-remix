// Color presets
export const courseColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA5E9', '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E',
  '#6C63FF', '#00B8A9', '#F8B500', '#F53B57', '#3C40C6',
];

// Day names
export const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// Default settings
export const defaultSettings: Record<string, string> = {
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

// Grid constants
export const GRID_START_HOUR = 8;
export const GRID_END_HOUR = 22;
export const HOUR_HEIGHT = 60; // pixels per hour
