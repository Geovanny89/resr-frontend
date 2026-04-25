import { Phone, Mail, X, History } from 'lucide-react';
import { STATUS_LABELS } from '../../constants';
import { fmt, fmtDate } from '../../utils/formatters';

export function ClientHistoryModal({ client, colors, onClose }) {
  if (!client) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20
      }}
    >
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 700, maxHeight: '85vh' }}
      >
        <div style={{
          padding: '20px 24px',
          background: colors?.primary || '#667eea',
          color: 'white',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 24,
              border: '3px solid rgba(255,255,255,0.3)'
            }}>
              {client.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'white' }}>{client.name}</h3>
              <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                {client.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Phone size={14} /> {client.phone}
                  </span>
                )}
                {client.email && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Mail size={14} /> {client.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost btn-icon"
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
          padding: '24px 32px',
          background: 'var(--bg)',
          borderBottom: '2px solid var(--border)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: colors?.primary }}>
              {client.totalAppointments}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>Citas totales</div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>
              {client.completedAppointments}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>Completadas</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#f59e0b' }}>
              {fmt(client.totalSpent)}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>Total gastado</div>
          </div>
        </div>

        <div style={{ padding: 24, overflow: 'auto', maxHeight: 'calc(85vh - 200px)' }}>
          <h4 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 600, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <History size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Historial de citas ({client.appointments?.length || 0})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {client.appointments?.map((appt) => (
              <div
                key={appt.id}
                style={{
                  padding: '18px 20px',
                  borderRadius: 12,
                  border: '2px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors?.primary || '#667eea';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{appt.service}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {fmtDate(appt.date)} • {appt.employee}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    background: `${STATUS_LABELS[appt.status]?.color}20`,
                    color: STATUS_LABELS[appt.status]?.color,
                    border: `2px solid ${STATUS_LABELS[appt.status]?.color}40`
                  }}>
                    {STATUS_LABELS[appt.status]?.label || appt.status}
                  </span>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 6, color: 'var(--text)' }}>
                    {fmt(appt.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
