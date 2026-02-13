import { ipcMain, BrowserWindow } from 'electron';
import { Channels } from './channels';
import { getAllSettings, getSetting, setSetting, resetSettings } from '../database/settings';

export function registerSettingsHandlers() {
  ipcMain.handle(Channels.SETTINGS_GET_ALL, () => {
    return getAllSettings();
  });

  ipcMain.handle(Channels.SETTINGS_GET, (_event, data) => {
    return getSetting(data.key);
  });

  ipcMain.handle(Channels.SETTINGS_SET, (_event, data) => {
    setSetting(data.key, data.value);
    // Broadcast setting change to all windows
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send(Channels.SETTING_UPDATE, { key: data.key, value: data.value });
    });
  });

  ipcMain.handle(Channels.SETTINGS_RESET, () => {
    resetSettings();
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send(Channels.SETTING_UPDATE, { key: '__reset__', value: '' });
    });
  });
}
