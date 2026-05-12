import React from 'react';
import { X } from 'lucide-react';

export function CorrectionModal({ 
  show, 
  editingMovement, 
  movementForm, 
  setMovementForm, 
  onSubmitCorrection, 
  onClose, 
  saving, 
  colors 
}) {
  if (!show || !editingMovement) return null;

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
            Corregir Movimiento
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color={colors.textSecondary} />
          </button>
        </div>

        <div style={{
          background: '#fef3c7',
          padding: 12,
          borderRadius: 8,
          marginBottom: 20,
          fontSize: 13,
          color: '#92400e'
        }}>
          <strong>⚠️ Corrección con reversa:</strong> Se creará un movimiento de reversa para anular el actual, y uno nuevo con el monto correcto. Esto mantiene la trazabilidad de la caja.
        </div>

        <form onSubmit={onSubmitCorrection}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Tipo de Movimiento Correcto
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
                  onClick={() => setMovementForm({...movementForm, type: m.value})}
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

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Descripción Correcta *
            </label>
            <input
              type="text"
              value={movementForm.description}
              onChange={(e) => setMovementForm({...movementForm, description: e.target.value})}
              placeholder="Ej: Pago de luz"
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
              Monto correcto * (Pon 0 para anular)
            </label>
            <input
              type="number"
              value={movementForm.correctAmount}
              onChange={(e) => setMovementForm({...movementForm, correctAmount: e.target.value})}
              placeholder="Ej: 250000"
              min="0"
              step="0.01"
              required
              style={{
                width: '100%', padding: 10, borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.inputBg, color: colors.text,
                fontSize: 16, fontWeight: 700
              }}
            />
            {movementForm.correctAmount && (parseFloat(movementForm.correctAmount) !== parseFloat(editingMovement.amount) || movementForm.type !== editingMovement.type) && (
              <div style={{
                marginTop: 8,
                padding: 8,
                borderRadius: 6,
                background: '#f3f4f6',
                color: colors.text,
                fontSize: 13,
                fontWeight: 600
              }}>
                El saldo se ajustará automáticamente con una reversa.
              </div>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Método de Pago Correcto
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { value: 'cash', label: '💵 Efectivo' },
                { value: 'card', label: '💳 Tarjeta' },
                { value: 'transfer', label: '📲 Transferencia' }
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
              Motivo de la corrección *
            </label>
            <textarea
              value={movementForm.reason}
              onChange={(e) => setMovementForm({...movementForm, reason: e.target.value})}
              placeholder="Ej: Error al digitar, el monto correcto es 250.000 no 25.000"
              rows={3}
              required
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
              disabled={saving || !movementForm.correctAmount || !movementForm.reason}
              style={{
                flex: 1, padding: 12, borderRadius: 10,
                border: 'none',
                background: '#f59e0b', color: 'white',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving || !movementForm.correctAmount || !movementForm.reason ? 0.7 : 1
              }}
            >
              {saving ? 'Procesando...' : 'Corregir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
