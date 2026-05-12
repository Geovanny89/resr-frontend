import React from 'react';
import { Edit2, HelpCircle } from 'lucide-react';

export function MovementsTable({ 
  movements, 
  onCorrect, 
  colors, 
  isMobile 
}) {
  if (movements.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 60, background: colors.cardBg, borderRadius: 12, border: `1px solid ${colors.border}` }}>
        <p style={{ color: colors.textSecondary, fontSize: 16 }}>No hay movimientos en este turno</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {movements.map((m) => (
          <div key={m.id} style={{
            background: colors.cardBg,
            borderRadius: 12,
            padding: 16,
            border: `1px solid ${colors.border}`,
            opacity: m.isReversal || m.reversesMovementId ? 0.6 : 1,
            position: 'relative',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 600 }}>
                Hora: {new Date(m.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <button 
                onClick={() => onCorrect(m)}
                disabled={m.isReversal || m.reversesMovementId}
                style={{ background: 'none', border: 'none', color: '#f59e0b', padding: 0 }}
              >
                <Edit2 size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase',
                background: m.type === 'income' ? '#d1fae5' : m.type === 'expense' ? '#fee2e2' : '#fef3c7',
                color: m.type === 'income' ? '#065f46' : m.type === 'expense' ? '#991b1b' : '#92400e',
              }}>
                {m.type === 'income' ? 'Ingreso' : m.type === 'expense' ? 'Gasto' : 'Retiro'}
              </span>
              <div style={{ 
                fontWeight: 800, 
                fontSize: 18,
                color: m.type === 'income' ? '#10b981' : '#ef4444'
              }}>
                {m.type === 'income' ? '+' : '-'}${parseFloat(m.amount).toLocaleString('es-CO')}
              </div>
            </div>

            <div style={{ fontWeight: 700, fontSize: 14, color: colors.text, marginBottom: 4 }}>
              {m.description}
            </div>
            {m.notes && <div style={{ fontSize: 12, color: colors.textSecondary }}>{m.notes}</div>}
            
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.textSecondary, fontWeight: 600 }}>
              {m.paymentMethod === 'cash' ? '💵 Efectivo' : 
               m.paymentMethod === 'card' ? '💳 Tarjeta' :
               m.paymentMethod === 'transfer' ? '📲 Transf.' :
               m.paymentMethod === 'nequi' ? '📱 Nequi' : '📱 DaviPlata'}
            </div>

            {m.isReversal && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 8, fontWeight: 800 }}>⚠️ MOVIMIENTO DE REVERSA</div>}
            {m.reversesMovementId && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 8, fontWeight: 800 }}>⚪ ANULADO POR REVERSA</div>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="table-wrapper card" style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Monto</th>
            <th>Método</th>
            <th style={{ textAlign: 'right' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id} style={{ 
              opacity: m.isReversal || m.reversesMovementId ? 0.6 : 1,
              background: m.isReversal ? '#fff1f2' : m.reversesMovementId ? '#f3f4f6' : 'transparent'
            }}>
              <td style={{ fontSize: 13, color: colors.textSecondary }}>
                {new Date(m.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: m.type === 'income' ? '#d1fae5' : m.type === 'expense' ? '#fee2e2' : '#fef3c7',
                  color: m.type === 'income' ? '#065f46' : m.type === 'expense' ? '#991b1b' : '#92400e',
                }}>
                  {m.type === 'income' ? 'Ingreso' : m.type === 'expense' ? 'Gasto' : 'Retiro'}
                  {m.isReversal && ' (Rev.)'}
                </span>
              </td>
              <td>
                <div style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>{m.description}</div>
                {m.notes && <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{m.notes}</div>}
                {m.isReversal && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 2, fontWeight: 700 }}>⚠️ MOVIMIENTO DE REVERSA</div>}
                {m.reversesMovementId && <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2, fontWeight: 700 }}>⚪ ANULADO POR REVERSA</div>}
              </td>
              <td style={{ 
                fontWeight: 700, 
                fontSize: 15,
                color: m.type === 'income' ? '#10b981' : '#ef4444'
              }}>
                {m.type === 'income' ? '+' : '-'}${parseFloat(m.amount).toLocaleString('es-CO')}
              </td>
              <td>
                <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: colors.textSecondary }}>
                  {m.paymentMethod === 'cash' ? '💵 Efectivo' : 
                   m.paymentMethod === 'card' ? '💳 Tarjeta' :
                   m.paymentMethod === 'transfer' ? '📲 Transf.' :
                   m.paymentMethod === 'nequi' ? '📱 Nequi' : '📱 DaviPlata'}
                </span>
              </td>
              <td style={{ textAlign: 'right' }}>
                {!m.isReversal && !m.reversesMovementId && (
                  <button
                    onClick={() => onCorrect(m)}
                    title="Corregir movimiento"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 6,
                      borderRadius: 6,
                      cursor: 'pointer',
                      color: '#f59e0b',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#fef3c7'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <Edit2 size={16} />
                  </button>
                )}
                {(m.isReversal || m.reversesMovementId) && (
                   <div title="Este movimiento no se puede editar porque es una reversa o ha sido revertido" style={{ color: colors.textSecondary, cursor: 'help', display: 'inline-block' }}>
                     <HelpCircle size={16} />
                   </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
