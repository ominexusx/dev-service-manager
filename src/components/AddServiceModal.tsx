import React, { useState, useRef } from 'react';
import { Service, ServiceGroup } from '../types';
import ServicePresetsModal from './ServicePresets';

interface AddServiceModalProps {
  groups: ServiceGroup[];
  onClose: () => void;
  onAdd: (service: Omit<Service, 'id' | 'status'>) => void;
  existingServiceNames?: string[];
  onAddPresets?: (presets: { name: string; command: string; workingDirectory: string; port?: number; group?: string }[]) => void;
}

// Quick add preset names
const QUICK_ADD_NAMES = ['Auth', 'User', 'Post', 'Comment', 'Like', 'Connection'];

const AddServiceModal: React.FC<AddServiceModalProps> = ({
  groups,
  onClose,
  onAdd,
  existingServiceNames = [],
  onAddPresets
}) => {
  const [name, setName] = useState('');
  const [command, setCommand] = useState('');
  const [workingDirectory, setWorkingDirectory] = useState('');
  const [envVars, setEnvVars] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [port, setPort] = useState<string>('');
  const [autoRestart, setAutoRestart] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Handle quick add button click - sets the name and focuses the input
  const handleQuickAdd = (serviceName: string) => {
    setName(serviceName);
    // Focus the name input to show the user where the value was set
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  };

  const handleSelectDirectory = async () => {
    if (window.electronAPI) {
      try {
        const dir = await window.electronAPI.selectDirectory();
        if (dir) {
          setWorkingDirectory(dir);
        }
      } catch (error) {
        console.error('Error selecting directory:', error);
        alert('Failed to open directory selector: ' + error);
      }
    } else {
      alert('Directory browser not available. Please enter the path manually.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !command.trim() || !workingDirectory.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const env: Record<string, string> = {};
    if (envVars.trim()) {
      envVars.split('\n').forEach((line) => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      });
    }

    onAdd({
      name: name.trim(),
      command: command.trim(),
      workingDirectory: workingDirectory.trim(),
      env: Object.keys(env).length > 0 ? env : undefined,
      group: selectedGroup || undefined,
      port: port ? parseInt(port, 10) : undefined,
      autoRestart,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Add New Service</h2>
          <div className="flex items-center gap-3">
            {onAddPresets && (
              <button
                type="button"
                onClick={() => setShowPresetsModal(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Load Presets
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Add Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quick Add
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_ADD_NAMES.map((presetName) => (
                <button
                  key={presetName}
                  type="button"
                  onClick={() => handleQuickAdd(presetName)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${name === presetName
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                >
                  {presetName}
                </button>
              ))}
              {onAddPresets && (
                <button
                  type="button"
                  onClick={() => setShowPresetsModal(true)}
                  className="px-3 py-1.5 text-sm bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 rounded-lg transition-colors"
                >
                  More...
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Service Name *
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., API Server"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Group
              </label>
              <input
                type="text"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                placeholder="e.g., Backend, Frontend, Database"
                list="group-suggestions"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <datalist id="group-suggestions">
                {groups.map((group: ServiceGroup) => (
                  <option key={group.id} value={group.name} />
                ))}
              </datalist>
              <p className="text-xs text-gray-500 mt-1">Type a new group name or choose from existing</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Command *
            </label>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g., pnpm dev or npm start"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Working Directory *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={workingDirectory}
                onChange={(e) => setWorkingDirectory(e.target.value)}
                placeholder="/path/to/project"
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <button
                type="button"
                onClick={handleSelectDirectory}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors"
              >
                Browse
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Port (optional)
              </label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="e.g., 3000"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={autoRestart}
                  onChange={(e) => setAutoRestart(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-300">Auto-restart on crash</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Environment Variables (optional)
            </label>
            <textarea
              value={envVars}
              onChange={(e) => setEnvVars(e.target.value)}
              placeholder="KEY=value&#10;ANOTHER_KEY=another_value"
              rows={3}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">One per line, format: KEY=value</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Add Service
            </button>
          </div>
        </form>
      </div>

      {/* Presets Modal */}
      {showPresetsModal && onAddPresets && (
        <ServicePresetsModal
          onClose={() => setShowPresetsModal(false)}
          onSelectPresets={(presets) => {
            onAddPresets(presets);
            setShowPresetsModal(false);
          }}
          existingServiceNames={existingServiceNames}
        />
      )}
    </div>
  );
};

export default AddServiceModal;
