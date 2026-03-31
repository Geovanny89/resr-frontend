import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// DEBUG: Verificar todas las variables de entorno disponibles
const allEnvVars = import.meta.env;
console.log('🔍 TODAS las env vars disponibles:', Object.keys(allEnvVars).filter(k => k.includes('VITE')));

const envApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/['"`]/g, '').trim();
const isNativeApp = Capacitor.isNativePlatform();
const hostname = window.location.hostname;
const isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1';

console.log('📍 Hostname:', hostname);
console.log('📍 isLocalDev:', isLocalDev);
console.log('📍 isNativeApp:', isNativeApp);
console.log('📍 VITE_API_URL:', envApiUrl || '(vacío)');

// Si es APK, priorizar la URL de producción si envApiUrl no está disponible o no es HTTPS
const defaultNativeURL = 'https://api-reservas.k-dice.com/api';

let rawBaseURL;
if (isNativeApp) {
  // APK: usar VITE_API_URL si existe y es válida, sino la URL de producción
  rawBaseURL = (envApiUrl && envApiUrl.startsWith('http')) ? envApiUrl : defaultNativeURL;
} else if (isLocalDev) {
  // Local: usar proxy de Vite
  rawBaseURL = '/api';
} else {
  // Web producción: usar VITE_API_URL o fallback al dominio actual
  rawBaseURL = (envApiUrl && envApiUrl.startsWith('http')) ? envApiUrl : `${window.location.origin}/api`;
}

console.log('🔌 rawBaseURL antes de limpiar:', rawBaseURL);

// Limpiar la URL base de posibles barras diagonales finales
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL.slice(0, -1) : rawBaseURL;

console.log('✅ API BaseURL FINAL:', baseURL);

const api = axios.create({
  baseURL,
});

// Interceptor para logging de requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
    baseURL: config.baseURL,
    fullURL: config.baseURL + (config.url || ''),
    hasToken: !!token
  });
  
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log(`✅ ${res.config.method?.toUpperCase()} ${res.config.url} - ${res.status}`);
    return res;
  },
  (err) => {
    console.error('❌ API Error:', err.message);
    console.error('❌ Error config:', {
      url: err.config?.url,
      baseURL: err.config?.baseURL,
      method: err.config?.method,
    });
    console.error('❌ Error response:', err.response?.status, err.response?.data);
    
    if (err.response?.status === 401) {
      // NO redirigir si es un 401 de login - eso es comportamiento esperado
      const isLoginEndpoint = err.config?.url?.includes('/auth/login');
      if (!isLoginEndpoint) {
        console.error('🔴 401 en endpoint protegido - redirigiendo a login...');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        console.log('🔴 401 en login - credenciales inválidas (no se redirige)');
      }
    }
    return Promise.reject(err);
  }
);

export default api;
