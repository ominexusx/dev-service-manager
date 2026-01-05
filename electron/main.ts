import { app, BrowserWindow, ipcMain, dialog, Notification } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { ServiceManager } from './serviceManager';

let mainWindow: BrowserWindow | null = null;
const serviceManager = new ServiceManager();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0f172a',
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: process.env.NODE_ENV === 'development',
    },
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  }

  // Prevent opening DevTools with keyboard shortcuts in production
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (process.env.NODE_ENV !== 'development') {
      if (
        input.key === 'F12' ||
        (input.control && input.shift && input.key === 'I') ||
        (input.control && input.shift && input.key === 'J') ||
        (input.control && input.shift && input.key === 'C')
      ) {
        event.preventDefault();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Show notification
function showNotification(title: string, body: string) {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
}

app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  serviceManager.stopAll();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  serviceManager.stopAll();
});

function setupIpcHandlers() {
  // Start a service
  ipcMain.handle('service:start', async (_, serviceId: string, config: any) => {
    try {
      await serviceManager.start(
        serviceId,
        config,
        (sId: string, data: any) => {
          mainWindow?.webContents.send('service:output', { serviceId: sId, data });
        },
        (sId: string, code: number | null) => {
          mainWindow?.webContents.send('service:exit', { serviceId: sId, code });
          // Show notification on crash
          if (code !== 0 && code !== null) {
            showNotification(
              'Service Crashed',
              `${config.name} exited with code ${code}`
            );
          }
        }
      );
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Stop a service
  ipcMain.handle('service:stop', async (_, serviceId: string) => {
    try {
      await serviceManager.stop(serviceId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Restart a service
  ipcMain.handle('service:restart', async (_, serviceId: string, config: any) => {
    try {
      await serviceManager.stop(serviceId);
      await new Promise(resolve => setTimeout(resolve, 500));
      await serviceManager.start(
        serviceId,
        config,
        (sId: string, data: any) => {
          mainWindow?.webContents.send('service:output', { serviceId: sId, data });
        },
        (sId: string, code: number | null) => {
          mainWindow?.webContents.send('service:exit', { serviceId: sId, code });
        }
      );
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Get service status
  ipcMain.handle('service:status', async (_, serviceId: string) => {
    return serviceManager.getStatus(serviceId);
  });

  // Stop all services
  ipcMain.handle('service:stopAll', async () => {
    try {
      serviceManager.stopAll();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Select directory
  ipcMain.handle('dialog:selectDirectory', async () => {
    if (!mainWindow) {
      return null;
    }

    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'Select Working Directory',
      });
      return result.canceled ? null : result.filePaths[0];
    } catch (error) {
      console.error('Error opening dialog:', error);
      return null;
    }
  });

  // Save file dialog
  ipcMain.handle('dialog:saveFile', async (_, content: string, defaultName: string) => {
    if (!mainWindow) {
      return false;
    }

    try {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Configuration',
        defaultPath: defaultName,
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, content, 'utf-8');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving file:', error);
      return false;
    }
  });

  // Open file dialog
  ipcMain.handle('dialog:openFile', async () => {
    if (!mainWindow) {
      return null;
    }

    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Import Configuration',
        properties: ['openFile'],
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const content = fs.readFileSync(result.filePaths[0], 'utf-8');
        return content;
      }
      return null;
    } catch (error) {
      console.error('Error opening file:', error);
      return null;
    }
  });
}
