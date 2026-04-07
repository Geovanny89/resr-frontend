import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/client';
import fcmService from '../services/fcmService';

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

  // Inicializar FCM cuando hay sesión activa o email de cliente al cargar
  useEffect(() => {
    const hasSession = !!token;
    const isClientMode = !!localStorage.getItem('clientEmail');
    
    if (hasSession || isClientMode) {
      fcmService.initialize();
    }
  }, [token]);

  const login = async (newToken, userData, biz = null) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('clientEmail'); // Limpiar modo cliente si inicia sesión real
    setToken(newToken);
    setUser(userData);
    if (biz) {
      setBusiness(biz);
      localStorage.setItem('business', JSON.stringify(biz));
    }
    
    // Inicializar FCM para notificaciones push
    try {
      await fcmService.initialize();
    } catch (e) {
      console.log('[Auth] FCM no disponible:', e.message);
    }
  };

  const loginAsClient = (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    localStorage.setItem('clientEmail', normalizedEmail);
    localStorage.setItem('userRole', 'client');
    setUser({ role: 'client', email: normalizedEmail }); // Usuario virtual para el contexto
    
    // Inicializar FCM para el cliente invitado
    fcmService.initialize();
  };

  const logout = async () => {
    // Eliminar token FCM al cerrar sesión
    try {
      await fcmService.deleteToken();
    } catch (e) {
      console.log('[Auth] Error eliminando FCM token:', e.message);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('business');
    localStorage.removeItem('clientEmail');
    localStorage.removeItem('userRole');
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
    <AuthContext.Provider value={{ token, user, business, bizLoading, login, loginAsClient, logout, refreshBusiness, setBusiness }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
