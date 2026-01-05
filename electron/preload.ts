import { contextBridge, ipcRenderer } from 'electron';

export interface ServiceConfig {
  id: string;
  name: string;
  command: string;
  workingDirectory: string;
  env?: Record<string, string>;
  port?: number;
  group?: string;
  autoRestart?: boolean;
}

export interface ServiceOutput {
  serviceId: string;
  data: {
    type: 'stdout' | 'stderr' | 'info' | 'error';
    text: string;
    timestamp: number;
  };
}

export interface ServiceExitData {
  serviceId: string;
  code: number | null;
}

contextBridge.exposeInMainWorld('electronAPI', {
  // Service management
  startService: (serviceId: string, config: ServiceConfig) =>
    ipcRenderer.invoke('service:start', serviceId, config),

  stopService: (serviceId: string) =>
    ipcRenderer.invoke('service:stop', serviceId),

  restartService: (serviceId: string, config: ServiceConfig) =>
    ipcRenderer.invoke('service:restart', serviceId, config),

  getServiceStatus: (serviceId: string) =>
    ipcRenderer.invoke('service:status', serviceId),

  stopAllServices: () =>
    ipcRenderer.invoke('service:stopAll'),

  // Dialog
  selectDirectory: () =>
    ipcRenderer.invoke('dialog:selectDirectory'),

  // File operations
  saveFile: (content: string, filename: string) =>
    ipcRenderer.invoke('dialog:saveFile', content, filename),

  openFile: () =>
    ipcRenderer.invoke('dialog:openFile'),

  // Event listeners
  onServiceOutput: (callback: (data: ServiceOutput) => void) => {
    const subscription = (_: any, data: ServiceOutput) => callback(data);
    ipcRenderer.on('service:output', subscription);
    return () => {
      ipcRenderer.removeListener('service:output', subscription);
    };
  },

  onServiceExit: (callback: (data: ServiceExitData) => void) => {
    const subscription = (_: any, data: ServiceExitData) => callback(data);
    ipcRenderer.on('service:exit', subscription);
    return () => {
      ipcRenderer.removeListener('service:exit', subscription);
    };
  },
});
