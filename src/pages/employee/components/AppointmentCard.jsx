import { CheckCircle2, Car, MapPin, Package, Play, Timer, MessageSquare } from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';

export const AppointmentCard = ({
  apt,
  colors,
  business,
  completing,
  onStatusUpdate,
  onStartWorkDirectly,
  onOpenInsumosModal,
  onOpenSignatureModal,
  onOpenAdditionalModal,
  onOpenNotesModal,
  onExtendClick
}) => {
  // Debug: log estado de la cita
  console.log('[AppointmentCard] Renderizando cita:', {
    id: apt.id,
    clientName: apt.clientName,
    status: apt.status,
    technicianStatus: apt.technicianStatus,
    hasFieldTechnicians: business?.hasFieldTechnicians
  });

  const startTime = new Date(apt.startTime);
  const endTime = new Date(apt.endTime);
  const timeStr = startTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = endTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  return (
    <div key={apt.id} className="employee-appointment-card" style={{
      padding: 20,
      background: colors.cardBg,
      border: `2px solid ${STATUS_COLORS[apt.status]}`,
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      boxShadow: `0 4px 6px ${colors.shadow}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: colors.text }}>
            {timeStr} - {endTimeStr}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {apt.clientName}
          </div>
          <div style={{ fontSize: 13, color: colors.primary, fontWeight: 600, marginTop: 2 }}>
            {apt.Service?.name}
          </div>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            📞 {apt.clientPhone}
          </div>
          {apt.address && (
            <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              📍 <span style={{ fontWeight: 500 }}>{apt.address}</span>
            </div>
          )}
          {apt.notes && (
            <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
              📝 <span style={{ fontStyle: 'italic' }}>{apt.notes}</span>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            background: STATUS_COLORS[apt.status],
            color: 'white'
          }}>
            {STATUS_LABELS[apt.status]}
          </span>
        </div>
      </div>

      {/* Indicador de estado del técnico (solo para negocios con técnicos de campo) */}
      {business?.hasFieldTechnicians && apt.technicianStatus && apt.technicianStatus !== 'not_started' && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          padding: '8px 12px', 
          background: apt.technicianStatus === 'on_the_way' ? '#fef3c7' : apt.technicianStatus === 'arrived' ? '#dbeafe' : '#d1fae5',
          borderRadius: 8,
          marginBottom: 12,
          fontSize: 12,
          fontWeight: 600,
          color: apt.technicianStatus === 'on_the_way' ? '#92400e' : apt.technicianStatus === 'arrived' ? '#1e40af' : '#065f46'
        }}>
          {apt.technicianStatus === 'on_the_way' && '🚗 En Camino'}
          {apt.technicianStatus === 'arrived' && '📍 Llegó al Destino'}
          {apt.technicianStatus === 'in_progress' && '🔧 En Atención'}
          {apt.travelStartTime && apt.technicianStatus === 'on_the_way' && (
            <span style={{ fontWeight: 400, marginLeft: 8 }}>
              (Salió: {new Date(apt.travelStartTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })})
            </span>
          )}
          {apt.arrivalTime && apt.technicianStatus === 'arrived' && (
            <span style={{ fontWeight: 400, marginLeft: 8 }}>
              (Llegó: {new Date(apt.arrivalTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })})
            </span>
          )}
        </div>
      )}

      <div className="employee-appointment-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: `1px solid ${colors.border}`, paddingTop: 16 }}>
        {/* ========== UI PARA TÉCNICOS DE CAMPO ========== */}
        {business?.hasFieldTechnicians ? (
          <>
            {/* Botón Confirmar - cuando está pendiente */}
            {apt.status === 'pending' && (
              <button
                onClick={() => onStatusUpdate(apt.id, 'confirmed')}
                style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none', background: '#68d391', color: 'white', cursor: 'pointer', flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                <CheckCircle2 size={14} /> Confirmar
              </button>
            )}
            {/* Botón Cancelar para pendientes */}
            {apt.status === 'pending' && (
              <button onClick={() => onStatusUpdate(apt.id, 'cancelled')} style={{ padding: '8px 14px', fontSize: 13, background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flex: 1, minWidth: 100 }}>
                Cancelar
              </button>
            )}
            {/* Botón En Camino - solo si está confirmada y no ha iniciado viaje */}
            {apt.status === 'confirmed' && (!apt.technicianStatus || apt.technicianStatus === 'not_started') && (
              <>
                <button
                  onClick={() => onStatusUpdate(apt.id, 'on_the_way')}
                  style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  <Car size={14} /> En Camino
                </button>
              </>
            )}
            {/* Botón Llegué - cuando está en camino */}
            {apt.technicianStatus === 'on_the_way' && apt.status !== 'done' && apt.status !== 'cancelled' && (
              <>
                <button
                  onClick={() => onStatusUpdate(apt.id, 'arrived')}
                  style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none', background: '#06b6d4', color: 'white', cursor: 'pointer', flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  <MapPin size={14} /> Llegué
                </button>
              </>
            )}
            {/* Botón Iniciar - cuando llegó al destino (solo este botón, no insumos todavía) */}
            {apt.technicianStatus === 'arrived' && apt.status !== 'attention' && apt.status !== 'done' && apt.status !== 'cancelled' && (
              <>
                <button
                  onClick={() => onStartWorkDirectly(apt)}
                  style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none', background: '#8b5cf6', color: 'white', cursor: 'pointer', flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  <Play size={14} /> Iniciar
                </button>
              </>
            )}
            {/* Botones cuando el trabajo está iniciado: Insumos, Terminar, Cancelar */}
            {(apt.status === 'attention' || apt.technicianStatus === 'in_progress') && apt.status !== 'done' && apt.status !== 'cancelled' && (
              <>
                <button
                  onClick={() => onOpenInsumosModal(apt)}
                  style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none', background: '#f59e0b', color: 'white', cursor: 'pointer', flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  <Package size={14} /> Reporte
                </button>
                <button
                  onClick={() => onOpenSignatureModal(apt)}
                  disabled={completing}
                  style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none', background: '#22c55e', color: 'white', cursor: completing ? 'not-allowed' : 'pointer', opacity: completing ? 0.6 : 1, flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  <CheckCircle2 size={14} /> {completing ? 'Completando...' : 'Terminar'}
                </button>
                <button onClick={() => onStatusUpdate(apt.id, 'cancelled')} style={{ padding: '8px 14px', fontSize: 13, background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flex: 1, minWidth: 100 }}>
                  Cancelar
                </button>
              </>
            )}
            
            {/* Botón Cancelar para citas confirmadas (solo si no está en flujo de trabajo iniciado) */}
            {apt.status === 'confirmed' && (!apt.technicianStatus || apt.technicianStatus === 'not_started' || apt.technicianStatus === 'on_the_way' || apt.technicianStatus === 'arrived') && (
              <button onClick={() => onStatusUpdate(apt.id, 'cancelled')} style={{ padding: '8px 14px', fontSize: 13, background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flex: 1, minWidth: 100 }}>
                Cancelar
              </button>
            )}
          </>
        ) : (
          <>
            {/* ========== UI NORMAL (NO TÉCNICOS DE CAMPO) ========== */}
            {/* Mensaje cuando no se ha cargado el negocio */}
            {!business && (
              <div style={{ 
                padding: '8px 12px', 
                background: '#fee2e2', 
                borderRadius: 6, 
                fontSize: 12, 
                color: '#991b1b',
                marginBottom: 8,
                width: '100%'
              }}>
                ⚠️ No se pudo cargar la información del negocio. Recarga la página.
              </div>
            )}
            {apt.status === 'pending' && (
              <button onClick={() => onStatusUpdate(apt.id, 'confirmed')} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, flex: 1, minWidth: 100 }}>
                Confirmar
              </button>
            )}
            {apt.status === 'confirmed' && (
              <>
                <button onClick={() => onStatusUpdate(apt.id, 'attention')} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, background: STATUS_COLORS.attention, flex: 1, minWidth: 100 }}>
                  Iniciar Atención
                </button>
                <button onClick={() => onStatusUpdate(apt.id, 'done', apt)} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, background: STATUS_COLORS.done, flex: 1, minWidth: 100 }}>
                  Completar
                </button>
                <button onClick={() => onOpenAdditionalModal(apt)} style={{ padding: '8px 14px', fontSize: 13, background: '#f59e0b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flex: 1, minWidth: 100 }}>
                  Adicional
                </button>
              </>
            )}
            {apt.status === 'attention' && (
              <>
                <button onClick={() => onStatusUpdate(apt.id, 'done', apt)} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, background: STATUS_COLORS.done, flex: 1, minWidth: 100 }}>
                  Terminar
                </button>
                <button onClick={() => onOpenAdditionalModal(apt)} style={{ padding: '8px 14px', fontSize: 13, background: '#f59e0b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flex: 1, minWidth: 100 }}>
                  Adicional
                </button>
                <button onClick={() => onExtendClick(apt)} style={{ padding: '8px 14px', fontSize: 13, background: '#f97316', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Timer size={14} /> Extender
                </button>
              </>
            )}
            {/* Botón Notas - disponible en todos los estados */}
            <button onClick={() => onOpenNotesModal(apt)} style={{ padding: '8px 14px', fontSize: 13, background: '#14b8a6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <MessageSquare size={14} /> Notas
            </button>
            {(apt.status === 'pending' || apt.status === 'confirmed' || apt.status === 'attention') && (
              <button onClick={() => onStatusUpdate(apt.id, 'cancelled')} style={{ padding: '8px 14px', fontSize: 13, background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flex: 1, minWidth: 100 }}>
                Cancelar
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
