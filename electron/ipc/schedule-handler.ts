import { ipcMain, BrowserWindow } from 'electron';
import { Channels } from './channels';
import {
  getSchedule,
  getScheduleByDay,
  getScheduleForWeek,
  addScheduleEntry,
  deleteScheduleEntry,
  checkConflicts,
  getCurrentWeek,
  calculateWeekNumber,
} from '../database/schedule';
import { setSetting } from '../database/settings';

function broadcastScheduleUpdate() {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send(Channels.SCHEDULE_UPDATE);
  });
}

export function registerScheduleHandlers() {
  ipcMain.handle(Channels.SCHEDULE_LIST, (_event, data) => {
    return getSchedule(data?.week);
  });

  ipcMain.handle(Channels.SCHEDULE_BY_DAY, (_event, data) => {
    return getScheduleByDay(data.day_of_week, data.week);
  });

  ipcMain.handle(Channels.SCHEDULE_FOR_WEEK, (_event, data) => {
    return getScheduleForWeek(data?.week);
  });

  ipcMain.handle(Channels.SCHEDULE_ADD, (_event, data) => {
    const entry = addScheduleEntry(data);
    broadcastScheduleUpdate();
    return entry;
  });

  ipcMain.handle(Channels.SCHEDULE_DELETE, (_event, data) => {
    deleteScheduleEntry(data.id);
    broadcastScheduleUpdate();
  });

  ipcMain.handle(Channels.SCHEDULE_CHECK_CONFLICT, (_event, data) => {
    return checkConflicts(data.day_of_week, data.start_time, data.end_time, data.weeks, data.exclude_entry_id);
  });

  ipcMain.handle(Channels.WEEK_CURRENT, () => {
    return getCurrentWeek();
  });

  ipcMain.handle(Channels.WEEK_SET_SEMESTER_START, (_event, data) => {
    setSetting('semester_start_date', data.date);
    if (data.date) {
      const week = calculateWeekNumber(data.date);
      BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send(Channels.SETTING_UPDATE, { key: 'semester_start_date', value: data.date });
      });
      return { success: true, calculated_week: week };
    }
    return { success: true };
  });
}
