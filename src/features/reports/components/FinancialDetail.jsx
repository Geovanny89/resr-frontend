import { TrendingUp } from 'lucide-react';
import { fmt } from '../../../shared/utils/formatters';
import { MONTHS_ES, EXPENSE_CATEGORIES } from '../utils/reportHelpers';

export function FinancialDetail({ financialReport, enabledModules, financialData }) {
  if (!financialReport) return null;

  const { period } = financialReport;

  return (
    <div className="card mb-4" style={{ padding: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <TrendingUp size={16} color="#3b82f6" />
        Detalle Financiero - {MONTHS_ES[parseInt(period.month) - 1]} {period.year}
      </h3>

      {/* Tabla de resumen */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Concepto</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 10px' }}>
                <span style={{ color: '#3b82f6', fontWeight: 600 }}>+</span> Ingresos por Citas
              </td>
              <td style={{ padding: '8px 10px', textAlign: 'right', color: '#3b82f6', fontWeight: 600 }}>
                {fmt(financialData.totalIncome)}
              </td>
            </tr>

            {financialData.cashIncome > 0 && (
              <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.85em', color: '#6b7280' }}>
                <td style={{ padding: '4px 10px', paddingLeft: 20 }}>
                  • Pago en Efectivo
                </td>
                <td style={{ padding: '4px 10px', textAlign: 'right' }}>
                  {fmt(financialData.cashIncome)}
                </td>
              </tr>
            )}
            
            {financialData.transferIncome > 0 && (
              <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.85em', color: '#6b7280' }}>
                <td style={{ padding: '4px 10px', paddingLeft: 20 }}>
                  • Pago por Transferencia
                </td>
                <td style={{ padding: '4px 10px', textAlign: 'right' }}>
                  {fmt(financialData.transferIncome)}
                </td>
              </tr>
            )}

            {financialData.inventoryCost > 0 && (
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 10px', paddingLeft: 20 }}>
                  <span style={{ color: '#8b5cf6' }}>-</span> Costo Insumos
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#8b5cf6' }}>
                  -{fmt(financialData.inventoryCost)}
                </td>
              </tr>
            )}
            
            {financialData.totalCommissions > 0 && (
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 10px', paddingLeft: 20 }}>
                  <span style={{ color: '#f59e0b' }}>-</span> Comisiones Empleados
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#f59e0b' }}>
                  -{fmt(financialData.totalCommissions)}
                </td>
              </tr>
            )}

            {enabledModules.expenses && financialData.totalExpenses > 0 && (
              <>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 10px', paddingLeft: 20, color: 'var(--text-muted)', fontSize: 11 }}>
                    <em>Gastos:</em>
                  </td>
                  <td style={{ padding: '6px 10px' }}></td>
                </tr>
                {Object.entries(financialReport?.details?.expenses?.byCategory || {}).map(([category, amount]) => (
                  <tr key={category} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 10px', paddingLeft: 32, fontSize: 12 }}>
                      {EXPENSE_CATEGORIES[category] || category}
                    </td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontSize: 12, color: '#ef4444' }}>
                      -{fmt(amount)}
                    </td>
                  </tr>
                ))}
              </>
            )}

            <tr style={{ background: '#f8fafc', borderTop: '2px solid var(--border)' }}>
              <td style={{ padding: 10, fontWeight: 700, fontSize: 13 }}>= UTILIDAD NETA</td>
              <td
                style={{
                  padding: 10,
                  textAlign: 'right',
                  fontWeight: 700,
                  fontSize: 14,
                  color: financialData.netProfit >= 0 ? '#10b981' : '#ef4444',
                }}
              >
                {fmt(financialData.netProfit)}
              </td>
            </tr>

            {enabledModules.deposits && financialReport?.details?.deposits?.totalHeld > 0 && (
              <tr style={{ borderTop: '1px dashed var(--border)' }}>
                <td style={{ padding: '8px 10px', color: '#f59e0b', fontSize: 12 }}>
                  <span style={{ fontWeight: 600 }}>+</span> Depósitos Retenidos
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#f59e0b', fontWeight: 600, fontSize: 12 }}>
                  {fmt(financialReport.details.deposits.totalHeld)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sección Caja (solo si está habilitada) */}
      {enabledModules.cashRegister && financialReport?.details?.cashRegister?.shiftsCount > 0 && (
        <div style={{ marginTop: 16, padding: 12, background: '#fefce8', borderRadius: 8, border: '1px solid #fde047' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 700, color: '#854d0e', display: 'flex', alignItems: 'center', gap: 6 }}>
            🏦 Control de Caja - {financialReport.details.cashRegister.shiftsCount} turno(s)
          </h4>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', color: '#64748b' }}>Base de Caja (Apertura)</td>
                <td style={{ padding: '4px 0', textAlign: 'right', color: '#64748b', fontWeight: 600 }}>
                  {fmt(financialReport.details.cashRegister.totalOpeningAmount)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#166534' }}>+ Ingresos en caja</td>
                <td style={{ padding: '4px 0', textAlign: 'right', color: '#166534', fontWeight: 600 }}>
                  {fmt(financialReport.details.cashRegister.totalIncome)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#dc2626' }}>- Gastos en caja</td>
                <td style={{ padding: '4px 0', textAlign: 'right', color: '#dc2626', fontWeight: 600 }}>
                  -{fmt(financialReport.details.cashRegister.totalExpenses)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#ea580c' }}>- Retiros</td>
                <td style={{ padding: '4px 0', textAlign: 'right', color: '#ea580c', fontWeight: 600 }}>
                  -{fmt(financialReport.details.cashRegister.totalWithdrawals)}
                </td>
              </tr>
              <tr style={{ borderTop: '1px dashed #fde047', borderBottom: '1px dashed #fde047' }}>
                <td style={{ padding: '6px 0', color: '#854d0e', fontSize: 11, fontStyle: 'italic' }}>Flujo Neto (Movimientos)</td>
                <td style={{ padding: '6px 0', textAlign: 'right', color: '#854d0e', fontSize: 11, fontStyle: 'italic' }}>
                  {fmt(financialReport.details.cashRegister.totalDifference)}
                </td>
              </tr>
              <tr style={{ borderTop: '1px solid #fde047' }}>
                <td style={{ padding: '8px 0', fontWeight: 800, color: '#854d0e', fontSize: 13 }}>= Efectivo Total Esperado</td>
                <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 800, color: '#854d0e', fontSize: 14 }}>
                  {fmt(financialReport.details.cashRegister.totalOpeningAmount + financialReport.details.cashRegister.totalDifference)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Sección Alertas de Descuadre (Citas sin Caja) */}
      {financialReport?.details?.unrecordedAppointments?.length > 0 && (
        <div style={{ marginTop: 16, padding: 12, background: '#fff1f2', borderRadius: 8, border: '1px solid #fecdd3' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 700, color: '#9f1239', display: 'flex', alignItems: 'center', gap: 6 }}>
            ⚠️ Alerta de Descuadre - {financialReport.details.unrecordedAppointments.length} cita(s) sin caja
          </h4>
          <p style={{ fontSize: 11, color: '#be123c', marginBottom: 10 }}>
            Las siguientes citas se marcaron como "Finalizadas" pero no generaron movimiento en caja (posiblemente la caja estaba cerrada).
          </p>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #fda4af', color: '#9f1239' }}>
                  <th style={{ textAlign: 'left', padding: '4px' }}>Cliente</th>
                  <th style={{ textAlign: 'left', padding: '4px' }}>Fecha/Hora</th>
                  <th style={{ textAlign: 'right', padding: '4px' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {financialReport.details.unrecordedAppointments.map(apt => (
                  <tr key={apt.id} style={{ borderBottom: '1px solid #fecdd3' }}>
                    <td style={{ padding: '6px 4px', color: '#be123c', fontWeight: 500 }}>{apt.clientName}</td>
                    <td style={{ padding: '6px 4px', color: '#e11d48' }}>
                      {new Date(apt.startTime).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', color: '#be123c', fontWeight: 600 }}>
                      {fmt(apt.finalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nota al pie */}
      <div style={{ marginTop: 12, padding: 8, background: '#f0f9ff', borderRadius: 6, fontSize: 11, color: '#0369a1' }}>
        💡 Utilidad neta = Ingresos - Gastos - Insumos - Comisiones. Los ingresos se basan únicamente en dinero real registrado en caja.
      </div>
    </div>
  );
}
