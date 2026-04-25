import { useState, useMemo } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTHS_ES, DAYS_ES, buildCalendarDays, formatDateES, todayColombia } from '../utils/reportHelpers';

export function RangeCalendarPicker({ startValue, endValue, onStartChange, onEndChange, onClose }) {
  const { colors } = useTheme();
  const today = todayColombia();
  const [y, m] = today.split('-').map(Number);
  const [viewYear, setViewYear] = useState(startValue ? parseInt(startValue.split('-')[0]) : y);
  const [viewMonth, setViewMonth] = useState(startValue ? parseInt(startValue.split('-')[1]) - 1 : m - 1);

  const days = useMemo(() => buildCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((v) => v - 1);
      setViewMonth(11);
    } else setViewMonth((v) => v - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((v) => v + 1);
      setViewMonth(0);
    } else setViewMonth((v) => v + 1);
  };

  const isInRange = (day) => {
    if (!day || !startValue || !endValue) return false;
    const dd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dd >= startValue && dd <= endValue;
  };

  const isStart = (day) => {
    if (!day || !startValue) return false;
    const dd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dd === startValue;
  };

  const isEnd = (day) => {
    if (!day || !endValue) return false;
    const dd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dd === endValue;
  };

  const handleDay = (day) => {
    if (!day) return;
    const dd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (!startValue) {
      onStartChange(dd);
    } else if (!endValue) {
      if (dd >= startValue) {
        onEndChange(dd);
      } else {
        onStartChange(dd);
        onEndChange(startValue);
      }
    } else {
      onStartChange(dd);
      onEndChange('');
    }
  };

  return (
    <div
      style={{
        background: colors.cardBg,
        borderRadius: 14,
        padding: 20,
        userSelect: 'none',
        maxWidth: 340,
        width: '100%',
        boxShadow: `0 4px 12px ${colors.shadow}`,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button
          type="button"
          onClick={prevMonth}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--primary)',
            padding: 4,
          }}
        >
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>
          {MONTHS_ES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--primary)',
            padding: 4,
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAYS_ES.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: 10,
              fontWeight: 700,
              color: colors.textSecondary,
              padding: '2px 0',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 16 }}>
        {days.map((day, i) => {
          const start = isStart(day);
          const end = isEnd(day);
          const inRange = isInRange(day);
          return (
            <div
              key={i}
              onClick={() => handleDay(day)}
              style={{
                textAlign: 'center',
                padding: '7px 2px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: start || end ? 700 : 400,
                cursor: day ? 'pointer' : 'default',
                background: start || end ? 'var(--primary)' : inRange ? 'var(--primary-bg)' : 'transparent',
                color: !day
                  ? 'transparent'
                  : start || end
                    ? 'white'
                    : inRange
                      ? 'var(--primary)'
                      : colors.text,
              }}
            >
              {day || ''}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center' }}>
        {startValue && endValue ? (
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
            ✓ {formatDateES(startValue)} a {formatDateES(endValue)}
          </span>
        ) : startValue ? (
          <span style={{ color: 'var(--warning)' }}>Selecciona fecha final</span>
        ) : (
          <span>Selecciona fecha inicial</span>
        )}
      </div>
    </div>
  );
}
