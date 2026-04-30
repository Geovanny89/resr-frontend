/**
 * Componente de lista/tabla de citas
 * Extraído de Appointments.jsx
 * Incluye: Vista de tabla (desktop) y vista de cards (móvil)
 */
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, MapPin, Wrench, User } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

/**
 * Formatea hora de una fecha
 */
const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Bogota'
  });
};

/**
 * Componente de lista de citas
 * @param {Object} props
 * @param {Array} props.appointments - Lista de citas a mostrar
 * @param {boolean} props.loading - Estado de carga
 * @param {boolean} props.isMobile - Si es vista móvil
 * @param {Object} props.colors - Colores del tema
 * @param {Object} props.business - Datos del negocio
 * @param {number} props.currentPage - Página actual
 * @param {number} props.totalPages - Total de páginas
 * @param {Function} props.onPrevPage - Callback página anterior
 * @param {Function} props.onNextPage - Callback página siguiente
 * @param {Function} props.renderActions - Función que recibe (appointment) y retorna JSX con acciones
 * @param {string} props.emptyMessage - Mensaje cuando no hay citas
 */
export function AppointmentList({
  appointments,
  loading,
  isMobile,
  colors,
  business,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  renderActions,
  emptyMessage = 'No hay citas para esta fecha'
}) {
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: colors.textSecondary }}>
        <div className="spinner" style={{ marginBottom: 16 }} />
        Cargando citas...
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        color: colors.textSecondary,
        background: colors.bgSecondary,
        borderRadius: 12,
        border: `1px dashed ${colors.border}`
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{emptyMessage}</div>
        <div style={{ fontSize: 13, marginTop: 8 }}>
          Selecciona otra fecha o crea una nueva cita
        </div>
      </div>
    );
  }

  // Vista Móvil: Cards
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {appointments.map(apt => {
          const startTime = new Date(apt.startTime);
          const endTime = new Date(apt.endTime);
          const isPast = endTime < new Date();
          
          // Determinar qué estado mostrar
          const isTerminalStatus = ['done', 'cancelled'].includes(apt.status);
          const techStatus = !isTerminalStatus && business?.hasFieldTechnicians && apt.technicianStatus && apt.technicianStatus !== 'not_started'
            ? apt.technicianStatus 
            : null;
          const displayStatus = techStatus || apt.status;
          
          return (
            <div 
              key={apt.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: 12,
                background: colors.cardBg,
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                borderLeft: `3px solid ${apt.Service?.color || '#3b82f6'}`,
                opacity: isPast && apt.status !== 'done' ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {/* Header: Hora + Cliente + Estado */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 10,
                marginBottom: 8
              }}>
                <div style={{ 
                  fontSize: 14, 
                  fontWeight: 800, 
                  color: colors.primary,
                  minWidth: 110
                }}>
                  {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: 14, 
                    fontWeight: 700, 
                    color: colors.text,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {apt.clientName || 'Sin nombre'}
                  </div>
                  <div style={{ fontSize: 11, color: colors.textSecondary }}>
                    {apt.Service?.durationMin} min • {apt.Service?.name}
                  </div>
                </div>
                
                <StatusBadge status={displayStatus} size="sm" />
              </div>

              {/* Info adicional */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: colors.textSecondary,
                marginBottom: 8
              }}>
                <span>👤 {apt.Employee?.User?.name?.split(' ')[0] || 'Sin asignar'}</span>
                {!business?.hasFieldTechnicians && !business?.isTechnicalServices && apt.paymentMethod && (
                  <>
                    <span>•</span>
                    <span style={{ color: apt.paymentMethod === 'cash' ? '#10b981' : '#3b82f6', fontWeight: 600 }}>
                      {apt.paymentMethod === 'cash' ? '💵 Efectivo' : '📲 Transferencia'}
                    </span>
                  </>
                )}
              </div>

              {/* Acciones */}
              {renderActions && (
                <div style={{ marginTop: 4 }}>
                  {renderActions(apt)}
                </div>
              )}
            </div>
          );
        })}
        
        {/* Paginación Móvil */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: 12,
            marginTop: 16,
            padding: '12px'
          }}>
            <button
              onClick={onPrevPage}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.cardBg,
                color: currentPage === 1 ? colors.textTertiary : colors.text,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ←
            </button>
            <span style={{ fontSize: 13, color: colors.textSecondary }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.cardBg,
                color: currentPage === totalPages ? colors.textTertiary : colors.text,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              →
            </button>
          </div>
        )}
      </div>
    );
  }

  // Vista Desktop: Tabla
  return (
    <div>
      <div className="table-wrapper" style={{ overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: colors.textSecondary }}>Hora</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: colors.textSecondary }}>Cliente</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: colors.textSecondary }}>Servicio</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: colors.textSecondary }}>Empleado</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: colors.textSecondary }}>Estado</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: colors.textSecondary }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(apt => {
              const isTerminalStatus = ['done', 'cancelled'].includes(apt.status);
              const techStatus = !isTerminalStatus && business?.hasFieldTechnicians && apt.technicianStatus && apt.technicianStatus !== 'not_started'
                ? apt.technicianStatus 
                : null;
              const displayStatus = techStatus || apt.status;
              
              return (
                <tr 
                  key={apt.id}
                  style={{ 
                    borderBottom: `1px solid ${colors.border}`,
                    background: colors.cardBg
                  }}
                >
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 700, color: colors.text }}>
                      {formatTime(apt.startTime)}
                    </div>
                    <div style={{ fontSize: 12, color: colors.textSecondary }}>
                      {formatTime(apt.endTime)}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600, color: colors.text }}>
                      {apt.clientName || 'Sin nombre'}
                    </div>
                    {apt.clientPhone && (
                      <div style={{ fontSize: 12, color: colors.textSecondary }}>
                        📱 {apt.clientPhone}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 500, color: colors.text }}>
                      {apt.Service?.name}
                    </div>
                    <div style={{ fontSize: 12, color: colors.textSecondary }}>
                      {apt.Service?.durationMin} min
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={14} color={colors.textSecondary} />
                      <span style={{ color: colors.text }}>
                        {apt.Employee?.User?.name || 'Sin asignar'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <StatusBadge status={displayStatus} size="md" />
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {renderActions && renderActions(apt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Paginación Desktop */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: 20,
          padding: '16px 0'
        }}>
          <div style={{ fontSize: 13, color: colors.textSecondary }}>
            Mostrando {appointments.length} citas
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onPrevPage}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.cardBg,
                color: currentPage === 1 ? colors.textTertiary : colors.text,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
            <span style={{ 
              padding: '8px 16px',
              fontSize: 13, 
              color: colors.textSecondary,
              fontWeight: 600
            }}>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.cardBg,
                color: currentPage === totalPages ? colors.textTertiary : colors.text,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentList;
