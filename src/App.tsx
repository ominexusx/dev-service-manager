import { useState, useEffect, useRef } from 'react';
import { Service, ServiceGroup, LogEntry } from './types';
import { loadServices, saveServices, loadGroups, saveGroups, exportConfig, importConfig, ExportedConfig } from './storage';
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
      onServiceExit: (callback: (data: { serviceId: string; code: number | null }) => void) => () => void;
      saveFile: (content: string, filename: string) => Promise<boolean>;
      openFile: () => Promise<string | null>;
    };
  }
}

function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [logs, setLogs] = useState<Map<string, LogEntry[]>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load services and groups on mount
  useEffect(() => {
    const loadedServices = loadServices();
    const loadedGroups = loadGroups();

    setServices(loadedServices);
    setGroups(loadedGroups);

    if (loadedServices.length > 0) {
      setSelectedServiceId(loadedServices[0].id);
    }
  }, []);

  // Save services when they change
  useEffect(() => {
    saveServices(services);
  }, [services]);

  // Save groups when they change
  useEffect(() => {
    saveGroups(groups);
  }, [groups]);

  // Listen for service output
  useEffect(() => {
    if (!window.electronAPI) return;

    const unsubscribe = window.electronAPI.onServiceOutput((data) => {
      setLogs((prevLogs) => {
        const newLogs = new Map(prevLogs);
        const serviceLogs = newLogs.get(data.serviceId) || [];
        newLogs.set(data.serviceId, [...serviceLogs, data.data]);
        return newLogs;
      });
    });

    return unsubscribe;
  }, []);

  // Listen for service exit events
  useEffect(() => {
    if (!window.electronAPI) return;

    const unsubscribe = window.electronAPI.onServiceExit((data) => {
      const service = services.find((s) => s.id === data.serviceId);
      if (service) {
        if (data.code !== 0 && data.code !== null) {
          updateService(data.serviceId, { status: 'error' });
        } else {
          updateService(data.serviceId, { status: 'stopped' });
        }
      }
    });

    return unsubscribe;
  }, [services]);

  const addService = (service: Omit<Service, 'id' | 'status'>) => {
    // Auto-create group if it doesn't exist
    if (service.group && !groups.find(g => g.id === service.group || g.name === service.group)) {
      const newGroup: ServiceGroup = {
        id: service.group.toLowerCase().replace(/\s+/g, '-'),
        name: service.group,
        color: getRandomGroupColor(),
      };
      setGroups([...groups, newGroup]);
      service = { ...service, group: newGroup.id };
    } else if (service.group) {
      const existingGroup = groups.find(g => g.name === service.group);
      if (existingGroup) {
        service = { ...service, group: existingGroup.id };
      }
    }

    const newService: Service = {
      ...service,
      id: Date.now().toString(),
      status: 'stopped',
    };
    setServices([...services, newService]);
    setSelectedServiceId(newService.id);
  };

  const getRandomGroupColor = () => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices(services.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteService = async (id: string) => {
    await stopService(id);
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

    updateService(id, { status: 'running' });

    const result = await window.electronAPI.startService(id, {
      name: service.name,
      command: service.command,
      workingDirectory: service.workingDirectory,
      env: service.env,
      autoRestart: service.autoRestart,
    });

    if (!result.success) {
      updateService(id, { status: 'error' });
    }
  };

  const stopService = async (id: string) => {
    if (!window.electronAPI) return;
    await window.electronAPI.stopService(id);
    updateService(id, { status: 'stopped' });
  };

  const restartService = async (id: string) => {
    const service = services.find((s) => s.id === id);
    if (!service || !window.electronAPI) return;

    await window.electronAPI.restartService(id, {
      name: service.name,
      command: service.command,
      workingDirectory: service.workingDirectory,
      env: service.env,
      autoRestart: service.autoRestart,
    });
  };

  const startAllServices = async () => {
    for (const service of services.filter((s) => s.status !== 'running')) {
      await startService(service.id);
    }
  };

  const stopAllServices = async () => {
    if (window.electronAPI) {
      await window.electronAPI.stopAllServices();
    }
    setServices(services.map((s) => ({ ...s, status: 'stopped' })));
  };

  const toggleGroup = (groupId: string) => {
    setGroups(groups.map((g) => (g.id === groupId ? { ...g, collapsed: !g.collapsed } : g)));
  };

  const startGroupServices = async (groupId: string) => {
    for (const service of services.filter((s) => s.group === groupId && s.status !== 'running')) {
      await startService(service.id);
    }
  };

  const stopGroupServices = async (groupId: string) => {
    for (const service of services.filter((s) => s.group === groupId && s.status === 'running')) {
      await stopService(service.id);
    }
  };

  const clearLogs = (serviceId: string) => {
    setLogs((prevLogs) => {
      const newLogs = new Map(prevLogs);
      newLogs.set(serviceId, []);
      return newLogs;
    });
  };

  const handleExport = async () => {
    const config = exportConfig(services, groups);
    const content = JSON.stringify(config, null, 2);

    if (window.electronAPI?.saveFile) {
      await window.electronAPI.saveFile(content, 'dev-services-config.json');
    } else {
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dev-services-config.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = async () => {
    if (window.electronAPI?.openFile) {
      const content = await window.electronAPI.openFile();
      if (content) {
        try {
          const config: ExportedConfig = JSON.parse(content);
          const imported = importConfig(config);
          setServices(imported.services);
          setGroups(imported.groups);
          if (imported.services.length > 0) {
            setSelectedServiceId(imported.services[0].id);
          }
        } catch (error) {
          alert('Failed to import configuration: Invalid file format');
        }
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const config: ExportedConfig = JSON.parse(content);
          const imported = importConfig(config);
          setServices(imported.services);
          setGroups(imported.groups);
          if (imported.services.length > 0) {
            setSelectedServiceId(imported.services[0].id);
          }
        } catch (error) {
          alert('Failed to import configuration: Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const selectedService = services.find((s) => s.id === selectedServiceId);

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-gray-100">
      <Header
        servicesCount={services.length}
        runningCount={services.filter((s) => s.status === 'running').length}
        onStartAll={startAllServices}
        onStopAll={stopAllServices}
        onExport={handleExport}
        onImport={handleImport}
      />

      <div className="flex flex-1 overflow-hidden">
        <ServiceList
          services={services}
          groups={groups}
          selectedId={selectedServiceId}
          onSelect={setSelectedServiceId}
          onAdd={addService}
          onDelete={deleteService}
          onToggleGroup={toggleGroup}
          onStartGroup={startGroupServices}
          onStopGroup={stopGroupServices}
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

      {/* Hidden file input for import fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default App;
