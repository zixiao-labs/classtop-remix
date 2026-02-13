import { ipcMain, screen } from 'electron';
import { Channels } from './channels';
import { getTopBarWindow, getMainWindow } from '../windows/main-window';

export function registerWindowHandlers() {
  ipcMain.handle(Channels.TOPBAR_SETUP, (_event, data) => {
    const topbar = getTopBarWindow();
    if (topbar) {
      const { width } = screen.getPrimaryDisplay().workAreaSize;
      topbar.setBounds({ x: 0, y: 0, width, height: data.height });
    }
  });

  ipcMain.handle(Channels.TOPBAR_RESIZE, (_event, data) => {
    const topbar = getTopBarWindow();
    if (topbar) {
      topbar.setSize(data.width, data.height);
    }
  });

  ipcMain.handle(Channels.TOPBAR_TOGGLE, () => {
    const topbar = getTopBarWindow();
    if (topbar) {
      if (topbar.isVisible()) {
        topbar.hide();
      } else {
        topbar.show();
      }
    }
  });

  ipcMain.handle(Channels.MAIN_TOGGLE, () => {
    const main = getMainWindow();
    if (main) {
      if (main.isVisible()) {
        main.hide();
      } else {
        main.show();
        main.focus();
      }
    }
  });

  ipcMain.handle(Channels.MAIN_SHOW, () => {
    const main = getMainWindow();
    if (main) {
      main.show();
      main.focus();
    }
  });
}
