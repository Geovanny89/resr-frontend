/**
 * Componente de grid de citas para el panel principal
 * Extraído de Appointments.jsx
 * Incluye: Vista de cards con todas las acciones
 */
import { StatusBadge } from '../common/StatusBadge';

const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Bogota'
  });
};

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

// Configuración de estados para colores
const STATUS_LABELS = {
  pending: { color: '#f59e0b' },
  confirmed: { color: '#10b981' },
  on_the_way: { color: '#3b82f6' },
  arrived: { color: '#06b6d4' },
  in_progress: { color: '#8b5cf6' },
  attention: { color: '#8b5cf6' },
  done: { color: '#22c55e' },
  cancelled: { color: '#ef4444' }
};

/**
 * Genera las acciones disponibles para una cita según su estado
 */
function getRowActions(appointment, business, handlers) {
  const isFieldTechnician = business?.hasFieldTechnicians || false;
  const hasInventory = business?.enabledModules?.inventory || false;
  
  // Flujo para técnicos de campo
  if (isFieldTechnician) {
    const techStatus = appointment.technicianStatus || 'not_started';
    return [
      { label: 'Editar', onClick: () => handlers.onEdit(appointment), color: '#6366f1', show: ['pending', 'confirmed'].includes(appointment.status) },
      { label: 'En camino', onClick: () => handlers.onStatusChange(appointment, 'on_the_way'), color: '#3b82f6', show: appointment.status === 'confirmed' && techStatus === 'not_started' },
      { label: 'Llegué', onClick: () => handlers.onStatusChange(appointment, 'arrived'), color: '#06b6d4', show: techStatus === 'on_the_way' },
      { label: 'Iniciar', onClick: () => handlers.onOpenInsumos(appointment), color: '#8b5cf6', show: techStatus === 'arrived' && appointment.status !== 'attention' },
      { label: 'Insumos', onClick: () => handlers.onOpenInsumos(appointment), color: '#f59e0b', show: appointment.status === 'attention' && hasInventory },
      { label: 'Completar', onClick: () => handlers.onComplete(appointment), color: '#22c55e', show: appointment.status === 'attention' },
      { label: 'Reasignar', onClick: () => handlers.onTransfer(appointment), color: '#6366f1', show: ['pending', 'confirmed'].includes(appointment.status) },
      { label: 'Cancelar', onClick: () => handlers.onCancel(appointment), color: '#ef4444', show: ['pending', 'confirmed', 'attention'].includes(appointment.status) }
    ].filter(a => a.show);
  }
  
  // Flujo normal
  return [
    { label: 'Editar', onClick: () => handlers.onEdit(appointment), color: '#6366f1', show: ['pending', 'confirmed'].includes(appointment.status) },
    { label: 'Confirmar', onClick: () => handlers.onStatusChange(appointment, 'confirmed'), color: '#10b981', show: appointment.status === 'pending' },
    { label: 'Atender', onClick: () => handlers.onStatusChange(appointment, 'attention'), color: '#3b82f6', show: appointment.status === 'confirmed' },
    { label: 'Extender', onClick: () => handlers.onExtend(appointment), color: '#f97316', show: appointment.status === 'attention' },
    { label: 'Completar', onClick: () => handlers.onComplete(appointment), color: '#8b5cf6', show: ['confirmed', 'attention'].includes(appointment.status) },
    { label: 'Reasignar', onClick: () => handlers.onTransfer(appointment), color: '#6366f1', show: ['pending', 'confirmed'].includes(appointment.status) },
    { label: 'Notas', onClick: () => handlers.onNotes(appointment), color: '#14b8a6', show: true },
    { label: 'Adicional', onClick: () => handlers.onAdditionalCharge(appointment), color: '#f59e0b', show: ['pending', 'confirmed', 'attention'].includes(appointment.status) },
    { label: 'Recibo', onClick: () => handlers.onSendReceipt(appointment.id), color: '#0ea5e9', show: appointment.status === 'done' },
    { label: 'Cancelar', onClick: () => handlers.onCancel(appointment), color: '#ef4444', show: ['pending', 'confirmed', 'attention'].includes(appointment.status) }
  ].filter(a => a.show);
}

