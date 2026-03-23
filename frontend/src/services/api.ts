import axios from 'axios';
import { mockAdapter } from './mockApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5264/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined' && localStorage.getItem('backendConnection') === 'false') {
    const response = await mockAdapter(config);
    throw { __isMock: true, response };
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.__isMock) {
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  }
);

export default api;
