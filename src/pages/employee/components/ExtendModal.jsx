import { Timer } from 'lucide-react';

export const ExtendModal = ({ show, colors, extendingAppointment, extendMinutes, setExtendMinutes, savingExtend, onClose, onConfirm }) => {
  if (!show || !extendingAppointment) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 3000
    }}>
      <div style={{
        background: colors.cardBg, borderRadius: '16px', padding: '28px',
        maxWidth: '400px', width: '90%', border: `1px solid ${colors.border}`
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: colors.text }}>
          ⏱️ Extender Tiempo
        </h2>
        <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
          Cliente: <strong>{extendingAppointment.clientName}</strong>
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: colors.text }}>
            Minutos adicionales
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[5, 10, 15, 20, 30].map(min => (
              <button
                key={min}
                type="button"
                onClick={() => setExtendMinutes(min)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: extendMinutes === min ? '2px solid #f97316' : `1px solid ${colors.border}`,
                  background: extendMinutes === min ? '#fff7ed' : colors.inputBg,
                  color: extendMinutes === min ? '#f97316' : colors.text,
                  fontWeight: 600,
                  cursor: 'pointer',
                  flex: 1,
                  minWidth: 60
                }}
              >
                +{min}m
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={onClose} 
            style={{ 
              flex: 1, padding: '12px', borderRadius: 10, 
              border: `1px solid ${colors.border}`, 
              background: 'none', 
              color: colors.text,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            disabled={savingExtend}
            style={{ 
              flex: 1, padding: '12px', borderRadius: 10, 
              border: 'none', 
              background: '#f97316', 
              color: 'white', 
              fontWeight: 700, 
              cursor: savingExtend ? 'not-allowed' : 'pointer',
              opacity: savingExtend ? 0.7 : 1
            }}
          >
            {savingExtend ? 'Guardando...' : 'Extender'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ExtendConfirmModal = ({ show, colors, extendingAppointment, extendMinutes, savingExtend, onClose, onConfirm }) => {
  if (!show || !extendingAppointment) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 3500
    }}>
      <div style={{
        background: colors.cardBg, borderRadius: '16px', padding: '28px',
        maxWidth: '380px', width: '90%', textAlign: 'center',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
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
          Cliente: <strong>{extendingAppointment.clientName}</strong>
        </p>
        
        <p style={{ fontSize: 16, color: '#f97316', fontWeight: 700, marginBottom: 20 }}>
          +{extendMinutes} minutos
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={onClose} 
            style={{ 
              flex: 1, padding: '12px', borderRadius: 10, 
              border: `1px solid ${colors.border}`, 
              background: 'none', 
              color: colors.text,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            No, volver
          </button>
          <button 
            onClick={onConfirm} 
            disabled={savingExtend}
            style={{ 
              flex: 1, padding: '12px', borderRadius: 10, 
              border: 'none', 
              background: '#f97316', 
              color: 'white', 
              fontWeight: 700, 
              cursor: savingExtend ? 'not-allowed' : 'pointer',
              opacity: savingExtend ? 0.7 : 1
            }}
          >
            {savingExtend ? 'Guardando...' : 'Sí, extender'}
          </button>
        </div>
      </div>
    </div>
  );
};
