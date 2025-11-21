import { Service } from './types';

const STORAGE_KEY = 'dev-services';

export const loadServices = (): Service[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const services = JSON.parse(data);
      // Ensure all services start as stopped
      return services.map((s: Service) => ({ ...s, status: 'stopped' }));
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(servicesToSave));
  } catch (error) {
    console.error('Failed to save services:', error);
  }
};
