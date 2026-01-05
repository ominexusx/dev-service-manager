import React, { useEffect } from 'react';
import { Service, LogEntry } from '../types';
import ServiceConsole from './ServiceConsole';

interface ServicePanelProps {
  service: Service | undefined;
  logs: LogEntry[];
  onUpdate: (id: string, updates: Partial<Service>) => void;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onRestart: (id: string) => void;
  onClearLogs: (id: string) => void;
}

const ServicePanel: React.FC<ServicePanelProps> = ({
  service,
  logs,
  onStart,
  onStop,
  onRestart,
  onClearLogs,
}) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R' && service) {
        e.preventDefault();
        onRestart(service.id);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [service, onRestart]);

  if (!service) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <div className="text-center text-gray-500">
          <svg className="w-24 h-24 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <p className="text-lg">No service selected</p>
          <p className="text-sm mt-2">Select a service from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  const isRunning = service.status === 'running';
  const isError = service.status === 'error';

  return (
    <div className="flex-1 flex flex-col bg-slate-900">
      {/* Service Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' :
                    isError ? 'bg-red-400' : 'bg-gray-500'
                  }`}
              />
              <h2 className="text-2xl font-bold text-white">{service.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${isRunning
                  ? 'bg-green-900 text-green-300'
                  : isError
                    ? 'bg-red-900 text-red-300'
                    : 'bg-gray-700 text-gray-300'
                }`}>
                {isRunning ? 'Running' : isError ? 'Error' : 'Stopped'}
              </span>
              {service.port && (
                <span className="px-2 py-1 rounded bg-slate-700 text-gray-400 text-xs font-mono">
                  Port {service.port}
                </span>
              )}
              {service.autoRestart && (
                <span className="px-2 py-1 rounded bg-yellow-900 text-yellow-300 text-xs flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Auto-restart
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-mono">{service.command}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="font-mono text-xs">{service.workingDirectory}</span>
              </div>
              {service.env && Object.keys(service.env).length > 0 && (
                <div className="flex items-start gap-2 text-gray-400">
                  <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(service.env).map(([key, value]) => (
                      <span key={key} className="text-xs px-1.5 py-0.5 bg-slate-700 rounded">
                        {key}={value.length > 20 ? value.slice(0, 20) + '...' : value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isRunning ? (
              <>
                <button
                  onClick={() => onRestart(service.id)}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  title="Restart (Ctrl+Shift+R)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Restart
                </button>
                <button
                  onClick={() => onStop(service.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  Stop
                </button>
              </>
            ) : (
              <button
                onClick={() => onStart(service.id)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Console */}
      <ServiceConsole
        logs={logs}
        onClear={() => onClearLogs(service.id)}
      />
    </div>
  );
};

export default ServicePanel;
