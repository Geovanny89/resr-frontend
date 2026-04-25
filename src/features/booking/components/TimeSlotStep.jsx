import { formatDateES, formatSlotTime } from '../utils/dateHelpers';

export default function TimeSlotStep({
  selected,
  setSelected,
  setStep,
  slots,
  slotsLoading,
  hasPreviousData,
  loadingClientData,
  submitting,
  handleSubmit,
  colors,
  gradient,
  primary,
}) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 4 }}>Elige tu horario</h2>
      <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
        {selected.service?.name} · {formatDateES(selected.date)}
      </p>

      {slotsLoading ? (
        <div style={{ background: colors.cardBg, borderRadius: 14, padding: 48, textAlign: 'center', boxShadow: `0 2px 8px ${colors.shadow}`, border: `1px solid ${colors.border}` }}>
          <div style={{ width: 40, height: 40, border: `4px solid ${colors.border}`, borderTopColor: primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: colors.textSecondary, fontSize: 14 }}>Buscando horarios disponibles...</p>
        </div>
      ) : slots.length === 0 ? (
        <div style={{ background: colors.cardBg, borderRadius: 14, padding: 48, textAlign: 'center', color: colors.textSecondary, boxShadow: `0 2px 8px ${colors.shadow}`, border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
          <p style={{ fontWeight: 700, color: colors.text, marginBottom: 6 }}>No hay horarios disponibles</p>
          <p style={{ fontSize: 13 }}>Intenta con otro día o selecciona un empleado diferente.</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 14 }}>
            {slots.length} horario{slots.length !== 1 ? 's' : ''} disponible{slots.length !== 1 ? 's' : ''} · Hora Colombia (UTC-5)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
            {slots.map((slot, i) => {
              const isSel = selected.slot === slot;
              return (
                <div
                  key={i}
                  className="book-slot"
                  onClick={() => setSelected(s => ({ ...s, slot }))}
                  style={{
                    background: isSel ? primary : colors.cardBg,
                    borderRadius: 12, padding: '14px 12px',
                    border: `2px solid ${isSel ? primary : colors.border}`,
                    cursor: 'pointer',
                    boxShadow: isSel ? `0 4px 16px ${primary}40` : `0 1px 4px ${colors.shadow}`,
                    transition: 'all 0.15s', textAlign: 'center',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 18, color: isSel ? 'white' : colors.text }}>
                    {formatSlotTime(slot.startTime)}
                  </div>
                  <div style={{ fontSize: 11, color: isSel ? 'rgba(255,255,255,0.8)' : colors.textSecondary, marginTop: 4 }}>
                    {slot.employeeName}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {hasPreviousData && !submitting && !loadingClientData && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: colors.bgSecondary, borderRadius: 10, fontSize: 12, color: colors.textSecondary, border: `1px solid ${colors.border}` }}>
          ✨ Se usará tu información guardada: <strong>{selected.clientName}</strong>.
          <span onClick={() => setStep(4)} style={{ color: primary, cursor: 'pointer', marginLeft: 6, fontWeight: 600, textDecoration: 'underline' }}>
            Cambiar datos
          </span>
        </div>
      )}

      {loadingClientData && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: '#e0f2fe', borderRadius: 10, fontSize: 12, color: '#0369a1', border: '1px solid #7dd3fc', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 14, height: 14, border: '2px solid #7dd3fc', borderTopColor: '#0369a1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Cargando tus datos...
        </div>
      )}

      <div className="book-action-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => setStep(2)}
          style={{ background: colors.bgSecondary, color: colors.text, border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >
          ← Cambiar fecha
        </button>
        {selected.slot && (
          <button
            onClick={hasPreviousData ? handleSubmit : () => setStep(4)}
            disabled={submitting}
            style={{
              background: gradient, color: 'white', border: 'none',
              borderRadius: 8, padding: '10px 20px', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, flex: 1, maxWidth: 260,
            }}
          >
            {submitting ? '⏳ Reservando...' : (hasPreviousData ? '✅ Confirmar Cita →' : 'Continuar →')}
          </button>
        )}
      </div>
    </div>
  );
}
