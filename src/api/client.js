import axios from 'axios';
import { Capacitor } from '@capacitor/core';

const envApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/['"`]/g, '').trim();
const isNativeApp = Capacitor.isNativePlatform();
const hostname = window.location.hostname;
const isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1';

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

// Limpiar la URL base de posibles barras diagonales finales
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL.slice(0, -1) : rawBaseURL;

const api = axios.create({
  baseURL,
});

// Interceptor para logging de requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      // NO redirigir si es un 401 de login - eso es comportamiento esperado
      const isLoginEndpoint = err.config?.url?.includes('/auth/login');
      if (!isLoginEndpoint) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
