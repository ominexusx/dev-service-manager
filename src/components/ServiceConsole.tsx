import React, { useEffect, useRef, useState, useMemo } from 'react';
import { LogEntry } from '../types';

interface ServiceConsoleProps {
  logs: LogEntry[];
  onClear: () => void;
}

const ServiceConsole: React.FC<ServiceConsoleProps> = ({ logs, onClear }) => {
  const consoleRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStdout, setShowStdout] = useState(true);
  const [showStderr, setShowStderr] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const lastScrollHeightRef = useRef<number>(0);

  // Filter logs based on search and type filters
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Type filter
      if (log.type === 'stdout' && !showStdout) return false;
      if (log.type === 'stderr' && !showStderr) return false;
      if ((log.type === 'info' || log.type === 'error') && !showInfo) return false;

      // Search filter
      if (searchQuery.trim()) {
        return log.text.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [logs, searchQuery, showStdout, showStderr, showInfo]);

  useEffect(() => {
    if (autoScroll && consoleRef.current) {
      const currentScrollHeight = consoleRef.current.scrollHeight;
      if (currentScrollHeight !== lastScrollHeightRef.current) {
        consoleRef.current.scrollTop = currentScrollHeight;
        lastScrollHeightRef.current = currentScrollHeight;
      }
    }
  }, [filteredLogs, autoScroll]);

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

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={index} className="bg-yellow-500 text-black px-0.5 rounded">{part}</mark>
        : part
    );
  };

  const handleExportLogs = () => {
    const logText = logs.map(log => {
      const timestamp = new Date(log.timestamp).toISOString();
      return `[${timestamp}] [${log.type.toUpperCase()}] ${log.text}`;
    }).join('');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Console Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-gray-300">Console Output</h3>
            <span className="text-xs text-gray-500">
              {filteredLogs.length} / {logs.length} line{logs.length !== 1 ? 's' : ''}
            </span>
            {!autoScroll && (
              <span className="text-xs text-yellow-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Paused
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
              ↓ Bottom
            </button>
            <button
              onClick={handleExportLogs}
              className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-gray-300 rounded transition-colors flex items-center gap-1"
              title="Export logs to file"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export
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

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowStdout(!showStdout)}
              className={`px-2 py-1 text-xs rounded transition-colors ${showStdout
                  ? 'bg-gray-600 text-gray-200'
                  : 'bg-slate-700 text-gray-500'
                }`}
            >
              stdout
            </button>
            <button
              onClick={() => setShowStderr(!showStderr)}
              className={`px-2 py-1 text-xs rounded transition-colors ${showStderr
                  ? 'bg-red-900 text-red-300'
                  : 'bg-slate-700 text-gray-500'
                }`}
            >
              stderr
            </button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`px-2 py-1 text-xs rounded transition-colors ${showInfo
                  ? 'bg-blue-900 text-blue-300'
                  : 'bg-slate-700 text-gray-500'
                }`}
            >
              info
            </button>
          </div>
        </div>
      </div>

      {/* Console Content */}
      <div
        ref={consoleRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-950 p-4 font-mono text-sm min-h-0"
        style={{ maxHeight: '100%' }}
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>{logs.length === 0 ? 'No output yet' : 'No matching logs'}</p>
            <p className="text-xs mt-2">
              {logs.length === 0
                ? 'Start the service to see logs here'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div key={index} className={`${getLogColor(log.type)} whitespace-pre-wrap break-words`}>
              {searchQuery ? highlightText(log.text, searchQuery) : log.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceConsole;
