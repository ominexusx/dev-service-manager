import React from 'react';

interface HeaderProps {
  servicesCount: number;
  runningCount: number;
  onStartAll: () => void;
  onStopAll: () => void;
  onExport: () => void;
  onImport: () => void;
}

const Header: React.FC<HeaderProps> = ({
  servicesCount,
  runningCount,
  onStartAll,
  onStopAll,
  onExport,
  onImport,
}) => {
  const healthPercentage = servicesCount > 0 ? Math.round((runningCount / servicesCount) * 100) : 0;

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            Dev Service Manager
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {servicesCount} service{servicesCount !== 1 ? 's' : ''} · {runningCount} running
          </p>
        </div>

        {/* Health Bar */}
        {servicesCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${healthPercentage === 100 ? 'bg-green-500' :
                    healthPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: `${healthPercentage}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${healthPercentage === 100 ? 'text-green-400' :
                healthPercentage >= 50 ? 'text-yellow-400' : 'text-red-400'
              }`}>
              {healthPercentage}%
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {/* Export/Import */}
        <div className="flex rounded-lg overflow-hidden">
          <button
            onClick={onExport}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 font-medium transition-colors flex items-center gap-1 text-sm border-r border-slate-600"
            title="Export Configuration"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
          </button>
          <button
            onClick={onImport}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 font-medium transition-colors flex items-center gap-1 text-sm"
            title="Import Configuration"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Import
          </button>
        </div>

        {/* Start/Stop All */}
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
