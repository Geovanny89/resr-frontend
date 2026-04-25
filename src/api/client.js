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

// Caché simple en memoria para peticiones GET
const cache = new Map();
const CACHE_DURATION = 30000; // 30 segundos

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Usar caché solo para GET requests sin parámetros de no-cache
  if (config.method === 'get' && !config.params?.noCache) {
    const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Devolver respuesta cacheada
      config.adapter = () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {}
      });
    }
  }

  return config;
});

api.interceptors.response.use(
  (res) => {
    // Guardar en caché las respuestas GET exitosas
    if (res.config.method === 'get' && res.status === 200) {
      const cacheKey = `${res.config.url}${JSON.stringify(res.config.params || {})}`;
      cache.set(cacheKey, {
        data: res.data,
        timestamp: Date.now()
      });
    }
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

// Limpiar caché periódicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}, 60000); // Limpiar cada minuto

export default api;
