import { User, Car, MapPin, Play, Package, CheckCircle2 } from 'lucide-react';
import { fmt, fmtTime } from '../utils';

export const CommissionsCards = ({ data, colors, handleStatusChange, handleStartWorkDirectly, handleOpenInsumosModal }) => {
  return (
    <div className="mobile-view" style={{ display: 'none' }}>
      <div style={{ display: 'grid', gap: 12 }}>
        {data?.appointments?.map((apt) => (
          <div 
            key={apt.id}
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              padding: 16,
              boxShadow: `0 2px 8px ${colors.shadow}`,
              borderLeft: `4px solid ${
                data?.hasFieldTechnicians 
                  ? (apt.status === 'done' ? '#10b981' : 
                     apt.status === 'attention' ? '#8b5cf6' :
                     apt.status === 'confirmed' ? '#3b82f6' :
                     apt.status === 'cancelled' ? '#ef4444' : '#f59e0b')
                  : data?.isTechnicalServices 
                    ? colors.primary 
                    : (apt.hasCommission ? '#10b981' : colors.border)
              }`
            }}
          >
            {/* Header de la card - Fecha y Hora */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: 12,
              paddingBottom: 10,
              borderBottom: `1px solid ${colors.border}`
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>
                  {new Date(apt.date).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Bogota' })}
                </div>
                <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  {fmtTime(apt.date)}
                </div>
              </div>
              
              {/* Estado para técnicos de campo */}
              {data?.hasFieldTechnicians && (
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                  background: apt.status === 'done' ? '#10b981' : 
                             apt.status === 'attention' ? '#8b5cf6' :
                             apt.status === 'confirmed' ? '#3b82f6' :
                             apt.status === 'cancelled' ? '#ef4444' : '#f59e0b',
                  color: 'white'
                }}>
                  {apt.status === 'pending' && '⏳'}
                  {apt.status === 'confirmed' && '✅'}
                  {apt.status === 'attention' && '🔧'}
                  {apt.status === 'done' && '✓'}
                  {apt.status === 'cancelled' && '✗'}
                </span>
              )}
              
              {!data?.isTechnicalServices && !data?.hasFieldTechnicians && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: 16, 
                    fontWeight: 800, 
                    color: apt.hasCommission ? '#10b981' : colors.textMuted 
                  }}>
                    {apt.hasCommission ? fmt(apt.myCommission) : '-'}
                  </div>
                  {apt.hasCommission && (
                    <div style={{ fontSize: 10, color: colors.textMuted }}>
                      {apt.commissionPct}% comisión
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Servicio y Cliente */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                {apt.service}
              </div>
              <div style={{ fontSize: 13, color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} />
                {apt.client}
              </div>
            </div>

            {/* Footer - Valor y Método de pago (solo si no es técnico) */}
            {!data?.isTechnicalServices && !data?.hasFieldTechnicians && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 10,
                borderTop: `1px solid ${colors.border}`
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>
                    {fmt(apt.price)}
                  </div>
                  {apt.additional > 0 && (
                    <div style={{ fontSize: 11, color: '#f59e0b' }}>
                      + {fmt(apt.additional)} adicional
                    </div>
                  )}
                </div>
                <div style={{
                  fontSize: 11,
                  color: colors.textMuted,
                  background: colors.bgSecondary,
                  padding: '4px 8px',
                  borderRadius: 4
                }}>
                  {apt.paymentMethod === 'cash' ? '💵 Efectivo' : '📲 Transferencia'}
                </div>
              </div>
            )}

            {/* Botones de acción para técnicos de campo - Mobile */}
            {data?.hasFieldTechnicians && (
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 8,
                paddingTop: 12,
                borderTop: `1px solid ${colors.border}`,
                marginTop: 8
              }}>
                {/* En Camino - si está confirmada y no ha iniciado viaje */}
                {apt.status === 'confirmed' && (!apt.technicianStatus || apt.technicianStatus === 'not_started') && (
                  <button
                    onClick={() => handleStatusChange(apt, 'on_the_way')}
                    style={{
                      padding: '8px',
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 6,
                      border: 'none',
                      background: '#3b82f6',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4
                    }}
                  >
                    <Car size={14} /> En Camino
                  </button>
                )}
                {/* Llegué - cuando está en camino */}
                {apt.technicianStatus === 'on_the_way' && (
                  <button
                    onClick={() => handleStatusChange(apt, 'arrived')}
                    style={{
                      padding: '8px',
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 6,
                      border: 'none',
                      background: '#06b6d4',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4
                    }}
                  >
                    <MapPin size={14} /> Llegué
                  </button>
                )}
                {/* Botones cuando llegó al destino: Iniciar Trabajo e Insumos */}
                {apt.technicianStatus === 'arrived' && apt.status !== 'attention' && (
                  <>
                    <button
                      onClick={() => handleStartWorkDirectly(apt)}
                      style={{
                        padding: '10px',
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: 'none',
                        background: '#8b5cf6',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                    >
                      <Play size={16} /> Iniciar Trabajo
                    </button>
                    <button
                      onClick={() => handleOpenInsumosModal(apt)}
                      style={{
                        padding: '10px',
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: 'none',
                        background: '#f59e0b',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                    >
                      <Package size={12} /> Reporte
                    </button>
                  </>
                )}
                {apt.status === 'attention' && (
                  <>
                    <button
                      onClick={() => handleOpenInsumosModal(apt)}
                      style={{
                        padding: '10px',
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: 'none',
                        background: '#f59e0b',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                    >
                      <Package size={12} /> Reporte
                    </button>
                    <button
                      onClick={() => handleStatusChange(apt, 'done')}
                      style={{
                        padding: '10px',
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: 'none',
                        background: '#22c55e',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                    >
                      <CheckCircle2 size={16} /> Completar
                    </button>
                  </>
                )}
                {(apt.status === 'confirmed' || apt.status === 'attention') && (
                  <button
                    onClick={() => handleStatusChange(apt, 'cancelled')}
                    style={{
                      gridColumn: 'span 2',
                      padding: '8px',
                      fontSize: 11,
                      fontWeight: 500,
                      borderRadius: 6,
                      border: 'none',
                      background: '#fee2e2',
                      color: '#dc2626',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar Cita
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
