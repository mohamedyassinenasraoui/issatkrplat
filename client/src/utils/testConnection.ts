import api from '../services/api';

export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.data.status === 'OK';
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

