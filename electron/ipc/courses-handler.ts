import { ipcMain } from 'electron';
import { Channels } from './channels';
import { getCourses, addCourse, updateCourse, deleteCourse } from '../database/courses';

export function registerCoursesHandlers() {
  ipcMain.handle(Channels.COURSES_LIST, () => {
    return getCourses();
  });

  ipcMain.handle(Channels.COURSES_ADD, (_event, data) => {
    return addCourse(data);
  });

  ipcMain.handle(Channels.COURSES_UPDATE, (_event, data) => {
    updateCourse(data);
  });

  ipcMain.handle(Channels.COURSES_DELETE, (_event, data) => {
    deleteCourse(data.id);
  });
}
