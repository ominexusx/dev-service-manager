import { spawn, ChildProcess } from 'child_process';

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

export interface OutputData {
  type: 'stdout' | 'stderr' | 'info' | 'error';
  text: string;
  timestamp: number;
}

export type OutputCallback = (serviceId: string, data: OutputData) => void;
export type ExitCallback = (serviceId: string, code: number | null) => void;

interface ServiceProcess {
  config: ServiceConfig;
  process: ChildProcess;
  status: 'running' | 'stopped' | 'error';
}

export class ServiceManager {
  private services: Map<string, ServiceProcess> = new Map();

  async start(
    serviceId: string,
    config: ServiceConfig,
    outputCallback: OutputCallback,
    exitCallback?: ExitCallback
  ): Promise<void> {
    // Stop existing service if running
    if (this.services.has(serviceId)) {
      await this.stop(serviceId);
    }

    return new Promise((resolve, reject) => {
      try {
        // Parse command (split command and args)
        const [command, ...args] = this.parseCommand(config.command);

        // Spawn process
        const childProcess = spawn(command, args, {
          cwd: config.workingDirectory,
          env: { ...process.env, ...config.env },
          shell: true,
        });

        // Store process
        this.services.set(serviceId, {
          config,
          process: childProcess,
          status: 'running',
        });

        // Send start message
        outputCallback(serviceId, {
          type: 'info',
          text: `Starting service: ${config.name}\nCommand: ${config.command}\nDirectory: ${config.workingDirectory}\n`,
          timestamp: Date.now(),
        });

        // Handle stdout
        childProcess.stdout?.on('data', (data) => {
          outputCallback(serviceId, {
            type: 'stdout',
            text: data.toString(),
            timestamp: Date.now(),
          });
        });

        // Handle stderr
        childProcess.stderr?.on('data', (data) => {
          outputCallback(serviceId, {
            type: 'stderr',
            text: data.toString(),
            timestamp: Date.now(),
          });
        });

        // Handle process exit
        childProcess.on('exit', (code, signal) => {
          const service = this.services.get(serviceId);
          if (service) {
            service.status = code === 0 ? 'stopped' : 'error';
          }

          outputCallback(serviceId, {
            type: code === 0 ? 'info' : 'error',
            text: `\nProcess exited with code ${code} ${signal ? `(signal: ${signal})` : ''}\n`,
            timestamp: Date.now(),
          });

          // Notify about exit for auto-restart
          if (exitCallback) {
            exitCallback(serviceId, code);
          }
        });

        // Handle process error
        childProcess.on('error', (error) => {
          const service = this.services.get(serviceId);
          if (service) {
            service.status = 'error';
          }

          outputCallback(serviceId, {
            type: 'error',
            text: `Error: ${error.message}\n`,
            timestamp: Date.now(),
          });

          if (exitCallback) {
            exitCallback(serviceId, 1);
          }

          reject(error);
        });

        // Resolve immediately after spawning
        resolve();
      } catch (error: any) {
        outputCallback(serviceId, {
          type: 'error',
          text: `Failed to start: ${error.message}\n`,
          timestamp: Date.now(),
        });
        reject(error);
      }
    });
  }

  async stop(serviceId: string): Promise<void> {
    const service = this.services.get(serviceId);
    if (!service) {
      return;
    }

    return new Promise((resolve) => {
      const { process: childProcess } = service;

      if (childProcess.killed) {
        service.status = 'stopped';
        resolve();
        return;
      }

      // Set a timeout for force kill
      const killTimeout = setTimeout(() => {
        if (!childProcess.killed) {
          childProcess.kill('SIGKILL');
        }
      }, 5000);

      childProcess.on('exit', () => {
        clearTimeout(killTimeout);
        service.status = 'stopped';
        resolve();
      });

      // Try graceful shutdown first (Windows uses taskkill approach)
      if (process.platform === 'win32') {
        // On Windows, we need to kill the process tree
        const pid = childProcess.pid;
        if (pid) {
          try {
            spawn('taskkill', ['/pid', pid.toString(), '/f', '/t'], { shell: true });
          } catch {
            childProcess.kill('SIGKILL');
          }
        } else {
          childProcess.kill('SIGTERM');
        }
      } else {
        childProcess.kill('SIGTERM');
      }

      // If process doesn't exist, resolve immediately
      if (childProcess.killed) {
        clearTimeout(killTimeout);
        service.status = 'stopped';
        resolve();
      }
    });
  }

  stopAll(): void {
    for (const [serviceId] of this.services) {
      this.stop(serviceId);
    }
  }

  getStatus(serviceId: string): string {
    const service = this.services.get(serviceId);
    return service?.status || 'stopped';
  }

  private parseCommand(command: string): string[] {
    // Simple command parser - handles quotes and spaces
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const parts: string[] = [];
    let match;

    while ((match = regex.exec(command)) !== null) {
      parts.push(match[1] || match[2] || match[0]);
    }

    return parts;
  }
}
