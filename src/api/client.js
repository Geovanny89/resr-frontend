import axios from 'axios';
import { Capacitor } from '@capacitor/core';

const envApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/['"`]/g, '').trim();
const isNativeApp = Capacitor.isNativePlatform();
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Si es APK, priorizar la URL de producción si envApiUrl no está disponible o no es HTTPS
const defaultNativeURL = 'https://api-reservas.k-dice.com/api';
let rawBaseURL = isNativeApp 
  ? (envApiUrl && envApiUrl.startsWith('http') ? envApiUrl : defaultNativeURL)
  : (isLocalDev ? '/api' : (envApiUrl && envApiUrl.startsWith('http') ? envApiUrl : '/api'));

// Si por alguna razón rawBaseURL sigue siendo solo "/api" en la APK, forzar la de producción
if (isNativeApp && rawBaseURL === '/api') {
  rawBaseURL = defaultNativeURL;
}

// Limpiar la URL base de posibles barras diagonales finales para evitar doble barra //
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL.slice(0, -1) : rawBaseURL;

// Log detallado para debug
console.log('=== API Client Debug ===');
console.log('isNativeApp:', isNativeApp);
console.log('isLocalDev:', isLocalDev);
console.log('envApiUrl:', envApiUrl);
console.log('Capacitor platform:', Capacitor.getPlatform?.() || 'N/A');
console.log('API BaseURL:', baseURL);
console.log('========================');

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.message);
    console.error('API Error config:', err.config?.url);
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
