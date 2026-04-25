import { Phone, Mail, CheckCircle, XCircle, DollarSign, History, Tag, Edit2 } from 'lucide-react';
import { fmt, fmtDate } from '../../utils/formatters';

export function getClientColumns(colors, onViewHistory, onManageTags, onEdit) {
  return [
    {
      key: 'name',
      label: 'Cliente',
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors?.primary || '#667eea'}, ${colors?.secondary || '#764ba2'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 16
          }}>
            {v?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{v || 'Sin nombre'}</div>
            {row.tags && row.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                {row.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: tag.color + '20',
                      color: tag.color,
                      fontWeight: 600
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: row.tags?.length ? 4 : 0 }}>
              {row.totalAppointments} citas • Última: {row.lastVisit ? fmtDate(row.lastVisit) : 'N/A'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contacto',
      render: (v, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {row.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Phone size={14} color="#10b981" />
              <a href={`tel:${row.phone}`} style={{ color: 'var(--text)', textDecoration: 'none' }}>
                {row.phone}
              </a>
            </div>
          )}
          {row.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Mail size={14} color="#3b82f6" />
              <a href={`mailto:${row.email}`} style={{ color: 'var(--text)', textDecoration: 'none' }}>
                {row.email}
              </a>
            </div>
          )}
          {!row.phone && !row.email && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin contacto</span>
          )}
        </div>
      )
    },
    {
      key: 'stats',
      label: 'Estadísticas',
      render: (v, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            <CheckCircle size={14} style={{ display: 'inline', marginRight: 4, color: '#10b981' }} />
            {row.completedAppointments} completadas
          </div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            <XCircle size={14} style={{ display: 'inline', marginRight: 4, color: '#ef4444' }} />
            {row.cancelledAppointments} canceladas
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors?.primary || '#667eea' }}>
            <DollarSign size={14} style={{ display: 'inline', marginRight: 4 }} />
            {fmt(row.totalSpent)} total
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (v, row) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            className="btn-outline btn-sm"
            onClick={() => onViewHistory(row)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <History size={14} />
            Historial
          </button>
          <button
            className="btn-outline btn-sm"
            onClick={() => onManageTags(row)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Tag size={14} />
            Etiquetas
          </button>
          <button
            className="btn-outline btn-sm"
            onClick={() => onEdit(row)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Edit2 size={14} />
            Editar
          </button>
        </div>
      )
    }
  ];
}
