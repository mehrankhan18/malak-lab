import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('apex_admin_token');
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
    if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
      const message = error.response.data?.message;
      const invalidSession = error.config.url.includes('/auth/me') ||
        message === 'Not authorized to access this route. Token missing.' ||
        message === 'Not authorized. Invalid or expired token.' ||
        message === 'The user belonging to this token no longer exists.';

      if (invalidSession) {
        localStorage.removeItem('apex_admin_token');
        localStorage.removeItem('apex_admin_user');
        window.dispatchEvent(new Event('admin-auth-invalid'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
