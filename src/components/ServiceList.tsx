import React, { useState } from 'react';
import { Service } from '../types';
import AddServiceModal from './AddServiceModal';

interface ServiceListProps {
  services: Service[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (service: Omit<Service, 'id' | 'status'>) => void;
  onDelete: (id: string) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({
  services,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

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
          <div className="p-2 space-y-1">
            {services.map((service) => (
              <div
                key={service.id}
                className={`relative group rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedId === service.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-gray-200'
                }`}
                onClick={() => onSelect(service.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          service.status === 'running'
                            ? 'bg-green-400 animate-pulse'
                            : 'bg-gray-500'
                        }`}
                      />
                      <h3 className="font-medium truncate">{service.name}</h3>
                    </div>
                    <p className={`text-xs mt-1 truncate ${
                      selectedId === service.id ? 'text-gray-200' : 'text-gray-400'
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
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-600 ${
                      selectedId === service.id ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddServiceModal
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

export default ServiceList;
