import { useState, useMemo } from 'react';
import { MONTHS_ES, DAYS_ES, todayColombia, buildCalendarDays, pad } from '../utils/dateHelpers';

export default function CalendarPicker({ value, onChange, minDate, colors }) {
  const today = minDate || todayColombia();
  const [y, m] = today.split('-').map(Number);
  const [viewYear, setViewYear] = useState(value ? parseInt(value.split('-')[0]) : y);
  const [viewMonth, setViewMonth] = useState(value ? parseInt(value.split('-')[1]) - 1 : m - 1);

  const days = useMemo(() => buildCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(v => v - 1); setViewMonth(11); }
    else setViewMonth(v => v - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(v => v + 1); setViewMonth(0); }
    else setViewMonth(v => v + 1);
  };

  const toStr = (day) => `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;

  const isPast = (day) => {
    if (!day) return true;
    const dayStr = toStr(day);
    return dayStr < today;
  };

  const isSelected = (day) => !!day && !!value && toStr(day) === value;
  const isToday = (day) => !!day && toStr(day) === today;
  const canGoPrev = () => !(viewYear === y && viewMonth === m - 1);

  const handleDay = (day) => {
    if (!day || isPast(day)) return;
    onChange(toStr(day));
  };

  return (
    <div style={{
      background: colors.cardBg,
      borderRadius: 16,
      boxShadow: `0 4px 20px ${colors.shadow}`,
      padding: '20px',
      userSelect: 'none',
      width: '100%',
      maxWidth: 340,
      border: `1px solid ${colors.border}`,
    }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button
          onClick={prevMonth}
          disabled={!canGoPrev()}
          style={{
            background: canGoPrev() ? '#eef2ff' : colors.bgSecondary,
            border: 'none', borderRadius: 8, width: 36, height: 36,
            cursor: canGoPrev() ? 'pointer' : 'not-allowed',
            fontSize: 18, color: canGoPrev() ? '#4f46e5' : colors.textSecondary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >‹</button>
        <span style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>
          {MONTHS_ES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          style={{
            background: '#eef2ff', border: 'none', borderRadius: 8,
            width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#4f46e5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >›</button>
      </div>

      {/* Días de la semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
        {DAYS_ES.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: colors.textSecondary, padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {days.map((day, i) => {
          const past = isPast(day);
          const selected = isSelected(day);
          const today_ = isToday(day);
          return (
            <div
              key={i}
              onClick={() => handleDay(day)}
              style={{
                textAlign: 'center', padding: '8px 2px', borderRadius: 8, fontSize: 13,
                fontWeight: selected ? 700 : today_ ? 600 : 400,
                cursor: day && !past ? 'pointer' : 'default',
                background: selected ? '#4f46e5' : today_ && !selected ? '#eef2ff' : 'transparent',
                color: !day ? 'transparent' : past ? colors.textSecondary : selected ? 'white' : today_ ? '#4f46e5' : colors.text,
                border: today_ && !selected ? '1.5px solid #4f46e5' : '1.5px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {day || ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}
