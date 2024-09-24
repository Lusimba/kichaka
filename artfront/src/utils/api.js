import axios from 'axios';


export const URL = import.meta.env.DEV? 'http://127.0.0.1:8000': 'https://kichakapoa.com'

const api = axios.create({
  baseURL: URL
} );



api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;