import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      if (!localStorage.getItem('apex_admin_token')) {
        localStorage.removeItem('apex_admin_user');
        return null;
      }
      const saved = localStorage.getItem('apex_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('apex_admin_token');
      localStorage.removeItem('apex_admin_user');
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('apex_admin_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleInvalidSession = () => logout();
    window.addEventListener('admin-auth-invalid', handleInvalidSession);
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (['admin', 'pathologist', 'technician', 'receptionist'].includes(res.data.user.role)) {
            setAdminUser(res.data.user);
            localStorage.setItem('apex_admin_user', JSON.stringify(res.data.user));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Admin token invalid', err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
    return () => window.removeEventListener('admin-auth-invalid', handleInvalidSession);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (!['admin', 'pathologist', 'technician', 'receptionist'].includes(res.data.user.role)) {
      throw new Error('Access denied. This portal is restricted to authorized laboratory personnel.');
    }
    localStorage.setItem('apex_admin_token', res.data.token);
    localStorage.setItem('apex_admin_user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setAdminUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('apex_admin_token');
    localStorage.removeItem('apex_admin_user');
    setToken(null);
    setAdminUser(null);
  };

  const role = adminUser?.role || '';
  const isAdmin = role === 'admin';
  const isPathologist = role === 'pathologist';
  const isTechnician = role === 'technician';
  const isReceptionist = role === 'receptionist';
  const canApproveReports = isAdmin || isPathologist;
  const canEnterResults = isAdmin || isPathologist || isTechnician;

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        token,
        loading,
        login,
        logout,
        role,
        isAdmin,
        isPathologist,
        isTechnician,
        isReceptionist,
        canApproveReports,
        canEnterResults,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
