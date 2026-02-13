import { Notification } from 'electron';
import { getScheduleByDay, getCurrentWeek } from './database/schedule';
import { getSetting } from './database/settings';

let reminderInterval: ReturnType<typeof setInterval> | null = null;
const notifiedSet = new Set<string>();

// Clear notified set at midnight
function scheduleMidnightReset() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const msUntilMidnight = tomorrow.getTime() - now.getTime();

  setTimeout(() => {
    notifiedSet.clear();
    scheduleMidnightReset();
  }, msUntilMidnight);
}

function checkAndNotify() {
  const enabled = getSetting('notification_enabled');
  if (enabled === 'false') return;

  const minutesBefore = parseInt(getSetting('notification_minutes') || '10') || 10;

  const weekInfo = getCurrentWeek();
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
  const todaySchedule = getScheduleByDay(dayOfWeek, weekInfo.week);

  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const reminderSeconds = minutesBefore * 60;

  for (const entry of todaySchedule) {
    const [h, m] = entry.start_time.split(':').map(Number);
    const startSeconds = h * 3600 + m * 60;
    const diff = startSeconds - currentSeconds;

    // Notify if within the reminder window (0 to reminderSeconds before start)
    if (diff > 0 && diff <= reminderSeconds) {
      const key = `${entry.id}-${now.toDateString()}`;
      if (!notifiedSet.has(key)) {
        notifiedSet.add(key);
        const notification = new Notification({
          title: '课程提醒',
          body: `${entry.course_name} 将在 ${Math.ceil(diff / 60)} 分钟后开始${entry.location ? ` (${entry.location})` : ''}`,
        });
        notification.show();
      }
    }
  }
}

export function startReminderService() {
  scheduleMidnightReset();
  // Check every 60 seconds
  reminderInterval = setInterval(checkAndNotify, 60000);
  // Initial check
  setTimeout(checkAndNotify, 3000);
}

export function stopReminderService() {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
}
