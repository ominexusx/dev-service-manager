import { contextBridge, ipcRenderer } from 'electron';

export interface ServiceConfig {
  id: string;
  name: string;
  command: string;
  workingDirectory: string;
  env?: Record<string, string>;
}

export interface ServiceOutput {
  serviceId: string;
  data: {
    type: 'stdout' | 'stderr' | 'info' | 'error';
    text: string;
    timestamp: number;
  };
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

  // Event listeners
  onServiceOutput: (callback: (data: ServiceOutput) => void) => {
    const subscription = (_: any, data: ServiceOutput) => callback(data);
    ipcRenderer.on('service:output', subscription);
    return () => {
      ipcRenderer.removeListener('service:output', subscription);
    };
  },
});
