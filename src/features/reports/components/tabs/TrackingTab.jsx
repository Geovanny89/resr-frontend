import { useState } from 'react';
import { Download, Car, MapPin, Wrench, CheckCircle, Package, ChevronDown, FileText } from 'lucide-react';
import { STATUS_CONFIG } from '../../utils/reportHelpers';
import api from '../../../../api/client';

export function TrackingTab({ appointments, onDownload, business }) {
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

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

  const trackingAppointments = appointments
    .filter((a) => a.technicianStatus && a.technicianStatus !== 'not_started')
    .sort((a, b) => new Date(b.travelStartTime || b.startTime) - new Date(a.travelStartTime || a.startTime));

  const totalPages = Math.ceil(trackingAppointments.length / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedAppointments = trackingAppointments.slice(startIndex, startIndex + perPage);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>📍 Seguimiento de Técnicos</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>Mostrar:</label>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: 13,
              }}
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>
          <button onClick={onDownload} className="btn-outline btn-sm" disabled={appointments.length === 0}>
            <Download size={16} /> Descargar
          </button>
        </div>
      </div>

      {trackingAppointments.length > 0 ? (
        <>
          {/* Info de paginación */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
              fontSize: 13,
              color: 'var(--text-muted)',
            }}
          >
            <span>
              Mostrando {startIndex + 1}-{Math.min(startIndex + perPage, trackingAppointments.length)} de{' '}
              {trackingAppointments.length} citas
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {paginatedAppointments.map((apt) => {
              const isExpanded = expandedId === apt.id;
              const statusConfig = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;

              return (
                <div
                  key={apt.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    background: 'var(--surface)',
                  }}
                >
                  {/* Header - clickable */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : apt.id)}
                    style={{
                      padding: 16,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: isExpanded ? 'var(--bg-secondary)' : 'var(--surface)',
                      borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: apt.travelStartTime ? '#3b82f6' : '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Car size={16} color="white" />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{apt.clientName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {new Date(apt.startTime).toLocaleString('es-CO', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          background: statusConfig.bg,
                          color: statusConfig.color,
                        }}
                      >
                        {statusConfig.label}
                      </span>
                      <div
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                        }}
                      >
                        <ChevronDown size={20} color="var(--text-muted)" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{ padding: 16 }}>
                      {/* Timeline */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <TimelineItem
                          icon={Car}
                          label="🚗 En Camino"
                          time={apt.travelStartTime}
                          color="#3b82f6"
                        />
                        <TimelineItem
                          icon={MapPin}
                          label="📍 Llegada al Destino"
                          time={apt.arrivalTime}
                          color="#06b6d4"
                        />
                        <TimelineItem
                          icon={Wrench}
                          label="🔧 Inicio del Servicio"
                          time={apt.serviceStartTime}
                          color="#ec4899"
                        />
                        <TimelineItem
                          icon={CheckCircle}
                          label="✅ Servicio Completado"
                          active={apt.status === 'done'}
                          color="#10b981"
                          isCompletion
                        />
                      </div>

                      {/* Parts used */}
                      {apt.workReport?.partsUsed?.length > 0 && (
                        <div
                          style={{
                            marginTop: 16,
                            padding: 12,
                            background: 'var(--bg-secondary)',
                            borderRadius: 8,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: 'var(--text)',
                              marginBottom: 8,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <Package size={16} />
                            Insumos Utilizados
                          </div>
                          <div style={{ display: 'grid', gap: 6 }}>
                            {apt.workReport.partsUsed.map((part, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: 12,
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                <span>{part.name}</span>
                                <span style={{ fontWeight: 600 }}>
                                  {part.quantity} {part.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Diagnosis */}
                      {apt.workReport?.diagnosis && (
                        <div
                          style={{
                            marginTop: 12,
                            padding: 12,
                            background: '#fef3c7',
                            borderRadius: 8,
                            borderLeft: '3px solid #f59e0b',
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
                            📝 Diagnóstico
                          </div>
                          <div style={{ fontSize: 12, color: '#78350f' }}>{apt.workReport.diagnosis}</div>
                        </div>
                      )}

                      {/* Solution */}
                      {apt.workReport?.solution && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: 12,
                            background: '#d1fae5',
                            borderRadius: 8,
                            borderLeft: '3px solid #10b981',
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#065f46', marginBottom: 4 }}>
                            🔧 Solución Aplicada
                          </div>
                          <div style={{ fontSize: 12, color: '#14532d' }}>{apt.workReport.solution}</div>
                        </div>
                      )}

                      {/* Cancelled */}
                      {apt.status === 'cancelled' && (
                        <div
                          style={{
                            marginTop: 12,
                            padding: 12,
                            background: '#fee2e2',
                            borderRadius: 8,
                            borderLeft: '3px solid #ef4444',
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b' }}>❌ CITA CANCELADA</div>
                        </div>
                      )}

                      {/* Botones para descargar orden de servicio - Solo citas completadas */}
                      {apt.status === 'done' && (
                        <div style={{ display: 'flex', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadServiceOrder(apt.id, false);
                            }}
                            style={{
                              flex: 1,
                              padding: '10px 16px',
                              fontSize: 13,
                              fontWeight: 600,
                              borderRadius: 8,
                              border: 'none',
                              cursor: 'pointer',
                              background: '#e0e7ff',
                              color: '#4338ca',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                            }}
                          >
                            <FileText size={16} />
                            Ver Orden de Servicio
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadServiceOrder(apt.id, true);
                            }}
                            style={{
                              flex: 1,
                              padding: '10px 16px',
                              fontSize: 13,
                              fontWeight: 600,
                              borderRadius: 8,
                              border: 'none',
                              cursor: 'pointer',
                              background: '#f3e8ff',
                              color: '#7c3aed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                            }}
                          >
                            <Download size={16} />
                            Descargar PDF
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 16,
                marginTop: 20,
                padding: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: 8,
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: page === 1 ? 'var(--bg-secondary)' : 'var(--surface)',
                  color: page === 1 ? 'var(--text-muted)' : 'var(--text)',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ← Anterior
              </button>

              <span
                style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', minWidth: 100, textAlign: 'center' }}
              >
                Página {page} de {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: page === totalPages ? 'var(--bg-secondary)' : 'var(--surface)',
                  color: page === totalPages ? 'var(--text-muted)' : 'var(--text)',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Package size={40} color="#cbd5e1" />
          <p style={{ color: '#94a3b8', marginTop: 12 }}>No hay citas con seguimiento de técnico en este período</p>
        </div>
      )}
    </div>
  );
}

function TimelineItem({ icon: Icon, label, time, color, active, isCompletion }) {
  const hasTime = isCompletion ? active : time;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: hasTime ? color : '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={14} color="white" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {time
            ? new Date(time).toLocaleString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : isCompletion
              ? 'Pendiente'
              : 'No registrado'}
        </div>
      </div>
    </div>
  );
}
