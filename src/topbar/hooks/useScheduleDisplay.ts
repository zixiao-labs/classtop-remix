import { useState, useEffect, useRef, useCallback } from 'react';
import { scheduleApi, weekApi } from '../../lib/ipc-client';
import {
  findCurrentClass,
  findNextClass,
  findLastClass,
  findNextClassAcrossWeek,
  getTodayWeekday,
  formatRemainingTime,
  timeToSeconds,
} from '../../lib/schedule-utils';
import { weekDays } from '../../lib/constants';
import type { ScheduleWithCourse } from '../../types/database';

interface DisplayState {
  displayText: string;
  progress: number;
  isBreakTime: boolean;
}

export function useScheduleDisplay(): DisplayState {
  const [state, setState] = useState<DisplayState>({
    displayText: '暂无课程',
    progress: 0,
    isBreakTime: false,
  });

  const todayScheduleRef = useRef<ScheduleWithCourse[]>([]);
  const weekScheduleRef = useRef<ScheduleWithCourse[]>([]);

  const loadScheduleData = useCallback(async () => {
    try {
      const weekInfo = await weekApi.current();
      const today = getTodayWeekday();
      const [todayData, weekData] = await Promise.all([
        scheduleApi.byDay(today, weekInfo.week),
        scheduleApi.forWeek(weekInfo.week),
      ]);
      todayScheduleRef.current = todayData;
      weekScheduleRef.current = weekData;
    } catch (error) {
      console.error('Failed to load schedule data:', error);
    }
  }, []);

  const updateDisplay = useCallback(() => {
    const now = new Date();
    const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const todayClasses = todayScheduleRef.current;
    const weekClasses = weekScheduleRef.current;

    const current = findCurrentClass(todayClasses, now);
    const todayNext = findNextClass(todayClasses, now);
    const todayWeekday = getTodayWeekday();
    const nextAcrossWeek = findNextClassAcrossWeek(weekClasses, todayWeekday, now);

    if (current) {
      // Currently in class
      const startSeconds = timeToSeconds(current.start_time);
      const endSeconds = timeToSeconds(current.end_time);
      const progress = Math.min(1, Math.max(0, (currentSeconds - startSeconds) / (endSeconds - startSeconds)));

      const locationText = current.location ? ` @ ${current.location}` : '';
      setState({
        displayText: `${current.course_name}${locationText} (${current.start_time}-${current.end_time})`,
        progress,
        isBreakTime: false,
      });
    } else if (todayNext) {
      // Break time - next class today
      const remainingSeconds = timeToSeconds(todayNext.start_time) - currentSeconds;
      const last = findLastClass(todayClasses, now);

      let progress = 0;
      if (last) {
        const breakStart = timeToSeconds(last.end_time);
        const breakEnd = timeToSeconds(todayNext.start_time);
        const breakDuration = breakEnd - breakStart;
        if (breakDuration > 0) {
          progress = Math.max(0, (breakDuration - (currentSeconds - breakStart)) / breakDuration);
        }
      }

      const nextLocation = todayNext.location ? ` @ ${todayNext.location}` : '';
      setState({
        displayText: `下一节: ${todayNext.course_name}${nextLocation} (${formatRemainingTime(remainingSeconds)}后)`,
        progress,
        isBreakTime: true,
      });
    } else if (nextAcrossWeek && nextAcrossWeek.day_of_week !== todayWeekday) {
      // Today's classes ended, show next day's class
      const dayName = weekDays[nextAcrossWeek.day_of_week - 1] || '未知';
      setState({
        displayText: `今日课程结束 - 下一节: ${dayName} ${nextAcrossWeek.course_name}`,
        progress: 0,
        isBreakTime: false,
      });
    } else {
      setState({
        displayText: '今日无课程安排',
        progress: 0,
        isBreakTime: false,
      });
    }
  }, []);

  // Load data initially and every 10 seconds
  useEffect(() => {
    loadScheduleData();
    const dataTimer = setInterval(loadScheduleData, 10000);
    return () => clearInterval(dataTimer);
  }, [loadScheduleData]);

  // Update display every second
  useEffect(() => {
    updateDisplay();
    const displayTimer = setInterval(updateDisplay, 1000);
    return () => clearInterval(displayTimer);
  }, [updateDisplay]);

  // Listen for schedule updates
  useEffect(() => {
    if (!window.electronAPI) return;
    const unsub = window.electronAPI.on('schedule-update', () => {
      loadScheduleData();
    });
    return unsub;
  }, [loadScheduleData]);

  return state;
}
