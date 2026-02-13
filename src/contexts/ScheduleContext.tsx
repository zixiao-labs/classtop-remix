import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { weekApi } from '../lib/ipc-client';

interface ScheduleContextType {
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const ScheduleContext = createContext<ScheduleContextType>({
  currentWeek: 1,
  setCurrentWeek: () => {},
  refreshKey: 0,
  triggerRefresh: () => {},
});

export function useSchedule() {
  return useContext(ScheduleContext);
}

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    weekApi.current().then(info => {
      setCurrentWeek(info.week);
    });
  }, []);

  // Listen for schedule updates from other windows
  useEffect(() => {
    if (!window.electronAPI) return;
    const unsub = window.electronAPI.on('schedule-update', () => {
      setRefreshKey(k => k + 1);
    });
    return unsub;
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <ScheduleContext.Provider value={{ currentWeek, setCurrentWeek, refreshKey, triggerRefresh }}>
      {children}
    </ScheduleContext.Provider>
  );
}
