import { ChevronLeft, ChevronRight, FileText, Download } from 'lucide-react';
import { fmt } from '../../../../shared/utils/formatters';
import { STATUS_LABELS } from '../../utils/reportHelpers';
import api from '../../../../api/client';

export function AppointmentsTable({
  appointments,
  paginatedAppointments,
  currentPage,
  totalPages,
  onPageChange,
  isTechnical,
}) {
  // Función para descargar/visualizar orden de servicio
  const handleDownloadServiceOrder = async (appointmentId, download = false) => {
    try {
      const response = await api.get(`/appointments/${appointmentId}/service-order?download=${download}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      if (download) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `orden-servicio-${appointmentId.substring(0, 8).toUpperCase()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(url, '_blank');
      }

      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error('Error al generar orden de servicio:', e);
      alert('Error al generar orden de servicio');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Detalle de citas</div>
      </div>

      {/* Desktop table */}
      <div className="table-wrapper reports-desktop-only">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Empleado</th>
              {!isTechnical && (
                <>
                  <th>Precio</th>
                  <th>Adicional</th>
                  <th>Pago</th>
                  <th>Método</th>
                </>
              )}
              <th>Estado</th>
              {isTechnical && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedAppointments.map((a) => (
              <tr key={a.id}>
                <td style={{ fontSize: 13 }}>
                  {new Date(a.startTime).toLocaleString('es-CO', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                    timeZone: 'America/Bogota',
                  })}
                </td>
                <td>{a.clientName}</td>
                <td>{a.Service?.name}</td>
                <td>{a.Employee?.User?.name}</td>
                {!isTechnical && (
                  <>
                    <td>
                      <span className="money">{fmt(a.Service?.price)}</span>
                    </td>
                    <td>
                      <span className="money" style={{ color: '#d97706' }}>
                        {fmt(a.additionalAmount)}
                      </span>
                    </td>
                    <td>
                      <span className="money positive" style={{ fontWeight: 700 }}>
                        {fmt(parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0))}
                      </span>
                    </td>
                    <td>
                      {a.status === 'done' && a.paymentMethod ? (
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: a.paymentMethod === 'cash' ? '#059669' : '#0891b2',
                            textTransform: 'uppercase',
                            background: a.paymentMethod === 'cash' ? '#d1fae5' : '#cffafe',
                            padding: '4px 10px',
                            borderRadius: 6,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {a.paymentMethod === 'cash' ? '💵 Efectivo' : '📲 Transf.'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                  </>
                )}
                <td>
                  <span className={`badge badge-${a.status}`}>{STATUS_LABELS[a.status]}</span>
                </td>
                {isTechnical && (
                  <td>
                    {a.status === 'done' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleDownloadServiceOrder(a.id, false)}
                          title="Ver Orden de Servicio"
                          style={{
                            padding: '6px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 6,
                            border: 'none',
                            cursor: 'pointer',
                            background: '#e0e7ff',
                            color: '#4338ca',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <FileText size={14} />
                          Ver
                        </button>
                        <button
                          onClick={() => handleDownloadServiceOrder(a.id, true)}
                          title="Descargar Orden de Servicio"
                          style={{
                            padding: '6px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 6,
                            border: 'none',
                            cursor: 'pointer',
                            background: '#f3e8ff',
                            color: '#7c3aed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Download size={14} />
                          PDF
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid var(--border)',
            }}
          >
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn-outline btn-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn-outline btn-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="reports-mobile-only">
        <div style={{ display: 'grid', gap: 10 }}>
          {paginatedAppointments.map((a) => (
            <AppointmentCard 
              key={a.id} 
              appointment={a} 
              isTechnical={isTechnical}
              onDownloadServiceOrder={handleDownloadServiceOrder}
            />
          ))}
        </div>

        {/* Mobile pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn-outline btn-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn-outline btn-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ appointment: a, isTechnical, onDownloadServiceOrder }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 12,
        background: 'var(--surface)',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{a.clientName || 'Cliente'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {new Date(a.startTime).toLocaleString('es-CO', {
              dateStyle: 'short',
              timeStyle: 'short',
              timeZone: 'America/Bogota',
            })}
          </div>
        </div>
        <span className={`badge badge-${a.status}`} style={{ flexShrink: 0 }}>
          {STATUS_LABELS[a.status]}
        </span>
      </div>

      <div style={{ display: 'grid', gap: 6, marginTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Servicio</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textAlign: 'right' }}>
            {a.Service?.name || '—'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Empleado</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textAlign: 'right' }}>
            {a.Employee?.User?.name || '—'}
          </span>
        </div>
        {a.status === 'done' && a.paymentMethod && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mtd. Pago</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textAlign: 'right' }}>
              {a.paymentMethod === 'cash' ? '💵 Efectivo' : '📲 Transf.'}
            </span>
          </div>
        )}
        {!isTechnical && (
          <div
            style={{
              display: 'grid',
              gap: 6,
              marginTop: 10,
              padding: 10,
              background: 'var(--bg-secondary)',
              borderRadius: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Precio Base</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{fmt(a.Service?.price)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Adicional</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#d97706' }}>{fmt(a.additionalAmount)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 10,
                marginTop: 4,
                paddingTop: 4,
                borderTop: '1px dashed var(--border)',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>TOTAL</span>
              <span className="money positive" style={{ fontSize: 13, fontWeight: 800 }}>
                {fmt(parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0))}
              </span>
            </div>
          </div>
        )}

        {/* Acciones para citas completadas - solo servicios técnicos de campo */}
        {isTechnical && a.status === 'done' && onDownloadServiceOrder && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => onDownloadServiceOrder(a.id, false)}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: '#e0e7ff',
                color: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <FileText size={14} />
              Ver Orden
            </button>
            <button
              onClick={() => onDownloadServiceOrder(a.id, true)}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: '#f3e8ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Download size={14} />
              Descargar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
