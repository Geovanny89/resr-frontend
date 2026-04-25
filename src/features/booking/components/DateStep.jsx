import CalendarPicker from './CalendarPicker';
import { formatDateES, todayColombia } from '../utils/dateHelpers';

export default function DateStep({
  selected,
  setSelected,
  setStep,
  handleBack,
  colors,
  gradient,
  primary,
}) {
  const handleDateChange = (date) => {
    setSelected(s => ({ ...s, date, slot: null }));
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 4 }}>¿Qué día prefieres?</h2>
      <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>
        {selected.service?.name} · {selected.employee ? `Con ${selected.employee.User?.name}` : 'Cualquier empleado'}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <CalendarPicker
          value={selected.date}
          minDate={todayColombia()}
          onChange={handleDateChange}
          colors={colors}
        />
      </div>

      {selected.date && (
        <div style={{
          background: '#eef2ff',
          border: `1.5px solid ${primary}`,
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 16,
          fontSize: 14,
          color: '#3730a3',
        }}>
          <strong>✓ Fecha seleccionada:</strong> {formatDateES(selected.date)}
        </div>
      )}

      <div className="book-action-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={handleBack}
          style={{ background: colors.bgSecondary, color: colors.text, border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >
          ← Atrás
        </button>
        <button
          disabled={!selected.date}
          onClick={() => setStep(3)}
          style={{
            background: selected.date ? gradient : colors.bgSecondary,
            color: selected.date ? 'white' : colors.textSecondary,
            border: 'none', borderRadius: 8, padding: '10px 20px',
            cursor: selected.date ? 'pointer' : 'not-allowed',
            fontSize: 13, fontWeight: 700, flex: 1, maxWidth: 260,
          }}
        >
          Ver horarios disponibles →
        </button>
      </div>
    </div>
  );
}
