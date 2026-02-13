import { app, BrowserWindow } from 'electron';
import { getDatabase, closeDatabase } from './database/connection';
import { registerAllHandlers } from './ipc/register-all';
import { createMainWindow, createTopBarWindow, getMainWindow } from './windows/main-window';
import { setupTray } from './tray';
import { startReminderService, stopReminderService } from './notifications';

app.whenReady().then(() => {
  // Initialize database
  getDatabase();

  // Register all IPC handlers
  registerAllHandlers();

  // Create windows
  createMainWindow();
  createTopBarWindow();

  // Setup system tray
  setupTray();

  // Start notification reminder service
  startReminderService();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
      createTopBarWindow();
    } else {
      const main = getMainWindow();
      if (main) {
        main.show();
        main.focus();
      }
    }
  });
});

app.on('before-quit', () => {
  stopReminderService();
  closeDatabase();
  // Remove close handler so windows actually close
  const main = getMainWindow();
  if (main) {
    main.removeAllListeners('close');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
