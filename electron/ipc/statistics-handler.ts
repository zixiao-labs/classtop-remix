import { ipcMain } from 'electron';
import { Channels } from './channels';
import { calculateAllStatistics, getAttendanceHistory, markAttendance } from '../database/statistics';

export function registerStatisticsHandlers() {
  ipcMain.handle(Channels.STATS_ALL, () => {
    return calculateAllStatistics();
  });

  ipcMain.handle(Channels.ATTENDANCE_HISTORY, (_event, data) => {
    return getAttendanceHistory(data?.course_id, data?.limit);
  });

  ipcMain.handle(Channels.ATTENDANCE_MARK, (_event, data) => {
    markAttendance(data);
  });
}
