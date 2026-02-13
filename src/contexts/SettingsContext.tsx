import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { settingsApi } from '../lib/ipc-client';
import type { Setting } from '../types/database';

interface SettingsContextType {
  settings: Record<string, string>;
  loading: boolean;
  setSetting: (key: string, value: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  loading: true,
  setSetting: async () => {},
});

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsApi.getAll().then((all: Setting[]) => {
      const map: Record<string, string> = {};
      for (const s of all) map[s.key] = s.value;
      setSettings(map);
      setLoading(false);
    });
  }, []);

  // Listen for setting updates from other windows
  useEffect(() => {
    if (!window.electronAPI) return;
    const unsub = window.electronAPI.on('setting-update', (data: unknown) => {
      const { key, value } = data as { key: string; value: string };
      if (key === '__reset__') {
        // Re-fetch all settings after reset
        settingsApi.getAll().then((all: Setting[]) => {
          const map: Record<string, string> = {};
          for (const s of all) map[s.key] = s.value;
          setSettings(map);
        });
      } else {
        setSettings(prev => ({ ...prev, [key]: value }));
      }
    });
    return unsub;
  }, []);

  // Apply theme and font size
  useEffect(() => {
    if (loading) return;

    // Theme mode
    const themeMode = settings.theme_mode || 'auto';
    if (themeMode === 'auto') {
      document.documentElement.removeAttribute('color-scheme');
    } else {
      document.documentElement.setAttribute('color-scheme', themeMode);
    }

    // Theme color
    const themeColor = settings.theme_color;
    if (themeColor) {
      document.documentElement.style.setProperty('--mdui-color-primary', themeColor);
    }

    // Font size
    const fontSize = settings.font_size || '16';
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [settings.theme_mode, settings.theme_color, settings.font_size, loading]);

  const handleSetSetting = useCallback(async (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    await settingsApi.set(key, value);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, setSetting: handleSetSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}
