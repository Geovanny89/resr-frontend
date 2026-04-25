/**
 * Special Schedules Feature Constants
 * Domain-specific constants for special schedule management
 */

// Tipos de horarios especiales
export const SCHEDULE_TYPES = [
  { value: 'work',    label: 'Jornada de trabajo',  color: '#4f46e5', bg: '#eef2ff', icon: '💼' },
  { value: 'lunch',   label: 'Almuerzo',             color: '#d97706', bg: '#fef3c7', icon: '🍽️' },
  { value: 'blocked', label: 'Bloqueado / Permiso',  color: '#ef4444', bg: '#fee2e2', icon: '🚫' },
  { value: 'closed',  label: 'Cerrado (No laborable)', color: '#7c3aed', bg: '#ede9fe', icon: '🏖️' },
];

// Formulario inicial por defecto
export const DEFAULT_SCHEDULE_FORM = {
  employeeId: '',
  specificDate: '',
  startTime: '08:00',
  endTime: '17:00',
  type: 'work',
  description: '',
  isRecurringYearly: false,
};

// Configuración de paginación
export const ITEMS_PER_PAGE = 5;
