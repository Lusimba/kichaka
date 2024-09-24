import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV? 'http://127.0.0.1:8000': 'https://kichakapoa.com', // Replace with your Django backend URL
});

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
console.dir({env: import.meta.env})
export default api;