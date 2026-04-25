import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';

export const CommissionsViewSelector = ({ view, onViewChange, colors }) => {
  const views = [
    { key: 'day', label: 'Día', icon: CalendarDays },
    { key: 'week', label: 'Semana', icon: CalendarRange },
    { key: 'month', label: 'Mes', icon: Calendar }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: 8,
      marginBottom: 20,
      flexWrap: 'wrap'
    }}>
      {views.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onViewChange(key)}
          style={{
            flex: 1,
            minWidth: 80,
            padding: '10px 16px',
            borderRadius: 8,
            border: view === key ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
            background: view === key ? `${colors.primary}15` : colors.bgSecondary,
            color: view === key ? colors.primary : colors.text,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s'
          }}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  );
};
