import React from 'react';

interface HeaderProps {
  servicesCount: number;
  runningCount: number;
  onStartAll: () => void;
  onStopAll: () => void;
}

const Header: React.FC<HeaderProps> = ({
  servicesCount,
  runningCount,
  onStartAll,
  onStopAll,
}) => {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Dev Service Manager</h1>
        <p className="text-sm text-gray-400 mt-1">
          {servicesCount} service{servicesCount !== 1 ? 's' : ''} · {runningCount} running
        </p>
      </div>
      
      <div className="flex gap-3">
        {runningCount < servicesCount && servicesCount > 0 && (
          <button
            onClick={onStartAll}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start All
          </button>
        )}
        
        {runningCount > 0 && (
          <button
            onClick={onStopAll}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            Stop All
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
