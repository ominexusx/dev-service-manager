import React, { useState, useMemo } from 'react';
import { Service, ServiceGroup } from '../types';
import AddServiceModal from './AddServiceModal';

interface ServiceListProps {
  services: Service[];
  groups: ServiceGroup[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (service: Omit<Service, 'id' | 'status'>) => void;
  onDelete: (id: string) => void;
  onToggleGroup: (groupId: string) => void;
  onStartGroup: (groupId: string) => void;
  onStopGroup: (groupId: string) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({
  services,
  groups,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onToggleGroup,
  onStartGroup,
  onStopGroup,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Group services by their group property
  const groupedServices = useMemo(() => {
    const grouped: Record<string, Service[]> = { ungrouped: [] };

    groups.forEach(g => {
      grouped[g.id] = [];
    });

    services.forEach(service => {
      const groupId = service.group || 'ungrouped';
      if (!grouped[groupId]) {
        grouped[groupId] = [];
      }
      grouped[groupId].push(service);
    });

    return grouped;
  }, [services, groups]);



  const getGroupStats = (groupId: string) => {
    const groupServices = groupedServices[groupId] || [];
    const running = groupServices.filter(s => s.status === 'running').length;
    return { total: groupServices.length, running };
  };

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Service
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {services.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <p className="text-sm">No services yet</p>
            <p className="text-xs mt-2">Click "Add Service" to get started</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {/* Render groups with services */}
            {groups.map((group) => {
              const groupServices = groupedServices[group.id] || [];
              if (groupServices.length === 0) return null;

              const stats = getGroupStats(group.id);
              const isCollapsed = group.collapsed;

              return (
                <div key={group.id} className="rounded-lg overflow-hidden">
                  {/* Group Header */}
                  <div
                    className="flex items-center justify-between px-3 py-2 bg-slate-700 cursor-pointer hover:bg-slate-600 transition-colors"
                    onClick={() => onToggleGroup(group.id)}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="text-sm font-medium text-gray-200">{group.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {stats.running}/{stats.total}
                      </span>
                      {/* Group action buttons */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartGroup(group.id);
                        }}
                        className="p-1 rounded hover:bg-green-600 text-gray-400 hover:text-white transition-colors"
                        title="Start all in group"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStopGroup(group.id);
                        }}
                        className="p-1 rounded hover:bg-red-600 text-gray-400 hover:text-white transition-colors"
                        title="Stop all in group"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Group Services */}
                  {!isCollapsed && (
                    <div className="space-y-1 p-1 bg-slate-750">
                      {groupServices.map((service) => (
                        <ServiceItem
                          key={service.id}
                          service={service}
                          isSelected={selectedId === service.id}
                          onSelect={onSelect}
                          onDelete={onDelete}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Ungrouped services */}
            {groupedServices.ungrouped?.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 py-1 text-xs text-gray-500 uppercase tracking-wider">
                  Ungrouped
                </div>
                {groupedServices.ungrouped.map((service) => (
                  <ServiceItem
                    key={service.id}
                    service={service}
                    isSelected={selectedId === service.id}
                    onSelect={onSelect}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddServiceModal
          groups={groups}
          onClose={() => setShowAddModal(false)}
          onAdd={(service: Omit<Service, 'id' | 'status'>) => {
            onAdd(service);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

// Service item component
interface ServiceItemProps {
  service: Service;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  isSelected,
  onSelect,
  onDelete,
}) => {
  return (
    <div
      className={`relative group rounded-lg p-3 cursor-pointer transition-colors ${isSelected
        ? 'bg-primary-600 text-white'
        : 'bg-slate-700 hover:bg-slate-600 text-gray-200'
        }`}
      onClick={() => onSelect(service.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${service.status === 'running'
                ? 'bg-green-400 animate-pulse'
                : service.status === 'error'
                  ? 'bg-red-400'
                  : 'bg-gray-500'
                }`}
            />
            <h3 className="font-medium truncate">{service.name}</h3>
            {service.port && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-slate-600 text-gray-400">
                :{service.port}
              </span>
            )}
          </div>
          <p className={`text-xs mt-1 truncate ${isSelected ? 'text-gray-200' : 'text-gray-400'
            }`}>
            {service.command}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete service "${service.name}"?`)) {
              onDelete(service.id);
            }
          }}
          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-600 ${isSelected ? 'text-white' : 'text-gray-400'
            }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ServiceList;
