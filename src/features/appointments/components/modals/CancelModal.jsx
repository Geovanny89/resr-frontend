/**
 * Modal de confirmación para cancelar cita
 * Extraído de Appointments.jsx
 */
import { Trash2 } from 'lucide-react';

const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString('es-CO', { 
    dateStyle: 'short', 
    timeStyle: 'short',
    timeZone: 'America/Bogota'
  });
};

export function CancelModal({
  isOpen,
  onClose,
  appointment,
  onConfirm,
  isCancelling,
  colors
}) {
  if (!isOpen || !appointment) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: colors.cardBg, borderRadius: 16, padding: 28,
        maxWidth: 380, width: '90%', textAlign: 'center',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Trash2 size={28} color="#ef4444" />
        </div>
        
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: colors.text }}>
          ¿Cancelar esta cita?
        </h3>
        
        <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24, lineHeight: 1.5 }}>
          <strong>{appointment.clientName}</strong><br/>
          {appointment.Service?.name}<br/>
          {formatDateTime(appointment.startTime)}
        </p>

        <p style={{ fontSize: 13, color: '#92400e', background: '#fef3c7', padding: '10px 14px', borderRadius: 8, marginBottom: 20 }}>
          Esta acción no se puede deshacer
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={onClose} 
            style={{ 
              flex: 1, padding: 12, borderRadius: 10, 
              border: `1px solid ${colors.border}`, background: 'none', color: colors.text,
              fontWeight: 600, cursor: 'pointer'
            }}
          >
            No, mantener
          </button>
          <button 
            onClick={() => onConfirm(appointment)} 
            disabled={isCancelling}
            style={{ 
              flex: 1, padding: 12, borderRadius: 10, border: 'none',
              background: '#ef4444', color: 'white', fontWeight: 700,
              cursor: isCancelling ? 'not-allowed' : 'pointer', opacity: isCancelling ? 0.7 : 1
            }}
          >
            {isCancelling ? 'Cancelando...' : 'Sí, cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelModal;
