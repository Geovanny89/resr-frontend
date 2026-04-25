/**
 * Header de navegación para la agenda
 * Extraído de Agenda.jsx
 */
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getWeekLabel } from '../../utils/calendar';
import { formatDayHeader } from '../../utils/calendar';

export default function AgendaHeader({
  colors,
  weekDates,
  viewMode,
  selectedDate,
  employees,
  selectedEmployeeId,
  onEmployeeChange,
  onPrevWeek,
  onNextWeek,
  onSwitchToWeekView,
  onGoToToday,
}) {
  const weekLabel = getWeekLabel(weekDates);
  
  return (
    <div className="agenda-header">
      <div className="agenda-nav">
        <button className="agenda-nav-btn" onClick={onPrevWeek}>
          <ChevronLeft size={20} />
        </button>
        <span className="agenda-week-label">
          {viewMode === 'week' ? weekLabel : formatDayHeader(selectedDate)}
        </span>
        <button className="agenda-nav-btn" onClick={onNextWeek}>
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="agenda-controls">
        {/* Selector de Empleado */}
        <select
          value={selectedEmployeeId}
          onChange={(e) => onEmployeeChange(e.target.value)}
          className="agenda-employee-select"
          style={{
            padding: '8px 12px',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            background: colors.cardBg,
            color: colors.text,
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            minWidth: '150px',
            maxWidth: '200px',
          }}
        >
          <option value="">Todos los empleados</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.User?.name || 'Empleado'}
            </option>
          ))}
        </select>
        {/* Botones de vista */}
        <button 
          className="agenda-today-btn" 
          onClick={onSwitchToWeekView}
          style={{ 
            padding: '8px 16px',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            background: viewMode === 'week' ? colors.primary : colors.cardBg,
            color: viewMode === 'week' ? 'white' : colors.text,
            borderColor: viewMode === 'week' ? colors.primary : colors.border,
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Semana
        </button>
        <button 
          className="agenda-today-btn" 
          onClick={onGoToToday}
          style={{ 
            padding: '8px 16px',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            background: viewMode === 'day' ? colors.primary : colors.cardBg,
            color: viewMode === 'day' ? 'white' : colors.text,
            borderColor: viewMode === 'day' ? colors.primary : colors.border,
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Hoy
        </button>
      </div>
    </div>
  );
}
