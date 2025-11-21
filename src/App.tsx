import { useState, useEffect } from 'react';
import { Service, LogEntry } from './types';
import { loadServices, saveServices } from './storage';
import ServiceList from './components/ServiceList';
import ServicePanel from './components/ServicePanel';
import Header from './components/Header';

declare global {
  interface Window {
    electronAPI: {
      startService: (serviceId: string, config: any) => Promise<{ success: boolean; error?: string }>;
      stopService: (serviceId: string) => Promise<{ success: boolean; error?: string }>;
      restartService: (serviceId: string, config: any) => Promise<{ success: boolean; error?: string }>;
      getServiceStatus: (serviceId: string) => Promise<string>;
      stopAllServices: () => Promise<{ success: boolean; error?: string }>;
      selectDirectory: () => Promise<string | null>;
      onServiceOutput: (callback: (data: { serviceId: string; data: LogEntry }) => void) => () => void;
    };
  }
}

function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [logs, setLogs] = useState<Map<string, LogEntry[]>>(new Map());

  // Load services on mount
  useEffect(() => {
    const loadedServices = loadServices();
    setServices(loadedServices);
    if (loadedServices.length > 0) {
      setSelectedServiceId(loadedServices[0].id);
    }
  }, []);

  // Save services when they change
  useEffect(() => {
    if (services.length > 0) {
      saveServices(services);
    }
  }, [services]);

  // Listen for service output
  useEffect(() => {
    if (!window.electronAPI) return;

    const unsubscribe = window.electronAPI.onServiceOutput((output) => {
      setLogs((prevLogs) => {
        const newLogs = new Map(prevLogs);
        const serviceLogs = newLogs.get(output.serviceId) || [];
        newLogs.set(output.serviceId, [...serviceLogs, output.data]);
        return newLogs;
      });
    });

    return unsubscribe;
  }, []);

  const addService = (service: Omit<Service, 'id' | 'status'>) => {
    const newService: Service = {
      ...service,
      id: Date.now().toString(),
      status: 'stopped',
    };
    setServices([...services, newService]);
    setSelectedServiceId(newService.id);
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices(services.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteService = (id: string) => {
    // Stop service first
    if (window.electronAPI) {
      window.electronAPI.stopService(id);
    }
    
    setServices(services.filter((s) => s.id !== id));
    setLogs((prevLogs) => {
      const newLogs = new Map(prevLogs);
      newLogs.delete(id);
      return newLogs;
    });

    if (selectedServiceId === id) {
      const remaining = services.filter((s) => s.id !== id);
      setSelectedServiceId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const startService = async (id: string) => {
    const service = services.find((s) => s.id === id);
    if (!service || !window.electronAPI) return;

    const result = await window.electronAPI.startService(id, service);
    if (result.success) {
      updateService(id, { status: 'running' });
    }
  };

  const stopService = async (id: string) => {
    if (!window.electronAPI) return;

    const result = await window.electronAPI.stopService(id);
    if (result.success) {
      updateService(id, { status: 'stopped' });
    }
  };

  const restartService = async (id: string) => {
    const service = services.find((s) => s.id === id);
    if (!service || !window.electronAPI) return;

    updateService(id, { status: 'stopped' });
    const result = await window.electronAPI.restartService(id, service);
    if (result.success) {
      updateService(id, { status: 'running' });
    }
  };

  const startAllServices = async () => {
    for (const service of services) {
      if (service.status !== 'running') {
        await startService(service.id);
      }
    }
  };

  const stopAllServices = async () => {
    if (!window.electronAPI) return;

    await window.electronAPI.stopAllServices();
    setServices(services.map((s) => ({ ...s, status: 'stopped' })));
  };

  const clearLogs = (id: string) => {
    setLogs((prevLogs) => {
      const newLogs = new Map(prevLogs);
      newLogs.set(id, []);
      return newLogs;
    });
  };

  const selectedService = services.find((s) => s.id === selectedServiceId);

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-gray-100">
      <Header
        servicesCount={services.length}
        runningCount={services.filter((s) => s.status === 'running').length}
        onStartAll={startAllServices}
        onStopAll={stopAllServices}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <ServiceList
          services={services}
          selectedId={selectedServiceId}
          onSelect={setSelectedServiceId}
          onAdd={addService}
          onDelete={deleteService}
        />
        
        <ServicePanel
          service={selectedService}
          logs={selectedService ? logs.get(selectedService.id) || [] : []}
          onUpdate={updateService}
          onStart={startService}
          onStop={stopService}
          onRestart={restartService}
          onClearLogs={clearLogs}
        />
      </div>
    </div>
  );
}

export default App;
