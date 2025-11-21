import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
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
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: process.env.NODE_ENV === 'development', // Only allow DevTools in development
    },
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    // Don't auto-open DevTools
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
  
  // Prevent opening DevTools with keyboard shortcuts
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (
      input.key === 'F12' ||
      (input.control && input.shift && input.key === 'I') ||
      (input.control && input.shift && input.key === 'J') ||
      (input.control && input.shift && input.key === 'C')
    ) {
      event.preventDefault();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
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
      await serviceManager.start(serviceId, config, (sId: string, data: any) => {
        mainWindow?.webContents.send('service:output', { serviceId: sId, data });
      });
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
      await serviceManager.start(serviceId, config, (sId: string, data: any) => {
        mainWindow?.webContents.send('service:output', { serviceId: sId, data });
      });
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
      console.error('No main window available for dialog');
      return null;
    }
    
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'Select Working Directory',
      });
      console.log('Dialog result:', result);
      return result.canceled ? null : result.filePaths[0];
    } catch (error) {
      console.error('Error opening dialog:', error);
      return null;
    }
  });
}
