import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface ServiceConsoleProps {
  logs: LogEntry[];
  onClear: () => void;
}

const ServiceConsole: React.FC<ServiceConsoleProps> = ({ logs, onClear }) => {
  const consoleRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = React.useState(true);
  const lastScrollHeightRef = useRef<number>(0);

  useEffect(() => {
    if (autoScroll && consoleRef.current) {
      const currentScrollHeight = consoleRef.current.scrollHeight;
      if (currentScrollHeight !== lastScrollHeightRef.current) {
        consoleRef.current.scrollTop = currentScrollHeight;
        lastScrollHeightRef.current = currentScrollHeight;
      }
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (!consoleRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = consoleRef.current;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
    setAutoScroll(isAtBottom);
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'stdout':
        return 'text-gray-300';
      case 'stderr':
        return 'text-red-400';
      case 'info':
        return 'text-blue-400';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Console Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-gray-300">Console Output</h3>
          <span className="text-xs text-gray-500">
            {logs.length} line{logs.length !== 1 ? 's' : ''}
          </span>
          {!autoScroll && (
            <span className="text-xs text-yellow-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Auto-scroll paused
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAutoScroll(true);
              if (consoleRef.current) {
                consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
              }
            }}
            className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-gray-300 rounded transition-colors"
          >
            Scroll to Bottom
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-gray-300 rounded transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      {/* Console Content */}
      <div
        ref={consoleRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-950 p-4 font-mono text-sm min-h-0"
        style={{ maxHeight: '100%' }}
      >
        {logs.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No output yet</p>
            <p className="text-xs mt-2">Start the service to see logs here</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`${getLogColor(log.type)} whitespace-pre-wrap break-words`}>
              {log.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceConsole;
