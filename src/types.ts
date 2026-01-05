export interface Service {
  id: string;
  name: string;
  command: string;
  workingDirectory: string;
  env?: Record<string, string>;
  status: 'running' | 'stopped' | 'error';
  autoStart?: boolean;
  group?: string;
  port?: number;
  autoRestart?: boolean;
  color?: string;
}

export interface ServiceGroup {
  id: string;
  name: string;
  color: string;
  collapsed?: boolean;
}

export interface LogEntry {
  type: 'stdout' | 'stderr' | 'info' | 'error';
  text: string;
  timestamp: number;
}

export interface ServiceOutput {
  serviceId: string;
  data: LogEntry;
}

export interface ServiceHealth {
  serviceId: string;
  portReachable: boolean;
  lastChecked: number;
}

// Beingnexus preset services
export interface ServicePreset {
  name: string;
  command: string;
  workingDirectory: string;
  port?: number;
  group: string;
  env?: Record<string, string>;
}

