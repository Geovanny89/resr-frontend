/**
 * Componente reutilizable para mostrar badges de estado de citas
 * Extraído de Appointments.jsx
 */
import { Clock, Check, Play, CheckCircle2, X, Car, MapPin, Wrench } from 'lucide-react';

// Configuración de estados (puede importarse de shared/constants)
const STATUS_CONFIG = {
  pending: { 
    label: 'Pendiente', 
    color: '#f59e0b', 
    bgColor: '#fff7ed',
    borderColor: '#f97316',
    icon: Clock,
    cls: 'badge-pending'
  },
  confirmed: { 
    label: 'Confirmada', 
    color: '#10b981', 
    bgColor: '#ecfdf5',
    borderColor: '#10b981',
    icon: Check,
    cls: 'badge-confirmed'
  },
  on_the_way: { 
    label: 'En camino', 
    color: '#3b82f6', 
    bgColor: '#eff6ff',
    borderColor: '#3b82f6',
    icon: Car,
    cls: 'badge-on-the-way'
  },
  arrived: { 
    label: 'Llegó', 
    color: '#06b6d4', 
    bgColor: '#ecfeff',
    borderColor: '#06b6d4',
    icon: MapPin,
    cls: 'badge-arrived'
  },
  in_progress: { 
    label: 'Iniciado', 
    color: '#8b5cf6', 
    bgColor: '#f5f3ff',
    borderColor: '#8b5cf6',
    icon: Play,
    cls: 'badge-in-progress'
  },
  attention: { 
    label: 'En atención', 
    color: '#8b5cf6', 
    bgColor: '#f5f3ff',
    borderColor: '#8b5cf6',
    icon: Wrench,
    cls: 'badge-attention'
  },
  done: { 
    label: 'Completada', 
    color: '#22c55e', 
    bgColor: '#f0fdf4',
    borderColor: '#22c55e',
    icon: CheckCircle2,
    cls: 'badge-done'
  },
  cancelled: { 
    label: 'Cancelada', 
    color: '#ef4444', 
    bgColor: '#fef2f2',
    borderColor: '#ef4444',
    icon: X,
    cls: 'badge-cancelled'
  }
};

/**
 * Badge de estado para citas
 * @param {string} status - Estado de la cita (pending, confirmed, done, etc.)
 * @param {string} size - Tamaño: 'sm' | 'md' | 'lg'
 * @param {boolean} showIcon - Mostrar icono
 * @param {object} style - Estilos adicionales
 */
export function StatusBadge({ 
  status, 
  size = 'md', 
  showIcon = true, 
  style = {},
  className = ''
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const IconComponent = config.icon;
  
  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '11px', iconSize: 10 },
    md: { padding: '4px 12px', fontSize: '13px', iconSize: 14 },
    lg: { padding: '6px 16px', fontSize: '14px', iconSize: 16 }
  };
  
  const { padding, fontSize, iconSize } = sizeStyles[size] || sizeStyles.md;
  
  return (
    <span 
      className={`badge ${config.cls} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: '20px',
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.borderColor}`,
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {showIcon && <IconComponent size={iconSize} />}
      {config.label}
    </span>
  );
}

/**
 * Obtiene la configuración de un estado sin renderizar
 * Útil para lógica condicional basada en estado
 */
export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
}

/**
 * Verifica si un estado es activo (no final)
 */
export function isActiveStatus(status) {
  return ['pending', 'confirmed', 'on_the_way', 'arrived', 'in_progress', 'attention'].includes(status);
}

/**
 * Verifica si un estado es final (done o cancelled)
 */
export function isFinalStatus(status) {
  return ['done', 'cancelled'].includes(status);
}

export default StatusBadge;
