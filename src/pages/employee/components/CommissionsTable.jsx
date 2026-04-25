import { User, Car, MapPin, Play, Package, CheckCircle2 } from 'lucide-react';
import { fmt, fmtDate, fmtTime } from '../utils';

export const CommissionsTable = ({ data, colors, handleStatusChange, handleStartWorkDirectly, handleOpenInsumosModal }) => {
  return (
    <div className="desktop-view" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table className="commissions-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: (data?.isTechnicalServices || data?.hasFieldTechnicians) ? '200px' : '320px' }}>
        <thead>
          <tr style={{ background: colors.bgSecondary }}>
            <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Fecha
            </th>
            <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Servicio / Cliente
            </th>
            {data?.hasFieldTechnicians && (
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Estado
              </th>
            )}
            {!data?.isTechnicalServices && !data?.hasFieldTechnicians && (
              <>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Valor
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tu Comisión
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data?.appointments?.map((apt, idx) => (
            <tr 
              key={apt.id} 
              style={{ 
                borderTop: `1px solid ${colors.border}`,
                background: idx % 2 === 0 ? 'transparent' : colors.bgSecondary
              }}
            >
              <td style={{ padding: '16px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, whiteSpace: 'nowrap' }}>
                  {fmtDate(apt.date)}
                </div>
                <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  {fmtTime(apt.date)}
                </div>
              </td>
              <td style={{ padding: '16px', maxWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {apt.service}
                </div>
                <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <User size={12} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{apt.client}</span>
                </div>
                {!data?.isTechnicalServices && !data?.hasFieldTechnicians && apt.additional > 0 && (
                  <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4, whiteSpace: 'nowrap' }}>
                    + Adicional: {fmt(apt.additional)}
                  </div>
                )}
              </td>
              {/* Estado y Acciones para técnicos de campo */}
              {data?.hasFieldTechnicians && (
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    background: apt.status === 'done' ? '#10b981' : 
                               apt.status === 'attention' ? '#8b5cf6' :
                               apt.status === 'confirmed' ? '#3b82f6' :
                               apt.status === 'cancelled' ? '#ef4444' : '#f59e0b',
                    color: 'white',
                    marginBottom: 8
                  }}>
                    {apt.status === 'pending' && '⏳ Pendiente'}
                    {apt.status === 'confirmed' && '✅ Confirmada'}
                    {apt.status === 'attention' && '🔧 En Atención'}
                    {apt.status === 'done' && '✓ Completada'}
                    {apt.status === 'cancelled' && '✗ Cancelada'}
                  </span>
                  
                  {/* Botones de acción para flujo de campo */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {/* En Camino - si está confirmada y no ha iniciado viaje */}
                    {apt.status === 'confirmed' && (!apt.technicianStatus || apt.technicianStatus === 'not_started') && (
                      <button
                        onClick={() => handleStatusChange(apt, 'on_the_way')}
                        style={{
                          padding: '6px 10px',
                          fontSize: 11,
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
                        <Car size={12} /> En Camino
                      </button>
                    )}
                    {/* Llegué - cuando está en camino */}
                    {apt.technicianStatus === 'on_the_way' && (
                      <button
                        onClick={() => handleStatusChange(apt, 'arrived')}
                        style={{
                          padding: '6px 10px',
                          fontSize: 11,
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
                        <MapPin size={12} /> Llegué
                      </button>
                    )}
                    {/* Botones cuando llegó al destino: Iniciar Trabajo e Insumos */}
                    {apt.technicianStatus === 'arrived' && apt.status !== 'attention' && apt.status !== 'done' && apt.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => handleStartWorkDirectly(apt)}
                          style={{
                            padding: '6px 10px',
                            fontSize: 11,
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
                          <Play size={12} /> Iniciar
                        </button>
                        <button
                          onClick={() => handleOpenInsumosModal(apt)}
                          style={{
                            padding: '6px 10px',
                            fontSize: 11,
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
                    {(apt.status === 'attention' || apt.technicianStatus === 'in_progress') && apt.status !== 'done' && apt.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => handleOpenInsumosModal(apt)}
                          style={{
                            padding: '6px 10px',
                            fontSize: 11,
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
                            padding: '6px 10px',
                            fontSize: 11,
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
                          <CheckCircle2 size={12} /> Terminar
                        </button>
                      </>
                    )}
                    {(apt.status === 'confirmed' || apt.status === 'attention') && (
                      <button
                        onClick={() => handleStatusChange(apt, 'cancelled')}
                        style={{
                          padding: '6px 10px',
                          fontSize: 10,
                          fontWeight: 500,
                          borderRadius: 6,
                          border: 'none',
                          background: '#fee2e2',
                          color: '#dc2626',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
              )}
              {/* Valor y comisión - Solo para vista normal */}
              {!data?.isTechnicalServices && !data?.hasFieldTechnicians && (
                <>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                      {fmt(apt.price)}
                    </div>
                    {apt.additional > 0 && (
                      <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 2 }}>
                        + {fmt(apt.additional)} adicional
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                      {apt.paymentMethod === 'cash' ? '💵 Efectivo' : '📲 Transferencia'}
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 700, 
                      color: apt.hasCommission ? '#10b981' : colors.textMuted 
                    }}>
                      {apt.hasCommission ? fmt(apt.myCommission) : '-'}
                    </div>
                    {apt.hasCommission && (
                      <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                        {apt.commissionPct}%
                      </div>
                    )}
                    {!apt.hasCommission && (
                      <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                        Sin comisión
                      </div>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
