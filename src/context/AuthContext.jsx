import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; }
    catch { return null; }
  });
  const [business, setBusiness] = useState(() => {
    try { return JSON.parse(localStorage.getItem('business')) || null; }
    catch { return null; }
  });
  const [bizLoading, setBizLoading] = useState(false);

  // Cargar negocio del admin cuando hay token
  useEffect(() => {
    if (token && user?.role === 'admin' && !business) {
      setBizLoading(true);
      api.get('/businesses/my/business')
        .then(r => {
          setBusiness(r.data);
          localStorage.setItem('business', JSON.stringify(r.data));
        })
        .catch(() => {})
        .finally(() => setBizLoading(false));
    }
  }, [token]);

  const login = (newToken, userData, biz = null) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    if (biz) {
      setBusiness(biz);
      localStorage.setItem('business', JSON.stringify(biz));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('business');
    setToken(null);
    setUser(null);
    setBusiness(null);
  };

  const refreshBusiness = async () => {
    try {
      const r = await api.get('/businesses/my/business');
      setBusiness(r.data);
      localStorage.setItem('business', JSON.stringify(r.data));
      return r.data;
    } catch (e) {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, business, bizLoading, login, logout, refreshBusiness, setBusiness }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