export function AppointmentsGrid({
  appointments,
  loading,
  isMobile,
  colors,
  business,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  filteredCount,
  selectedDate,
  selectedEmployeeId,
  employees,
  handlers
}) {
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        padding: 40 
      }}>
        <div className="spinner" />
        <p style={{ marginTop: 12, color: colors.textSecondary }}>Cargando citas...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', padding: 60, background: colors.bgSecondary,
        borderRadius: 12, border: `1px dashed ${colors.border}`
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: colors.text, marginBottom: 8 }}>
          No hay citas para esta fecha
        </h3>
        <p style={{ fontSize: 14, color: colors.textSecondary }}>
          {selectedEmployeeId 
            ? 'Este empleado no tiene citas programadas. Selecciona otro empleado o fecha.'
            : 'Selecciona otra fecha o crea una nueva cita.'
          }
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Grid de citas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 10,
        maxHeight: '600px',
        overflowY: 'auto',
        paddingRight: 8
      }}>
        {appointments.filter((apt, index, self) =>
          index === self.findIndex(a => a.id === apt.id)
        ).map((apt) => {
          const startTime = new Date(apt.startTime);
          const endTime = new Date(apt.endTime);
          const isPast = endTime < new Date();
          
          // Determinar estado a mostrar
          const isTerminalStatus = ['done', 'cancelled'].includes(apt.status);
          const techStatus = !isTerminalStatus && business?.hasFieldTechnicians && apt.technicianStatus && apt.technicianStatus !== 'not_started'
            ? apt.technicianStatus 
            : null;
          const displayStatus = techStatus || apt.status;
          const statusColor = techStatus ? STATUS_LABELS[techStatus]?.color : STATUS_LABELS[apt.status]?.color;
          
          const actions = getRowActions(apt, business, handlers);
          
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
                borderLeft: `3px solid ${apt.Service?.color || statusColor || '#3b82f6'}`,
                opacity: isPast && apt.status !== 'done' ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {/* Header: Hora + Cliente + Estado */}
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8
              }}>
                <div style={{ 
                  fontSize: 14, fontWeight: 800, color: colors.primary, minWidth: 110
                }}>
                  {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: 14, fontWeight: 700, color: colors.text,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {apt.clientName || 'Sin nombre'}
                  </div>
                  <div style={{ fontSize: 11, color: colors.textSecondary }}>
                    {apt.Service?.durationMin} min • {apt.Service?.name}
                  </div>
                </div>
                
                <StatusBadge status={displayStatus} size="sm" showIcon={false} />
              </div>

              {/* Info adicional */}
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, color: colors.textSecondary, marginBottom: 8
              }}>
                <span>👤 {apt.Employee?.User?.name?.split(' ')[0] || 'Sin asignar'}</span>
                {apt.AdditionalEmployees && apt.AdditionalEmployees.length > 0 && (
                  <>
                    <span>+</span>
                    <span>
                      {apt.AdditionalEmployees.map(ae => ae.Employee?.User?.name?.split(' ')[0]).join(', ')}
                    </span>
                  </>
                )}
                {!business?.hasFieldTechnicians && !business?.isTechnicalServices && (
                  <>
                    <span>•</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>
                      {fmt(apt.finalPrice || apt.Service?.price)}
                    </span>
                  </>
                )}
              </div>

              {/* Acciones */}
              {actions.length > 0 && (
                <div style={{ 
                  display: 'flex', gap: 8, flexWrap: 'wrap',
                  paddingTop: 8, borderTop: `1px solid ${colors.border}`
                }}>
                  {actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                      style={{
                        padding: '4px 8px', fontSize: 11, fontWeight: 500,
                        borderRadius: 4, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                        background: action.color?.includes('danger') ? '#fee2e2' 
                          : action.color?.includes('primary') ? colors.primary + '20'
                          : action.color?.includes('success') ? '#d1fae5'
                          : colors.bgSecondary,
                        color: action.color?.includes('danger') ? '#dc2626'
                          : action.color?.includes('primary') ? colors.primary
                          : action.color?.includes('success') ? '#059669'
                          : colors.text
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: isMobile ? 6 : 12, marginTop: isMobile ? 16 : 24,
          padding: isMobile ? 10 : 16, background: colors.cardBg,
          borderRadius: isMobile ? 8 : 12, border: `1px solid ${colors.border}`,
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onPrevPage}
            disabled={currentPage === 1}
            style={{
              padding: isMobile ? '6px 12px' : '10px 20px', borderRadius: 6, border: 'none',
              background: currentPage === 1 ? colors.bgSecondary : colors.primary,
              color: currentPage === 1 ? colors.textSecondary : 'white',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: isMobile ? 12 : 14, fontWeight: 600
            }}
          >
            {isMobile ? '←' : '← Anterior'}
          </button>
          
          <span style={{ 
            fontSize: isMobile ? 13 : 15, color: colors.text, fontWeight: 600,
            minWidth: isMobile ? 80 : 120, textAlign: 'center'
          }}>
            {isMobile ? `${currentPage}/${totalPages}` : `Página ${currentPage} de ${totalPages}`}
          </span>
          
          <button
            onClick={onNextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: isMobile ? '6px 12px' : '10px 20px', borderRadius: 6, border: 'none',
              background: currentPage === totalPages ? colors.bgSecondary : colors.primary,
              color: currentPage === totalPages ? colors.textSecondary : 'white',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: isMobile ? 12 : 14, fontWeight: 600
            }}
          >
            {isMobile ? '→' : 'Siguiente →'}
          </button>
        </div>
      )}
    </div>
  );
}

export default AppointmentsGrid;
