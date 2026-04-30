/**
 * Modal de detalle de cita para agenda
 * Extraído de Agenda.jsx
 */
import { User, Clock, Package } from 'lucide-react';
import { STATUS_LABELS, hasVisibleTechnicianStatus } from '../../utils/appointmentStatus';
import { formatDateTime, formatShortDateTime } from '../../utils/calendar';

export default function AppointmentDetailModal({
  colors,
  appointment,
  hasFieldTechnicians,
  onClose,
}) {
  if (!appointment) return null;

  const showTechStatus = hasVisibleTechnicianStatus(appointment);
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: colors.cardBg,
          borderRadius: 16,
          maxWidth: 500,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: colors.text }}>
            Detalle de Cita
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: colors.textSecondary,
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Status Badge */}
          <div style={{ 
            display: 'flex', 
            gap: 8, 
            marginBottom: 20,
            flexWrap: 'wrap',
          }}>
            <span style={{
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: '12px',
              fontWeight: 600,
              background: STATUS_LABELS[appointment.status]?.bg || '#f3f4f6',
              color: STATUS_LABELS[appointment.status]?.color || '#374151',
            }}>
              {STATUS_LABELS[appointment.status]?.label || appointment.status}
            </span>
            {showTechStatus && (
              <span style={{
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: '12px',
                fontWeight: 600,
                background: STATUS_LABELS[appointment.technicianStatus]?.bg || '#f3f4f6',
                color: STATUS_LABELS[appointment.technicianStatus]?.color || '#374151',
              }}>
                {STATUS_LABELS[appointment.technicianStatus]?.label || appointment.technicianStatus}
              </span>
            )}
          </div>

          {/* Client Info */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: 4 }}>CLIENTE</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: colors.text }}>
              {appointment.clientName}
            </div>
            <div style={{ fontSize: '14px', color: colors.textSecondary, marginTop: 4 }}>
              📞 {appointment.clientPhone}
            </div>
          </div>

          {/* Service Info */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: 4 }}>SERVICIO</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.text }}>
              {appointment.Service?.name}
            </div>
          </div>

          {/* Employee Info */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: 4 }}>PROFESIONAL ASIGNADO</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.text }}>
              <User size={16} style={{ display: 'inline', marginRight: 6 }} />
              {appointment.Employee?.User?.name}
            </div>
          </div>

          {/* Time Info */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: 4 }}>HORARIO</div>
            <div style={{ fontSize: '14px', color: colors.text }}>
              <Clock size={16} style={{ display: 'inline', marginRight: 6 }} />
              {formatDateTime(appointment.startTime)}
            </div>
          </div>

          {/* Tracking Timeline (for field technicians) */}
          {hasFieldTechnicians && <TrackingTimeline appointment={appointment} colors={colors} />}
        </div>
      </div>
    </div>
  );
}

function TrackingTimeline({ appointment, colors }) {
  const timelineItems = [
    {
      key: 'travelStartTime',
      label: '🚗 En Camino',
      activeColor: '#3b82f6',
      getTime: () => formatShortDateTime(appointment.travelStartTime),
      defaultText: 'No iniciado',
    },
    {
      key: 'arrivalTime',
      label: '📍 Llegada al Destino',
      activeColor: '#06b6d4',
      getTime: () => formatShortDateTime(appointment.arrivalTime),
      defaultText: 'No llegó aún',
    },
    {
      key: 'serviceStartTime',
      label: '🔧 Inicio del Servicio',
      activeColor: '#ec4899',
      getTime: () => formatShortDateTime(appointment.serviceStartTime),
      defaultText: 'No iniciado',
    },
    {
      key: 'status',
      label: '✅ Servicio Completado',
      activeColor: '#10b981',
      isDone: appointment.status === 'done',
      getTime: () => 'Completada',
      defaultText: 'Pendiente',
    },
  ];

  return (
    <div style={{ 
      marginTop: 24, 
      padding: 16, 
      background: colors.bgSecondary, 
      borderRadius: 12,
    }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: colors.text, marginBottom: 12 }}>
        📍 Seguimiento del Técnico
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {timelineItems.map((item) => {
          const isActive = item.isDone || appointment[item.key];
          return (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: isActive ? item.activeColor : '#d1d5db',
              }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '11px', color: colors.textSecondary }}>
                  {isActive ? item.getTime() : item.defaultText}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Parts/Supplies Used */}
      {appointment.workReport?.partsUsed && appointment.workReport.partsUsed.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text, marginBottom: 8 }}>
            <Package size={14} style={{ display: 'inline', marginRight: 6 }} />
            Insumos Utilizados
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {appointment.workReport.partsUsed.map((part, idx) => (
              <div key={idx} style={{ 
                fontSize: '12px', 
                color: colors.textSecondary,
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span>{part.name}</span>
                <span>{part.quantity} {part.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Notes */}
      {appointment.workReport?.diagnosis && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text, marginBottom: 8 }}>
            📝 Diagnóstico
          </div>
          <div style={{ fontSize: '12px', color: colors.textSecondary }}>
            {appointment.workReport.diagnosis}
          </div>
        </div>
      )}
    </div>
  );
}
