export const AdditionalModal = ({ show, colors, additionalForm, setAdditionalForm, savingAdditional, onClose, onSubmit }) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 3000
    }}>
      <div style={{
        background: colors.cardBg, borderRadius: '16px', padding: '28px',
        maxWidth: '400px', width: '90%', border: `1px solid ${colors.border}`
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: colors.text }}>
          💰 Cargo Adicional
        </h2>
        <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
          Agrega un cargo extra por servicios adicionales realizados.
        </p>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: colors.text }}>
            Valor adicional
          </label>
          <input
            type="number"
            min="0"
            step="100"
            value={additionalForm.additionalAmount}
            onChange={(e) => setAdditionalForm({...additionalForm, additionalAmount: e.target.value})}
            placeholder="Ej: 5000"
            style={{
              width: '100%', padding: '12px', border: `1px solid ${colors.border}`,
              borderRadius: '10px', fontSize: '16px', background: colors.inputBg,
              color: colors.text, marginBottom: '20px'
            }}
          />
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: colors.text }}>
            ¿Qué se hizo?
          </label>
          <textarea
            value={additionalForm.additionalNote}
            onChange={(e) => setAdditionalForm({...additionalForm, additionalNote: e.target.value})}
            placeholder="Describe el trabajo extra realizado..."
            rows={3}
            style={{
              width: '100%', padding: '12px', border: `1px solid ${colors.border}`,
              borderRadius: '10px', fontSize: '16px', background: colors.inputBg,
              color: colors.text, resize: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, background: 'transparent', color: colors.textSecondary,
              border: `1px solid ${colors.border}`, borderRadius: '10px',
              padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={savingAdditional}
            style={{
              flex: 2, background: colors.primary, color: 'white',
              border: 'none', borderRadius: '10px', padding: '12px',
              fontSize: '14px', fontWeight: 700, cursor: savingAdditional ? 'not-allowed' : 'pointer'
            }}
          >
            {savingAdditional ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};
