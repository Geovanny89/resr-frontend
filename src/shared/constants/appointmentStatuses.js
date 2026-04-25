/**
 * Constantes de estados de citas
 * Centraliza labels, colores e iconos para mantener consistencia
 */

import { 
  Clock, Check, Play, CheckCircle2, X, 
  Car, MapPin, Wrench 
} from 'lucide-react';

export const APPOINTMENT_STATUSES = {
  pending: { 
    label: 'Pendiente', 
    color: '#f59e0b', 
    cls: 'badge-pending',
    icon: 'Clock'
  },
  confirmed: { 
    label: 'Confirmada', 
    color: '#10b981', 
    cls: 'badge-confirmed',
    icon: 'Check'
  },
  on_the_way: { 
    label: 'En camino', 
    color: '#3b82f6', 
    cls: 'badge-on-the-way',
    icon: 'Car'
  },
  arrived: { 
    label: 'Llegó', 
    color: '#06b6d4', 
    cls: 'badge-arrived',
    icon: 'MapPin'
  },
  in_progress: { 
    label: 'Iniciado', 
    color: '#8b5cf6', 
    cls: 'badge-in-progress',
    icon: 'Play'
  },
  attention: { 
    label: 'En atención', 
    color: '#8b5cf6', 
    cls: 'badge-attention',
    icon: 'Wrench'
  },
  done: { 
    label: 'Completada', 
    color: '#22c55e', 
    cls: 'badge-done',
    icon: 'CheckCircle2'
  },
  cancelled: { 
    label: 'Cancelada', 
    color: '#ef4444', 
    cls: 'badge-cancelled',
    icon: 'X'
  }
};

// Estados que indican cita activa/confirmada
export const ACTIVE_STATUSES = ['pending', 'confirmed', 'on_the_way', 'arrived', 'in_progress', 'attention'];

// Estados finales
export const FINAL_STATUSES = ['done', 'cancelled'];

// Estados que pueden recibir notificaciones
export const NOTIFIABLE_STATUSES = ['pending', 'confirmed', 'attention'];

/**
 * Obtiene la configuración de un estado
 * @param {string} status - Estado de la cita
 * @returns {Object} - Configuración del estado
 */
export const getStatusConfig = (status) => 
  APPOINTMENT_STATUSES[status] || APPOINTMENT_STATUSES.pending;

/**
 * Verifica si un estado es activo (no final)
 * @param {string} status - Estado a verificar
 * @returns {boolean}
 */
export const isActiveStatus = (status) => 
  ACTIVE_STATUSES.includes(status);
