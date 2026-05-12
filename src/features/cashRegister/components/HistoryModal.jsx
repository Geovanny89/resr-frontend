import React from 'react';
import { X, History, Download } from 'lucide-react';

export function HistoryModal({ 
  show, 
  historyShifts, 
  selectedShiftHistory, 
  setSelectedShiftHistory, 
  historyMovements, 
  loadHistoryMovements, 
  downloadHistoryExcel, 
  downloadShiftExcel, 
  onClose, 
  colors,
  isMobile
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
        borderRadius: 24,
        padding: isMobile ? '24px 20px' : '32px 40px',
        maxWidth: 900,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
        position: 'relative',
        border: `1px solid ${colors.border}`
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 32,
          gap: 20
        }}>
          {/* Lado Izquierdo: Título */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              background: '#dbeafe', 
              padding: 10, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <History size={24} color="#3b82f6" />
            </div>
            <h2 style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 900, color: colors.text }}>
              Historial de Turnos
            </h2>
          </div>
          
          {/* CENTRO: Botón de Cerrar (X) */}
          <button 
            onClick={onClose} 
            style={{ 
              background: colors.inputBg, 
              border: `1px solid ${colors.border}`, 
              borderRadius: '50%',
              width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              order: isMobile ? -1 : 0 // En móvil sale arriba
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.backgroundColor = '#fee2e2';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = colors.inputBg;
            }}
          >
            <X size={24} color="#ef4444" />
          </button>

          {/* Lado Derecho: Controles de Informe */}
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center', 
            gap: 12, 
            width: isMobile ? '100%' : 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: 8, 
              background: colors.inputBg, 
              padding: '8px 12px', 
              borderRadius: 14, 
              border: `1px solid ${colors.border}`
            }}>
              <select 
                id="reportMonth"
                defaultValue={new Date().getMonth() + 1}
                style={{ background: 'none', border: 'none', color: colors.text, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
              >
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <select 
                id="reportYear"
                defaultValue={new Date().getFullYear()}
                style={{ background: 'none', border: 'none', color: colors.text, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                const m = document.getElementById('reportMonth').value;
                const y = document.getElementById('reportYear').value;
                downloadHistoryExcel(m, y);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 20px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center'
              }}
            >
              <Download size={18} />
              {isMobile ? 'Descargar Mes' : 'Informe Mensual'}
            </button>
          </div>
        </div>

        {!selectedShiftHistory ? (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 16 }}>
              Selecciona un turno para ver sus movimientos
            </p>
            {historyShifts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: colors.textSecondary }}>
                No hay turnos cerrados
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {historyShifts.map(shift => (
                  <div
                    key={shift.id}
                    onClick={() => loadHistoryMovements(shift.id)}
                    style={{
                      padding: 20,
                      background: colors.inputBg,
                      borderRadius: 12,
                      border: `1px solid ${colors.border}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: colors.text, textTransform: 'capitalize' }}>
                          {new Date(shift.openedAt).toLocaleDateString('es-CO', { 
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                          })}
                        </div>
                        <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, fontWeight: 600 }}>
                          {new Date(shift.openedAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {shift.closedAt ? new Date(shift.closedAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : (
                            <span style={{ color: '#10b981' }}>En curso</span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>
                          Inicio: ${shift.openingAmount?.toLocaleString('es-CO') || '0'}
                        </div>
                        <div style={{ fontWeight: 900, fontSize: 18, color: '#10b981', margin: '2px 0' }}>
                          ${shift.currentAmount?.toLocaleString('es-CO') || '0'}
                        </div>
                        <div style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 700 }}>
                          {shift.movementsCount} movimientos
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <button
                onClick={() => setSelectedShiftHistory(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  background: colors.inputBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ← Volver a turnos
              </button>
              <button
                onClick={() => downloadShiftExcel(selectedShiftHistory.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Download size={18} />
                Descargar Turno
              </button>
            </div>

            <div style={{
              background: colors.inputBg,
              padding: '20px 24px',
              borderRadius: 12,
              marginBottom: 24,
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(6, 1fr)', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 }}>Monto Inicial</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#6b7280' }}>
                    ${selectedShiftHistory.openingAmount?.toLocaleString('es-CO') || '0'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 }}>Ingresos</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#10b981' }}>
                    ${selectedShiftHistory.totalIncome?.toLocaleString('es-CO') || '0'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 }}>G. Operativos</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#ef4444' }}>
                    ${((selectedShiftHistory.totalExpenses || 0) + (selectedShiftHistory.totalWithdrawals || 0)).toLocaleString('es-CO')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 }}>G. Fijos</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#6366f1' }}>
                    ${(selectedShiftHistory.totalFixedExpenses || 0).toLocaleString('es-CO')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 }}>Insumos</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#f59e0b' }}>
                    ${selectedShiftHistory.totalSupplies?.toLocaleString('es-CO') || '0'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 }}>Monto Final</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#3b82f6' }}>
                    ${selectedShiftHistory.currentAmount?.toLocaleString('es-CO') || '0'}
                  </div>
                </div>
              </div>
              {selectedShiftHistory.difference && Math.abs(selectedShiftHistory.difference) > 0.01 && (
                <div style={{
                  marginTop: 16,
                  padding: 10,
                  borderRadius: 8,
                  background: selectedShiftHistory.difference > 0 ? '#dcfce7' : '#fee2e2',
                  fontSize: 14,
                  fontWeight: 700,
                  color: selectedShiftHistory.difference > 0 ? '#166534' : '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: selectedShiftHistory.difference > 0 ? '#166534' : '#991b1b' }}></div>
                  Diferencia en Cierre: {selectedShiftHistory.difference > 0 ? 'Sobrante' : 'Faltante'} de ${Math.abs(selectedShiftHistory.difference).toLocaleString('es-CO')}
                </div>
              )}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: colors.text }}>
              Movimientos del Turno
            </h3>
            
            {historyMovements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: colors.textSecondary }}>
                No hay movimientos en este turno
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {historyMovements.map(movement => (
                  <div key={movement.id} style={{
                    padding: '14px 18px',
                    background: colors.cardBg,
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: colors.text }}>
                        {movement.description}
                      </div>
                      <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, fontWeight: 600 }}>
                        {new Date(movement.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        {' • '}
                        {movement.paymentMethod === 'cash' ? '💵 Efectivo' : 
                         movement.paymentMethod === 'card' ? '💳 Tarjeta' :
                         movement.paymentMethod === 'transfer' ? '📲 Transf.' :
                         movement.paymentMethod === 'nequi' ? '📱 Nequi' : '📱 DaviPlata'}
                      </div>
                    </div>
                    <div style={{
                      fontWeight: 800,
                      color: movement.type === 'income' ? '#10b981' : '#ef4444',
                      fontSize: 16
                    }}>
                      {movement.type === 'income' ? '+' : '-'}${parseFloat(movement.amount).toLocaleString('es-CO')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
