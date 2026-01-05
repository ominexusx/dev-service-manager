import React from 'react';
import { ServicePreset, ServiceGroup } from '../types';

// Default service groups with colors
export const DEFAULT_GROUPS: ServiceGroup[] = [
    { id: 'backend', name: 'Backend Services', color: '#3B82F6' },
    { id: 'media', name: 'Media Services', color: '#8B5CF6' },
    { id: 'communication', name: 'Communication', color: '#10B981' },
    { id: 'infrastructure', name: 'Infrastructure', color: '#F59E0B' },
];

// Beingnexus preset services matching manage-services.ps1
export const BEINGNEXUS_PRESETS: ServicePreset[] = [
    // Backend Services
    { name: 'Auth', command: 'pnpm dev', workingDirectory: 'C:\\Users\\Admin\\Beingnexus\\services\\auth', port: 4000, group: 'backend' },
    { name: 'User', command: 'pnpm dev', workingDirectory: 'C:\\Users\\Admin\\Beingnexus\\services\\user', port: 4004, group: 'backend' },
    { name: 'Post', command: 'pnpm dev', workingDirectory: 'C:\\Users\\Admin\\Beingnexus\\services\\post', port: 4003, group: 'backend' },
    { name: 'Comment', command: 'pnpm dev', workingDirectory: 'C:\\Users\\Admin\\Beingnexus\\services\\comment', port: 4001, group: 'backend' },
    { name: 'Like', command: 'pnpm dev', workingDirectory: 'C:\\Users\\Admin\\Beingnexus\\services\\like', port: 4002, group: 'backend' },
    { name: 'Connection', command: 'pnpm dev', workingDirectory: 'C:\\Users\\Admin\\Beingnexus\\services\\connection', port: 4006, group: 'backend' },

    // Media Services
    { name: 'Upload', command: 'pnpm dev', workingDirectory: 'C:\\Users\\Admin\\Beingnexus\\services\\upload', port: 4012, group: 'media' },
    { name: 'Video', command: 'pnpm dev', workingDirectory: 'C:\\Users\\Admin\\Beingnexus\\services\\video', port: 4011, group: 'media' },
    { name: 'Transcoding', command: 'pnpm dev', workingDirectory: 'C:\\Users\\Admin\\Beingnexus\\services\\transcoding-worker', port: 0, group: 'media' },

    // Communication
    { name: 'Chat', command: 'pnpm dev', workingDirectory: 'C:\\Users\\Admin\\Beingnexus\\services\\chat', port: 4008, group: 'communication' },
    { name: 'Calendar', command: 'pnpm dev', workingDirectory: 'C:\\Users\\Admin\\Beingnexus\\services\\calendar', port: 4010, group: 'communication' },
    { name: 'Support', command: 'pnpm dev', workingDirectory: 'C:\\Users\\Admin\\Beingnexus\\services\\support', port: 4013, group: 'communication' },

    // Infrastructure
    { name: 'Community', command: 'pnpm dev', workingDirectory: 'C:\\Users\\Admin\\Beingnexus\\services\\community', port: 3010, group: 'infrastructure' },
    { name: 'GraphQL', command: 'pnpm dev', workingDirectory: 'C:\\Users\\Admin\\Beingnexus\\services\\graphql', port: 4005, group: 'infrastructure' },

    // Frontend
    { name: 'Web App', command: 'pnpm dev', workingDirectory: 'C:\\Users\\Admin\\Beingnexus\\apps\\web', port: 3000, group: 'infrastructure' },
];

interface ServicePresetsModalProps {
    onClose: () => void;
    onSelectPresets: (presets: ServicePreset[]) => void;
    existingServiceNames: string[];
}

const ServicePresetsModal: React.FC<ServicePresetsModalProps> = ({
    onClose,
    onSelectPresets,
    existingServiceNames,
}) => {
    const [selectedPresets, setSelectedPresets] = React.useState<Set<string>>(new Set());

    // Group presets by their group
    const groupedPresets = BEINGNEXUS_PRESETS.reduce((acc, preset) => {
        if (!acc[preset.group]) {
            acc[preset.group] = [];
        }
        acc[preset.group].push(preset);
        return acc;
    }, {} as Record<string, ServicePreset[]>);

    const togglePreset = (presetName: string) => {
        const newSelected = new Set(selectedPresets);
        if (newSelected.has(presetName)) {
            newSelected.delete(presetName);
        } else {
            newSelected.add(presetName);
        }
        setSelectedPresets(newSelected);
    };

    const selectAll = () => {
        const allNames = BEINGNEXUS_PRESETS.filter(
            p => !existingServiceNames.includes(p.name)
        ).map(p => p.name);
        setSelectedPresets(new Set(allNames));
    };

    const selectNone = () => {
        setSelectedPresets(new Set());
    };

    const handleAdd = () => {
        const presetsToAdd = BEINGNEXUS_PRESETS.filter(p => selectedPresets.has(p.name));
        onSelectPresets(presetsToAdd);
        onClose();
    };

    const getGroupInfo = (groupId: string) => {
        return DEFAULT_GROUPS.find(g => g.id === groupId) || { name: groupId, color: '#6B7280' };
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div>
                        <h2 className="text-xl font-bold text-white">Beingnexus Service Presets</h2>
                        <p className="text-sm text-gray-400 mt-1">Select services to add to your manager</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={selectAll}
                            className="px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
                        >
                            Select All
                        </button>
                        <button
                            onClick={selectNone}
                            className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                        >
                            Select None
                        </button>
                        <span className="ml-auto text-sm text-gray-400">
                            {selectedPresets.size} selected
                        </span>
                    </div>

                    <div className="space-y-6">
                        {Object.entries(groupedPresets).map(([groupId, presets]) => {
                            const groupInfo = getGroupInfo(groupId);
                            return (
                                <div key={groupId}>
                                    <h3
                                        className="text-sm font-semibold mb-3 flex items-center gap-2"
                                        style={{ color: groupInfo.color }}
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: groupInfo.color }}
                                        />
                                        {groupInfo.name}
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {presets.map((preset) => {
                                            const isExisting = existingServiceNames.includes(preset.name);
                                            const isSelected = selectedPresets.has(preset.name);
                                            return (
                                                <button
                                                    key={preset.name}
                                                    onClick={() => !isExisting && togglePreset(preset.name)}
                                                    disabled={isExisting}
                                                    className={`p-3 rounded-lg text-left transition-all ${isExisting
                                                            ? 'bg-slate-700 opacity-50 cursor-not-allowed'
                                                            : isSelected
                                                                ? 'bg-primary-600 ring-2 ring-primary-400'
                                                                : 'bg-slate-700 hover:bg-slate-600'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-white">{preset.name}</span>
                                                        {isExisting ? (
                                                            <span className="text-xs text-gray-400">Added</span>
                                                        ) : isSelected ? (
                                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : null}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {preset.port ? `Port ${preset.port}` : 'Worker'}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={selectedPresets.size === 0}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                        Add {selectedPresets.size} Service{selectedPresets.size !== 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServicePresetsModal;
