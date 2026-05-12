import React from 'react';
import { X, Unlock } from 'lucide-react';

export function OpenShiftModal({ show, openForm, setOpenForm, onOpen, onClose, saving, colors }) {
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
            <Unlock size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Abrir Turno de Caja
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color={colors.textSecondary} />
          </button>
        </div>

        <form onSubmit={onOpen}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Monto Inicial de Caja (Base) *
            </label>
            <input
              type="number"
              value={openForm.openingAmount}
              onChange={(e) => setOpenForm({...openForm, openingAmount: e.target.value})}
              placeholder="0.00"
              required
              min="0"
              step="0.01"
              style={{
                width: '100%', padding: 10, borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.inputBg, color: colors.text,
                fontSize: 16, fontWeight: 700
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Notas
            </label>
            <textarea
              value={openForm.notes}
              onChange={(e) => setOpenForm({...openForm, notes: e.target.value})}
              placeholder="Notas del turno..."
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
                background: '#10b981', color: 'white',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Abriendo...' : 'Abrir Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
