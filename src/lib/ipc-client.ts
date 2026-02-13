import type { IpcChannelMap } from '../types/ipc';

// Type-safe IPC invoke helper
async function invoke<K extends keyof IpcChannelMap>(
  channel: K,
  ...args: IpcChannelMap[K]['request'] extends void ? [] : [IpcChannelMap[K]['request']]
): Promise<IpcChannelMap[K]['response']> {
  return window.electronAPI.invoke(channel, ...args) as Promise<IpcChannelMap[K]['response']>;
}

// ─── Course API ─────────────────────────────────────────────────
export const courseApi = {
  list: () => invoke('db:courses:list'),
  add: (data: IpcChannelMap['db:courses:add']['request']) => invoke('db:courses:add', data),
  update: (data: IpcChannelMap['db:courses:update']['request']) => invoke('db:courses:update', data),
  delete: (id: number) => invoke('db:courses:delete', { id }),
};

// ─── Schedule API ───────────────────────────────────────────────
export const scheduleApi = {
  list: (week?: number | null) => invoke('db:schedule:list', { week }),
  byDay: (dayOfWeek: number, week?: number | null) => invoke('db:schedule:byDay', { day_of_week: dayOfWeek, week }),
  forWeek: (week?: number | null) => invoke('db:schedule:forWeek', { week }),
  add: (data: IpcChannelMap['db:schedule:add']['request']) => invoke('db:schedule:add', data),
  delete: (id: number) => invoke('db:schedule:delete', { id }),
  checkConflict: (data: IpcChannelMap['db:schedule:checkConflict']['request']) => invoke('db:schedule:checkConflict', data),
};

// ─── Settings API ───────────────────────────────────────────────
export const settingsApi = {
  getAll: () => invoke('db:settings:getAll'),
  get: (key: string) => invoke('db:settings:get', { key }),
  set: (key: string, value: string) => invoke('db:settings:set', { key, value }),
  reset: () => invoke('db:settings:reset'),
};

// ─── Week API ───────────────────────────────────────────────────
export const weekApi = {
  current: () => invoke('db:week:current'),
  setSemesterStart: (date: string) => invoke('db:week:setSemesterStart', { date }),
};

// ─── Statistics API ─────────────────────────────────────────────
export const statsApi = {
  all: () => invoke('db:stats:all'),
  attendanceHistory: (courseId?: number, limit?: number) => invoke('db:stats:attendance:history', { course_id: courseId, limit }),
  markAttendance: (data: IpcChannelMap['db:stats:attendance:mark']['request']) => invoke('db:stats:attendance:mark', data),
};

// ─── Window API ─────────────────────────────────────────────────
export const windowApi = {
  topbarSetup: (height: number) => invoke('window:topbar:setup', { height }),
  topbarResize: (width: number, height: number) => invoke('window:topbar:resize', { width, height }),
  topbarToggle: () => invoke('window:topbar:toggle'),
  mainToggle: () => invoke('window:main:toggle'),
  mainShow: () => invoke('window:main:show'),
};
