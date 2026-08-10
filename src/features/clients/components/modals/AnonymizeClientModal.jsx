import { Trash2, X, AlertTriangle } from 'lucide-react';

/**
 * Confirma quitar un cliente de la lista (anonimizar).
 * Las citas se conservan como "Cliente eliminado".
 */
export function AnonymizeClientModal({ client, colors, onClose, onConfirm }) {
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
        onClick={e => e.stopPropagation()}
        style={{
          background: colors?.cardBg || 'var(--card-bg)',
          borderRadius: 16,
          maxWidth: 440,
          width: '100%',
          border: `1px solid ${colors?.border || 'var(--border)'}`,
          overflow: 'hidden'
        }}
      >
        <div style={{
          padding: '18px 22px',
          background: '#dc2626',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trash2 size={20} color="#ffffff" />
            Eliminar de la lista
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: 'rgba(255,255,255,0.25)',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
          >
            <X size={20} color="#ffffff" strokeWidth={2.5} />
          </button>
        </div>

        <div style={{ padding: 22 }}>
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
            display: 'flex',
            gap: 10,
            fontSize: 13,
            color: '#92400e'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              El cliente saldrá de <strong>Mis Clientes</strong>.
              Sus citas <strong>no se borran</strong>: quedan como “Cliente eliminado”
              (historial, pagos y comisiones se conservan).
            </div>
          </div>

          <p style={{ fontSize: 14, color: colors?.text || '#111', margin: '0 0 20px' }}>
            ¿Eliminar a <strong>{client.name || 'este cliente'}</strong>
            {client.phone ? ` (${client.phone})` : ''}
            {client.email ? ` · ${client.email}` : ''}
            {' '}de la lista?
            {client.totalAppointments != null && (
              <span style={{ color: colors?.textSecondary || '#666' }}>
                {' '}· {client.totalAppointments} cita(s)
              </span>
            )}
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                border: `1px solid ${colors?.border || 'var(--border)'}`,
                background: 'transparent',
                fontWeight: 600,
                cursor: 'pointer',
                color: colors?.textSecondary || '#666'
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              style={{
                flex: 2,
                padding: 12,
                borderRadius: 10,
                border: 'none',
                background: '#dc2626',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Eliminar de la lista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnonymizeClientModal;
