import { registerCoursesHandlers } from './courses-handler';
import { registerScheduleHandlers } from './schedule-handler';
import { registerSettingsHandlers } from './settings-handler';
import { registerStatisticsHandlers } from './statistics-handler';
import { registerWindowHandlers } from './window-handler';

export function registerAllHandlers() {
  registerCoursesHandlers();
  registerScheduleHandlers();
  registerSettingsHandlers();
  registerStatisticsHandlers();
  registerWindowHandlers();
}
