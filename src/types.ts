export interface Service {
  id: string;
  name: string;
  command: string;
  workingDirectory: string;
  env?: Record<string, string>;
  status: 'running' | 'stopped';
  autoStart?: boolean;
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
