import { Tray, Menu, nativeImage, app } from 'electron';
import { getMainWindow, getTopBarWindow } from './windows/main-window';

let tray: Tray | null = null;

export function setupTray() {
  // Use a simple 16x16 icon. In production, bundle a proper icon.
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('ClassTop');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        const main = getMainWindow();
        if (main) {
          main.show();
          main.focus();
        }
      },
    },
    {
      label: '切换 TopBar',
      click: () => {
        const topbar = getTopBarWindow();
        if (topbar) {
          if (topbar.isVisible()) topbar.hide();
          else topbar.show();
        }
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        // Remove close handlers so windows actually close
        const main = getMainWindow();
        if (main) main.removeAllListeners('close');
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    const main = getMainWindow();
    if (main) {
      if (main.isVisible()) {
        main.focus();
      } else {
        main.show();
        main.focus();
      }
    }
  });
}

export function destroyTray() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
