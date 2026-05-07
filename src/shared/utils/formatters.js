/**
 * Utilidades de formateo compartidas
 * Centraliza funciones de formato de moneda, fechas, etc.
 */

/**
 * Formatea un número como moneda COP (pesos colombianos)
 * @param {number} n - Número a formatear
 * @returns {string} - String formateado (ej: "$ 50.000")
 */
export const formatCurrency = (n) =>
  new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    maximumFractionDigits: 0 
  }).format(n || 0);

/**
 * Formatea una fecha con hora en zona horaria de Colombia
 * @param {string|Date} d - Fecha a formatear
 * @returns {string} - Fecha formateada (ej: "21/04/2026, 2:30 p.m.")
 */
export const formatDateTime = (d) =>
  new Date(d).toLocaleString('es-CO', { 
    dateStyle: 'short', 
    timeStyle: 'short', 
    timeZone: 'America/Bogota' 
  });

/**
 * Formatea solo la fecha en zona horaria de Colombia
 * @param {string|Date} d - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatDate = (d) =>
  new Date(d).toLocaleDateString('es-CO', { 
    timeZone: 'America/Bogota' 
  });

/**
 * Formatea solo la hora
 * @param {string|Date} d - Fecha a formatear
 * @returns {string} - Hora formateada (ej: "2:30 PM")
 */
export const formatTime = (d) =>
  new Date(d).toLocaleTimeString('es-CO', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Bogota'
  });

/**
 * Obtiene fecha actual en formato ISO para Colombia (YYYY-MM-DD)
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const getTodayISO = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });

/**
 * Verifica si una fecha es pasada (antes de hoy en Colombia)
 * @param {string} dateStr - Fecha en formato ISO
 * @returns {boolean}
 */
export const isPastDate = (dateStr) => {
  if (!dateStr) return false;
  const today = getTodayISO();
  return dateStr < today;
};

/**
 * Obtiene el mes actual en formato YYYY-MM
 * @returns {string} - Mes actual (ej: "2026-04")
 */
export const getCurrentMonth = () => {
  const options = { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options); // en-CA gives YYYY-MM
  return formatter.format(new Date());
};

// Alias para compatibilidad con código existente
export const fmt = formatCurrency;
export const fmtDate = formatDateTime;
