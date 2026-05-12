import React from 'react';
import { X, Lock } from 'lucide-react';

export function CloseShiftModal({ 
  show, 
  activeShift, 
  closeForm, 
  setCloseForm, 
  onCloseShift, 
  onClose, 
  saving, 
  colors 
}) {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16
    }}>
      <div style={{
        background: colors.cardBg,
        borderRadius: 16,
        padding: 28,
        maxWidth: 450,
        width: '100%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>
            <Lock size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Cerrar Turno (Corte de Caja)
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color={colors.textSecondary} />
          </button>
        </div>

        <div style={{
          background: '#dbeafe',
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 14
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Monto esperado:</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1e40af' }}>
            ${activeShift?.currentAmount?.toLocaleString('es-CO') || '0'}
          </div>
        </div>

        <form onSubmit={onCloseShift}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Monto Real en Caja *
            </label>
            <input
              type="number"
              value={closeForm.closingAmount}
              onChange={(e) => setCloseForm({...closeForm, closingAmount: e.target.value})}
              placeholder="0.00"
              required
              min="0"
              step="0.01"
              style={{
                width: '100%', padding: 10, borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.inputBg, color: colors.text,
                fontSize: 18, fontWeight: 700
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Notas del cierre
            </label>
            <textarea
              value={closeForm.notes}
              onChange={(e) => setCloseForm({...closeForm, notes: e.target.value})}
              placeholder="Observaciones del corte de caja..."
              rows={3}
              style={{
                width: '100%', padding: 10, borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.inputBg, color: colors.text,
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: 12, borderRadius: 10,
                border: `1px solid ${colors.border}`,
                background: 'none', color: colors.text,
                fontWeight: 600, cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1, padding: 12, borderRadius: 10,
                border: 'none',
                background: '#ef4444', color: 'white',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Cerrando...' : 'Cerrar Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
