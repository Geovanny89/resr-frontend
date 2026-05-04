import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getWeekLabel } from '../../utils/calendar';

export default function AgendaHeader({
  colors,
  viewMode,
  selectedEmployeeId,
  onEmployeeChange,
  onPrevWeek,
  onNextWeek,
  onSwitchToWeekView,
  onGoToToday,
  employees,
  weekDates
}) {
  const monthLabel = weekDates ? getWeekLabel(weekDates) : 'Cargando...';
  return (
    <div className="agenda-header-v5">
      {/* 1. Navegación de Mes y Botones de Vista */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 20px',
          borderBottom: `1px solid ${colors.border}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            className="agenda-nav-btn" 
            onClick={onPrevWeek}
            style={{ color: colors.primary, background: `${colors.primary}10` }}
          >
            <ChevronLeft size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} color={colors.primary} />
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: colors.text, textTransform: 'capitalize' }}>
              {monthLabel}
            </h2>
          </div>
          <button 
            className="agenda-nav-btn" 
            onClick={onNextWeek}
            style={{ color: colors.primary, background: `${colors.primary}10` }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            className={`view-toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={onSwitchToWeekView}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: viewMode === 'week' ? colors.primary : colors.border,
              background: viewMode === 'week' ? colors.primary : 'transparent',
              color: viewMode === 'week' ? 'white' : colors.textSecondary,
              transition: 'all 0.2s'
            }}
          >
            Semana
          </button>
          <button 
            onClick={onGoToToday}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: `1px solid ${colors.border}`,
              background: 'transparent',
              color: colors.textSecondary,
            }}
          >
            Hoy
          </button>
        </div>
      </div>

      {/* 2. Selector de Profesionales (Avatares) */}
      <div className="professionals-scroll">
        <div 
          className={`professional-item ${!selectedEmployeeId ? 'active' : ''}`}
          onClick={() => onEmployeeChange('')}
        >
          <div className="pro-avatar-wrapper">
            <div className="pro-initials" style={{ background: !selectedEmployeeId ? colors.primary : `${colors.primary}20`, color: !selectedEmployeeId ? 'white' : colors.primary }}>
              ★
            </div>
          </div>
          <span className="pro-name">Todos</span>
        </div>

        {employees.map(emp => {
          const active = String(emp.id) === selectedEmployeeId;
          const initials = (emp.User?.name || 'E').charAt(0).toUpperCase();
          
          return (
            <div 
              key={emp.id} 
              className={`professional-item ${active ? 'active' : ''}`}
              onClick={() => onEmployeeChange(String(emp.id))}
            >
              <div className="pro-avatar-wrapper">
                {emp.photoUrl ? (
                  <img src={emp.photoUrl} alt={emp.User?.name} className="pro-avatar" />
                ) : (
                  <div className="pro-initials">
                    {initials}
                  </div>
                )}
              </div>
              <span className="pro-name">{emp.User?.name?.split(' ')[0]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
