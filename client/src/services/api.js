import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('apex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto clear if attempting login
      if (!error.config.url.includes('/login') && !error.config.url.includes('/verify-otp')) {
        localStorage.removeItem('apex_token');
        localStorage.removeItem('apex_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

