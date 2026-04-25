/**
 * Payments Feature - MonthYearPicker Component
 */
import { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTHS_ES, getMonthLabel, parseColombiaDate } from '../utils';

export function MonthYearPicker({ value, onChange, onClose }) {
  const { colors } = useTheme();
  
  // Obtener fecha actual en zona horaria de Colombia (UTC-5)
  const { year: currentYear, month: currentMonth } = parseColombiaDate();

  // Extraer correctamente año y mes del string YYYY-MM
  const [viewYear, setViewYear] = useState(value ? parseInt(value.split('-')[0]) : currentYear);
  const [viewMonth, setViewMonth] = useState(value ? parseInt(value.split('-')[1]) : currentMonth);

  const prevYear = () => setViewYear(v => v - 1);
  const nextYear = () => setViewYear(v => v + 1);

  const handleMonth = (monthNumber) => {
    const monthStr = String(monthNumber).padStart(2, '0');
    const result = `${viewYear}-${monthStr}`;
    onChange(result);
    onClose();
  };

  const isSelected = (monthNumber) => {
    if (!value) return false;
    const [y, m] = value.split('-').map(Number);
    return y === viewYear && m === monthNumber;
  };

  return (
    <div style={{
      background: colors.cardBg, borderRadius: 14, padding: 24, userSelect: 'none',
      maxWidth: 360, width: '100%', boxShadow: `0 4px 12px ${colors.shadow}`, border: `1px solid ${colors.border}`
    }}>
      {/* Selector de año */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button type="button" onClick={prevYear}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 4 }}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 18, color: colors.text, minWidth: 80, textAlign: 'center' }}>
          {viewYear}
        </span>
        <button type="button" onClick={nextYear}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 4 }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Grid de meses */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {MONTHS_ES.map((monthName, i) => {
          const monthNumber = i + 1; // 1-12
          const sel = isSelected(monthNumber);
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleMonth(monthNumber)}
              style={{
                padding: '12px 8px', borderRadius: 8, fontSize: 13, fontWeight: sel ? 700 : 600,
                border: `2px solid ${sel ? 'var(--primary)' : colors.border}`,
                background: sel ? 'var(--primary)' : colors.bgSecondary,
                color: sel ? 'white' : colors.text,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
              {monthName.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {value && (
        <div style={{ marginTop: 16, padding: 12, background: colors.bgSecondary, borderRadius: 8, textAlign: 'center', fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
          ✓ {getMonthLabel(value)}
        </div>
      )}
    </div>
  );
}
