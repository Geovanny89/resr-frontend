/**
 * Modal para extender tiempo de cita
 * Extraído de Appointments.jsx
 */
import { useState } from 'react';
import { X, Timer } from 'lucide-react';

export function ExtendTimeModal({
  isOpen,
  onClose,
  appointment,
  onExtend,
  isSaving,
  colors
}) {
  const [minutes, setMinutes] = useState(15);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExtend = () => {
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    const result = await onExtend(appointment, minutes);
    if (result?.success) {
      setShowConfirm(false);
      onClose();
    }
  };

  const handleClose = () => {
    setMinutes(15);
    setShowConfirm(false);
    onClose();
  };

  if (!isOpen || !appointment) return null;

  // Modal de confirmación
  if (showConfirm) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.4)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 3500
      }}>
        <div style={{
          background: colors.cardBg, borderRadius: 16, padding: 28,
          maxWidth: 380, width: '90%', textAlign: 'center',
          border: `1px solid ${colors.border}`, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Timer size={28} color="#f97316" />
          </div>
          
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: colors.text }}>
            ¿Extender tiempo?
          </h3>
          
          <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
            Cliente: <strong>{appointment.clientName}</strong>
          </p>
          
          <p style={{ fontSize: 16, color: '#f97316', fontWeight: 700, marginBottom: 20 }}>
            +{minutes} minutos
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              onClick={() => setShowConfirm(false)} 
              style={{ 
                flex: 1, padding: 12, borderRadius: 10, 
                border: `1px solid ${colors.border}`, background: 'none', color: colors.text,
                fontWeight: 600, cursor: 'pointer'
              }}
            >
              No, volver
            </button>
            <button 
              onClick={handleConfirm} 
              disabled={isSaving}
              style={{ 
                flex: 1, padding: 12, borderRadius: 10, border: 'none',
                background: '#f97316', color: 'white', fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1
              }}
            >
              {isSaving ? 'Guardando...' : 'Sí, extender'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal principal
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: colors.cardBg, borderRadius: 12, padding: 24,
        maxWidth: 400, width: '90%', border: `1px solid ${colors.border}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: colors.text }}>
            <Timer size={20} style={{ marginRight: 8, display: 'inline' }} />
            Extender Tiempo
          </h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary }}>
            <X size={24} />
          </button>
        </div>
        
        <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
          Cliente: <strong>{appointment.clientName}</strong>
        </p>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: colors.text }}>
            Minutos adicionales
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[5, 10, 15, 20, 30].map(min => (
              <button
                key={min}
                type="button"
                onClick={() => setMinutes(min)}
                style={{
                  padding: '8px 16px', borderRadius: 8,
                  border: minutes === min ? '2px solid #f97316' : `1px solid ${colors.border}`,
                  background: minutes === min ? '#fff7ed' : colors.inputBg,
                  color: minutes === min ? '#f97316' : colors.text,
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                +{min} min
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={handleClose} 
            style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, background: 'none', color: colors.text }}
          >
            Cancelar
          </button>
          <button 
            onClick={handleExtend} 
            disabled={isSaving}
            style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#f97316', color: 'white', fontWeight: 700, opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? 'Guardando...' : 'Extender'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExtendTimeModal;
