/**
 * Payments Feature - EmployeeDetail Component
 * Muestra el detalle de citas de un empleado con paginación
 */
import { useTheme } from '../../../context/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fmt, fmtDate, ITEMS_PER_PAGE } from '../utils';

export function EmployeeDetail({ emp, paginationPages, setPaginationPages, isMobile }) {
  const { colors } = useTheme();
  const currentPage = paginationPages[emp.name] || 1;
  const totalPages = Math.ceil(emp.appointments.length / ITEMS_PER_PAGE);
  
  const paginatedAppointments = emp.appointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const setPage = (page) => {
    setPaginationPages(prev => ({ ...prev, [emp.name]: page }));
  };
  
  return (
    <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
      {!isMobile ? (
        /* Vista para pantallas grandes (Tabla) */
        <div className="table-wrapper">
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Insumos</th>
                <th>Pago</th>
                <th>Empleado gana</th>
                <th>Negocio gana</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAppointments.map((a, i) => (
                <tr key={i}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDate(a.date)}</td>
                  <td style={{ fontWeight: 600 }}>{a.client || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{a.service}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {fmt(a.basePrice)} + {fmt(a.additional)} (Adic.)
                      </span>
                    </div>
                  </td>
                  <td>
                    {parseFloat(a.supplies) > 0 ? (
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>-{fmt(a.supplies)}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700 }}>{fmt(a.price)}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {a.paymentMethod === 'cash' ? '💵 Efectivo' : a.paymentMethod === 'transfer' ? '📲 Transf.' : '-'}
                      </span>
                    </div>
                  </td>
                  <td><span className="money positive">{fmt(a.employeeEarns)}</span></td>
                  <td><span className="money positive">{fmt(a.ownerEarns)}</span></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: colors.bgSecondary, fontWeight: 700 }}>
                <td colSpan={3} style={{ padding: '12px 16px', fontWeight: 700, color: colors.text }}>TOTALES</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: 'var(--danger)' }}>{fmt(paginatedAppointments.reduce((s, a) => s + (parseFloat(a.supplies) || 0), 0))}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="money">{fmt(paginatedAppointments.reduce((s, a) => s + (parseFloat(a.price) || 0), 0))}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="money positive">{fmt(paginatedAppointments.reduce((s, a) => s + (parseFloat(a.employeeEarns) || 0), 0))}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="money positive">{fmt(paginatedAppointments.reduce((s, a) => s + (parseFloat(a.ownerEarns) || 0), 0))}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        /* Vista para pantallas pequeñas (Cards) */
        <div style={{ display: 'grid', gap: 12 }}>
          {paginatedAppointments.map((a, i) => (
            <div key={i} style={{ 
              background: colors.bgSecondary, 
              borderRadius: 12, 
              padding: 12, 
              border: `1px solid ${colors.border}`,
              fontSize: '13px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, borderBottom: `1px solid ${colors.border}`, paddingBottom: 6 }}>
                <span style={{ fontWeight: 700, color: colors.text }}>{fmtDate(a.date)}</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{a.client || 'Cliente'}</span>
              </div>
              <div style={{ marginBottom: 10, fontSize: '14px', fontWeight: 600, color: colors.text }}>
                {a.service}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: '11px', color: colors.textSecondary }}>Precio Base:</div>
                  <div style={{ fontWeight: 600, color: colors.text }}>{fmt(a.basePrice)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#d97706' }}>Adicional:</div>
                  <div style={{ fontWeight: 600, color: '#d97706' }}>{fmt(a.additional)}</div>
                </div>
                <div style={{ gridColumn: 'span 2', marginTop: 4, paddingTop: 4, borderTop: `1px dashed ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: colors.textSecondary }}>INSUMOS:</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--danger)' }}>-{fmt(a.supplies)}</span>
                </div>
                <div style={{ gridColumn: 'span 2', marginTop: 4, paddingTop: 4, borderTop: `1px dashed ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: colors.textSecondary }}>PRECIO TOTAL:</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: colors.text }}>{fmt(a.price)}</span>
                </div>
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: '11px', color: colors.textSecondary }}>Comisión Emp:</div>
                  <div style={{ fontWeight: 700, color: 'var(--success)' }}>{fmt(a.employeeEarns)}</div>
                </div>
                <div style={{ textAlign: 'right', marginTop: 4 }}>
                  <div style={{ fontSize: '11px', color: colors.textSecondary }}>GANANCIA NEGOCIO:</div>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--success)' }}>{fmt(a.ownerEarns)}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Totales en móvil */}
          <div style={{ 
            background: 'var(--primary)', 
            color: 'white', 
            borderRadius: 12, 
            padding: 14, 
            marginTop: 4,
            boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: 4, fontWeight: 600 }}>RESUMEN DE ESTA PÁGINA</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Total Facturado:</span>
              <span style={{ fontWeight: 800 }}>{fmt(paginatedAppointments.reduce((s, a) => s + parseFloat(a.price), 0))}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <span>Ganancia Negocio:</span>
              <span style={{ fontSize: '18px', fontWeight: 900 }}>{fmt(paginatedAppointments.reduce((s, a) => s + parseFloat(a.ownerEarns), 0))}</span>
            </div>
          </div>
        </div>
      )}

      {/* Paginación (Mejorada para móvil) */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: 10, 
          marginTop: 16,
          padding: '10px 0',
          borderTop: '1px solid var(--border)'
        }}>
          <button
            className="btn-outline btn-sm"
            disabled={currentPage === 1}
            onClick={(e) => { e.stopPropagation(); setPage(currentPage - 1); }}
            style={{ minWidth: '80px', height: '36px' }}
          >
            ← Ant.
          </button>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', minWidth: '100px', textAlign: 'center' }}>
            {currentPage} / {totalPages}
          </span>
          <button
            className="btn-outline btn-sm"
            disabled={currentPage >= totalPages}
            onClick={(e) => { e.stopPropagation(); setPage(currentPage + 1); }}
            style={{ minWidth: '80px', height: '36px' }}
          >
            Sig. →
          </button>
        </div>
      )}
      <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: 8 }}>
        Mostrando {paginatedAppointments.length} de {emp.appointments.length} citas
      </div>
    </div>
  );
}
