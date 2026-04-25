/**
 * Utilidades y constantes para estados de citas
 * Extraído de Agenda.jsx y otros componentes de citas
 */

export const STATUS_LABELS = {
  pending: { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7' },
  confirmed: { label: 'Confirmada', color: '#3b82f6', bg: '#dbeafe' },
  on_the_way: { label: 'En Camino', color: '#8b5cf6', bg: '#ede9fe' },
  arrived: { label: 'Llegó', color: '#06b6d4', bg: '#cffafe' },
  in_progress: { label: 'Iniciado', color: '#8b5cf6', bg: '#ede9fe' },
  attention: { label: 'En Atención', color: '#ec4899', bg: '#fce7f3' },
  done: { label: 'Completada', color: '#10b981', bg: '#d1fae5' },
  cancelled: { label: 'Cancelada', color: '#ef4444', bg: '#fee2e2' },
};

export const TECHNICIAN_STATUS_LABELS = {
  not_started: { label: 'No Iniciado', color: '#9ca3af', bg: '#f3f4f6' },
  on_the_way: { label: 'En Camino', color: '#8b5cf6', bg: '#ede9fe' },
  arrived: { label: 'Llegó', color: '#06b6d4', bg: '#cffafe' },
  in_progress: { label: 'En Atención', color: '#ec4899', bg: '#fce7f3' },
};

/**
 * Obtiene el label de estado formateado
 */
export function getStatusLabel(status) {
  return STATUS_LABELS[status]?.label || status;
}

/**
 * Obtiene el color de un estado
 */
export function getStatusColor(status) {
  return STATUS_LABELS[status]?.color || '#374151';
}

/**
 * Obtiene el background color de un estado
 */
export function getStatusBg(status) {
  return STATUS_LABELS[status]?.bg || '#f3f4f6';
}

/**
 * Determina si un estado es terminal (done o cancelled)
 */
export function isTerminalStatus(status) {
  return ['done', 'cancelled'].includes(status);
}

/**
 * Obtiene el display status para una cita considerando el estado del técnico
 */
export function getDisplayStatus(appointment) {
  const { status, technicianStatus } = appointment;
  
  // Solo mostrar estado del técnico si la cita NO está terminada ni cancelada
  const isTerminal = isTerminalStatus(status);
  const techStatus = !isTerminal && technicianStatus && technicianStatus !== 'not_started'
    ? technicianStatus 
    : null;
  
  return techStatus && STATUS_LABELS[techStatus] 
    ? STATUS_LABELS[techStatus] 
    : STATUS_LABELS[status] || STATUS_LABELS.pending;
}

/**
 * Obtiene el icono/emoji para un estado de técnico
 */
export function getTechnicianStatusIcon(status) {
  switch (status) {
    case 'on_the_way': return '🚗 En camino';
    case 'arrived': return '📍 Llegó';
    case 'in_progress': return '🔧 En atención';
    default: return '';
  }
}

/**
 * Verifica si la cita tiene estado de técnico visible
 */
export function hasVisibleTechnicianStatus(appointment) {
  const { status, technicianStatus } = appointment;
  return !isTerminalStatus(status) && 
         technicianStatus && 
         technicianStatus !== 'not_started';
}
