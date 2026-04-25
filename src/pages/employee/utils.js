import api from '../../api/client';

export const getImgUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const API_BASE_URL = api.defaults.baseURL || '';
  const BACKEND_URL = API_BASE_URL.replace(/\/api$/, '');
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_URL}${cleanUrl}`;
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Formateadores para EmployeeCommissions
export const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('es-CO', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    timeZone: 'America/Bogota'
  });

export const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('es-CO', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'America/Bogota'
  });

// Helper para obtener fecha en formato YYYY-MM-DD en zona horaria Colombia
export const getColombiaDateStr = (date = new Date()) => {
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
};

// Helper para obtener mes en formato YYYY-MM en zona horaria Colombia
export const getColombiaMonthStr = (date = new Date()) => {
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }).slice(0, 7);
};
