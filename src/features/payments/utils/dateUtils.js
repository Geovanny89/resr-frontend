/**
 * Payments Feature - Date Utilities
 */
import { MONTHS_ES } from './constants';

export function getMonthLabel(monthStr) {
  // monthStr es formato "YYYY-MM"
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-').map(Number);
  const monthIndex = month - 1; // 0-11
  return `${MONTHS_ES[monthIndex]} ${year}`;
}

export function getCurrentColombiaMonth() {
  const today = new Date();
  const colombiaDateStr = today.toLocaleString('en-CA', { 
    timeZone: 'America/Bogota', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
  const [yearStr, monthStr] = colombiaDateStr.split('-');
  return `${yearStr}-${monthStr}`;
}

export function parseColombiaDate() {
  const today = new Date();
  const colombiaDateStr = today.toLocaleString('en-CA', { 
    timeZone: 'America/Bogota', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
  const [yearStr, monthStr] = colombiaDateStr.split('-');
  return {
    year: parseInt(yearStr),
    month: parseInt(monthStr)
  };
}

export const fmtDate = (d) =>
  new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bogota' });
