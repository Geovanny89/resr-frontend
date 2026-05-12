import React from 'react';
import { X, Plus } from 'lucide-react';

export function MovementModal({ 
  show, 
  movementForm, 
  setMovementForm, 
  onCreateMovement, 
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
            <Plus size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Nuevo Movimiento
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color={colors.textSecondary} />
          </button>
        </div>

        <form onSubmit={onCreateMovement}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Tipo de Movimiento
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { value: 'income', label: '💰 Ingreso', color: '#10b981' },
                { value: 'expense', label: '💸 Gasto', color: '#ef4444' },
                { value: 'withdrawal', label: '🏧 Retiro', color: '#f59e0b' }
              ].map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMovementForm({...movementForm, type: m.value, category: m.value === 'expense' ? 'general' : ''})}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8,
                    border: movementForm.type === m.value ? '2px solid ' + m.color : `1px solid ${colors.border}`,
                    background: movementForm.type === m.value ? m.color + '20' : colors.inputBg,
                    color: movementForm.type === m.value ? m.color : colors.text,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {movementForm.type === 'expense' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                Categoría del Gasto
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'general', label: 'Variado' },
                  { value: 'supplies', label: 'Insumos' },
                  { value: 'fixed', label: 'Gasto Fijo' }
                ].map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setMovementForm({...movementForm, category: c.value})}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 8,
                      border: movementForm.category === c.value ? '2px solid #ef4444' : `1px solid ${colors.border}`,
                      background: movementForm.category === c.value ? '#fee2e2' : colors.inputBg,
                      color: movementForm.category === c.value ? '#ef4444' : colors.text,
                      fontWeight: 600, fontSize: 12, cursor: 'pointer'
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Monto *
            </label>
            <input
              type="number"
              value={movementForm.amount}
              onChange={(e) => setMovementForm({...movementForm, amount: e.target.value})}
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

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Descripción *
            </label>
            <input
              type="text"
              value={movementForm.description}
              onChange={(e) => setMovementForm({...movementForm, description: e.target.value})}
              placeholder="Ej: Pago de servicio"
              required
              style={{
                width: '100%', padding: 10, borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.inputBg, color: colors.text
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Método de Pago
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { value: 'cash', label: '💵 Efectivo' },
                { value: 'card', label: '💳 Tarjeta' },
                { value: 'transfer', label: '📲 Transf.' }
              ].map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMovementForm({...movementForm, paymentMethod: m.value})}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8,
                    border: movementForm.paymentMethod === m.value ? '2px solid #3b82f6' : `1px solid ${colors.border}`,
                    background: movementForm.paymentMethod === m.value ? '#eff6ff' : colors.inputBg,
                    color: movementForm.paymentMethod === m.value ? '#3b82f6' : colors.text,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Notas
            </label>
            <textarea
              value={movementForm.notes}
              onChange={(e) => setMovementForm({...movementForm, notes: e.target.value})}
              placeholder="Notas adicionales..."
              rows={2}
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
                background: '#3b82f6', color: 'white',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
