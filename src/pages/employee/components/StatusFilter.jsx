import { STATUS_COLORS } from '../constants';

export const StatusFilter = ({ statusFilter, handleFilterChange, appointments, colors }) => {
  const filters = [
    { value: 'all', label: 'Todas', color: '#6b7280' },
    { value: 'pending', label: 'Pendientes', color: STATUS_COLORS.pending },
    { value: 'confirmed', label: 'Confirmadas', color: STATUS_COLORS.confirmed },
    { value: 'attention', label: 'En Atención', color: STATUS_COLORS.attention },
    { value: 'done', label: 'Completadas', color: STATUS_COLORS.done },
    { value: 'cancelled', label: 'Canceladas', color: STATUS_COLORS.cancelled }
  ];

  return (
    <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', position: 'relative', zIndex: 5, pointerEvents: 'auto' }}>
      {filters.map(filter => (
        <button
          key={filter.value}
          onClick={() => handleFilterChange(filter.value)}
          style={{
            padding: '8px 14px',
            borderRadius: 20,
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            background: statusFilter === filter.value ? filter.color : colors.bgSecondary,
            color: statusFilter === filter.value ? 'white' : colors.text,
            opacity: statusFilter === filter.value ? 1 : 0.8,
            position: 'relative',
            zIndex: 10
          }}
        >
          {filter.label}
          {filter.value !== 'all' && (
            <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.9 }}>
              ({appointments.filter(a => a.status === filter.value).length})
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
