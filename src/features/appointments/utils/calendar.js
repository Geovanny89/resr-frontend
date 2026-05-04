/**
 * Utilidades de calendario específicas para agenda
 * Extraído de Agenda.jsx
 */

export const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const SHORT_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Generar horas del día (5am a 10pm)
export const HOURS = Array.from({ length: 18 }, (_, i) => i + 5);

/**
 * Obtiene la fecha actual en zona horaria Colombia
 */
export function todayColombia() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

/**
 * Obtiene las fechas de la semana (domingo a sábado) basado en una fecha
 */
export function getWeekDates(baseDate) {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diff = date.getDate() - day;
  const sunday = new Date(date.setDate(diff));
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    weekDates.push(d);
  }
  return weekDates;
}

/**
 * Formatea fecha a formato ISO (YYYY-MM-DD)
 */
export function formatDateISO(date) {
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

/**
 * Compara si dos fechas son el mismo día (en zona horaria Colombia)
 */
export function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const date1Str = d1.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  const date2Str = d2.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  return date1Str === date2Str;
}

/**
 * Obtiene la hora (0-23) de una fecha en zona horaria Colombia
 */
export function getHourFromDate(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-CA', { timeZone: 'America/Bogota', hour12: false }).split(':')[0];
}

/**
 * Obtiene el label de la semana (ej: "Enero 2026" o "Enero - Febrero 2026")
 */
export function getWeekLabel(weekDates) {
  const start = weekDates[0];
  const end = weekDates[6];
  if (start.getMonth() === end.getMonth()) {
    return `${MONTHS_ES[start.getMonth()]} ${start.getFullYear()}`;
  }
  return `${MONTHS_ES[start.getMonth()]} - ${MONTHS_ES[end.getMonth()]} ${end.getFullYear()}`;
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date) {
  return isSameDay(date, new Date());
}

/**
 * Obtiene minutos de inicio de una cita (0-59) en zona horaria Colombia
 */
export function getStartMinutes(startTime) {
  const startTimeStr = new Date(startTime).toLocaleTimeString('en-CA', { timeZone: 'America/Bogota', hour12: false });
  return parseInt(startTimeStr.split(':')[1], 10);
}

/**
 * Calcula duración en minutos entre dos fechas
 */
export function getDurationMinutes(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (end - start) / (1000 * 60);
}

/**
 * Formatea fecha para header de día (ej: "lun., ene. 15")
 */
export function formatDayHeader(date) {
  return date.toLocaleDateString('es-CO', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Formatea hora completa (ej: "14:30")
 */
export function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formatea fecha y hora completa
 */
export function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formatea fecha corta con hora (para timeline)
 */
export function formatShortDateTime(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  });
}
