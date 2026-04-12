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
  const [mainBusiness, setMainBusiness] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mainBusiness')) || null; }
    catch { return null; }
  });
  const [branches, setBranches] = useState([]);
  const [bizLoading, setBizLoading] = useState(false);

  // Cargar negocio del admin y sus sucursales cuando hay token
  useEffect(() => {
    if (token && (user?.role === 'admin' || user?.role === 'admin_suc')) {
      const loadData = async () => {
        setBizLoading(true);
        try {
          // Cargar negocio principal
          const bizRes = await api.get('/businesses/my/business');
          const biz = bizRes.data;
          
          setMainBusiness(biz);
          localStorage.setItem('mainBusiness', JSON.stringify(biz));
          
          // Cargar sucursales
          const branchesRes = await api.get('/businesses/my/branches');
          const branchesData = branchesRes.data || [];
          setBranches(branchesData);
          
          // Si no hay negocio activo o el que hay no coincide, poner el principal
          if (!business || (business.id !== biz.id && !branchesData.some(b => b.id === business.id))) {
            setBusiness(biz);
            localStorage.setItem('business', JSON.stringify(biz));
          }
        } catch (err) {
          console.error('[Auth] Error loading business data:', err);
        } finally {
          setBizLoading(false);
        }
      };
      loadData();
    }
  }, [token, user?.role]);

  // Inicializar FCM cuando hay sesión activa o email de cliente al cargar
  useEffect(() => {
    const hasSession = !!token;
    const isClientMode = !!localStorage.getItem('clientEmail');
    
    if (hasSession || isClientMode) {
      fcmService.initialize();
    }
  }, [token]);

  // Restaurar sesión del cliente al recargar la página (modo cliente sin token)
  useEffect(() => {
    // Si no hay usuario autenticado pero hay clientEmail en localStorage, restaurar sesión
    if (!user && !token) {
      const savedClientEmail = localStorage.getItem('clientEmail');
      const savedRole = localStorage.getItem('userRole');
      if (savedClientEmail && savedRole === 'client') {
        console.log('[Auth] Restaurando sesión de cliente:', savedClientEmail);
        setUser({ role: 'client', email: savedClientEmail });
      }
    }
  }, []); // Solo al montar

  const login = async (newToken, userData, biz = null) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('clientEmail'); // Limpiar modo cliente si inicia sesión real
    setToken(newToken);
    setUser(userData);
    
    // Si viene un negocio en la respuesta del login (como el caso del manager)
    // lo establecemos como el negocio activo inmediatamente
    if (biz) {
      setBusiness(biz);
      setMainBusiness(biz);
      localStorage.setItem('business', JSON.stringify(biz));
      localStorage.setItem('mainBusiness', JSON.stringify(biz));
    } else {
      // Si no viene, limpiamos para que el useEffect lo cargue
      setBusiness(null);
      setMainBusiness(null);
      localStorage.removeItem('business');
      localStorage.removeItem('mainBusiness');
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
    localStorage.removeItem('mainBusiness');
    localStorage.removeItem('clientEmail');
    localStorage.removeItem('userRole');
    setToken(null);
    setUser(null);
    setBusiness(null);
    setMainBusiness(null);
    setBranches([]);
  };

  const switchBusiness = (bizId) => {
    if (!bizId || bizId === 'main' || bizId === mainBusiness?.id) {
      setBusiness(mainBusiness);
      localStorage.setItem('business', JSON.stringify(mainBusiness));
      return;
    }
    const target = branches.find(b => b.id === bizId);
    if (target) {
      setBusiness(target);
      localStorage.setItem('business', JSON.stringify(target));
    }
  };

  const refreshBusiness = async () => {
    try {
      const r = await api.get('/businesses/my/business');
      setMainBusiness(r.data);
      localStorage.setItem('mainBusiness', JSON.stringify(r.data));
      
      // Actualizar sucursales
      const branchesRes = await api.get('/businesses/my/branches');
      const branchesData = branchesRes.data || [];
      setBranches(branchesData);

      // Si el activo es el principal, actualizarlo
      if (!business || business.id === r.data.id) {
        setBusiness(r.data);
        localStorage.setItem('business', JSON.stringify(r.data));
      } else {
        // Si el activo es una sucursal, buscarla en la lista actualizada y refrescarla
        const updatedBranch = branchesData.find(b => b.id === business.id);
        if (updatedBranch) {
          setBusiness(updatedBranch);
          localStorage.setItem('business', JSON.stringify(updatedBranch));
        }
      }

      return r.data;
    } catch (e) {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      token, user, business, mainBusiness, branches, bizLoading, 
      login, loginAsClient, logout, refreshBusiness, setBusiness, switchBusiness 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
