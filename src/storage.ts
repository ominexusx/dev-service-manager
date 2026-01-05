import { Service, ServiceGroup } from './types';

const SERVICES_KEY = 'dev-services';
const GROUPS_KEY = 'dev-service-groups';

export const loadServices = (): Service[] => {
  try {
    const data = localStorage.getItem(SERVICES_KEY);
    if (data) {
      const services = JSON.parse(data);
      // Ensure all services start as stopped
      return services.map((s: Service) => ({ ...s, status: 'stopped' as const }));
    }
  } catch (error) {
    console.error('Failed to load services:', error);
  }
  return [];
};

export const saveServices = (services: Service[]): void => {
  try {
    // Don't save status to localStorage
    const servicesToSave = services.map(({ status, ...rest }) => rest);
    localStorage.setItem(SERVICES_KEY, JSON.stringify(servicesToSave));
  } catch (error) {
    console.error('Failed to save services:', error);
  }
};

export const loadGroups = (): ServiceGroup[] => {
  try {
    const data = localStorage.getItem(GROUPS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load groups:', error);
  }
  return []; // Start with empty groups - users can create their own
};

export const saveGroups = (groups: ServiceGroup[]): void => {
  try {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  } catch (error) {
    console.error('Failed to save groups:', error);
  }
};

export interface ExportedConfig {
  services: Omit<Service, 'status'>[];
  groups: ServiceGroup[];
  exportedAt: string;
  version: string;
}

export const exportConfig = (services: Service[], groups: ServiceGroup[]): ExportedConfig => {
  return {
    services: services.map(({ status, ...rest }) => rest),
    groups,
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  };
};

export const importConfig = (config: ExportedConfig): { services: Service[]; groups: ServiceGroup[] } => {
  return {
    services: config.services.map(s => ({ ...s, status: 'stopped' as const })),
    groups: config.groups,
  };
};
