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
  // No usar localStorage para inicializar - siempre cargar fresco desde servidor
  // para evitar problemas con datos desactualizados (ej: hasFieldTechnicians)
  const [business, setBusiness] = useState(null);
  const [mainBusiness, setMainBusiness] = useState(null);
  const [branches, setBranches] = useState([]);
  const [bizLoading, setBizLoading] = useState(false);
  const [hasNoBusiness, setHasNoBusiness] = useState(false);
  const [initialBusinessLoaded, setInitialBusinessLoaded] = useState(false);

  // Función separada para cargar datos del negocio - definida PRIMERO para evitar closure issues
  const loadBusinessData = async () => {
    // Solo admins pueden cargar datos de negocio
    if (!user || (user.role !== 'admin' && user.role !== 'admin_suc' && user.role !== 'superadmin')) {
      return;
    }
    setBizLoading(true);
    try {
      // Cargar negocio principal SIEMPRE desde el servidor (no usar caché)
      const bizRes = await api.get('/businesses/my/business');
      const biz = bizRes.data;
      
      setMainBusiness(biz);
      localStorage.setItem('mainBusiness', JSON.stringify(biz));
      
      // Cargar sucursales
      const branchesRes = await api.get('/businesses/my/branches');
      const branchesData = branchesRes.data || [];
      setBranches(branchesData);
      
      // Siempre actualizar el negocio activo con los datos frescos del servidor
      // para asegurar que los cambios (como hasFieldTechnicians) se reflejen inmediatamente
      const currentBusinessId = business?.id;
      if (!currentBusinessId || currentBusinessId === biz.id) {
        // Si no hay negocio activo o es el principal, usar el principal
        setBusiness(biz);
        localStorage.setItem('business', JSON.stringify(biz));
      } else {
        // Si hay una sucursal activa, buscarla en la lista actualizada
        const updatedBranch = branchesData.find(b => b.id === currentBusinessId);
        if (updatedBranch) {
          setBusiness(updatedBranch);
          localStorage.setItem('business', JSON.stringify(updatedBranch));
        } else {
          // Si la sucursal ya no existe, volver al principal
          setBusiness(biz);
          localStorage.setItem('business', JSON.stringify(biz));
        }
      }
      
      console.log('[Auth] Business cargado:', biz.name, 'hasFieldTechnicians:', biz.hasFieldTechnicians);
      setInitialBusinessLoaded(true);
      setHasNoBusiness(false);
    } catch (err) {
      // 404 = admin sin negocio registrado (caso esperado, no es error)
      if (err.response?.status === 404) {
        setHasNoBusiness(true);
        console.info('[Auth] No hay negocio registrado para este usuario');
      } else {
        setHasNoBusiness(false);
        console.error('[Auth] Error loading business data:', err);
      }
    } finally {
      setBizLoading(false);
      setInitialBusinessLoaded(true);
    }
  };

  // Cargar negocio del admin y sus sucursales cuando hay token
  // Se ejecuta al montar y cuando cambia token/user para asegurar datos frescos
  useEffect(() => {
    if (token && (user?.role === 'admin' || user?.role === 'admin_suc')) {
      loadBusinessData();
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

  // useEffect de MONTAJE: Cargar negocio inmediatamente si hay token
  // Esto asegura que los datos frescos se carguen al iniciar la aplicación
  useEffect(() => {
    const initToken = localStorage.getItem('token');
    const initUser = user || JSON.parse(localStorage.getItem('user') || 'null');
    
    if (initToken && initUser && (initUser.role === 'admin' || initUser.role === 'admin_suc')) {
      console.log('[Auth] Montaje: Detectado token admin, forzando carga de negocio...');
      loadBusinessData();
    } else {
      // Si no hay token o no es admin, marcar como cargado inmediatamente
      setInitialBusinessLoaded(true);
    }
  }, []); // Solo al montar

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

  const refreshBusiness = async (updatedBusinessData = null) => {
    // Solo admins pueden refrescar datos de negocio
    if (!user || (user.role !== 'admin' && user.role !== 'admin_suc' && user.role !== 'superadmin')) {
      return null;
    }
    
    // Si se proporcionan datos actualizados, usarlos directamente sin hacer llamada GET
    if (updatedBusinessData) {
      setMainBusiness(updatedBusinessData);
      localStorage.setItem('mainBusiness', JSON.stringify(updatedBusinessData));
      setHasNoBusiness(false);
      setInitialBusinessLoaded(true);

      // Si el activo es el principal, actualizarlo
      if (!business || business.id === updatedBusinessData.id) {
        setBusiness(updatedBusinessData);
        localStorage.setItem('business', JSON.stringify(updatedBusinessData));
      }

      return updatedBusinessData;
    }
    
    // Si no se proporcionan datos, hacer la llamada GET normal
    try {
      const r = await api.get('/businesses/my/business');
      setMainBusiness(r.data);
      localStorage.setItem('mainBusiness', JSON.stringify(r.data));
      setHasNoBusiness(false);
      setInitialBusinessLoaded(true);

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
      if (e.response?.status === 404) {
        setHasNoBusiness(true);
      }
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{
      token, user, business, mainBusiness, branches, bizLoading, hasNoBusiness, initialBusinessLoaded,
      login, loginAsClient, logout, refreshBusiness, setBusiness, switchBusiness
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
