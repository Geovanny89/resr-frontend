export default function DepositStep({
  selected,
  setSelected,
  setStep,
  depositAmount,
  depositConfig,
  submitting,
  handleSubmit,
  colors,
  gradient,
}) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 4 }}>💰 Anticipo requerido</h2>
      <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>
        Para garantizar tu cita, se requiere un anticipo
      </p>

      {/* Monto del anticipo */}
      <div style={{
        background: `linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)`,
        borderRadius: 14,
        padding: '20px',
        marginBottom: 20,
        border: '2px solid #f59e0b',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 14, color: '#92400e', marginBottom: 8 }}>Monto del anticipo</div>
        <div style={{ fontSize: 36, fontWeight: 800, color: '#92400e' }}>
          ${depositAmount.toLocaleString('es-CO')}
        </div>
        <div style={{ fontSize: 12, color: '#a16207', marginTop: 4 }}>
          {depositConfig?.amount > 0 ? 'Monto fijo' : `${depositConfig?.percentage || 30}% del servicio`}
        </div>
      </div>

      {/* Términos y condiciones */}
      <div style={{
        background: colors.cardBg,
        borderRadius: 12,
        padding: '16px',
        marginBottom: 20,
        border: `1px solid ${colors.border}`,
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: colors.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          📋 Términos y condiciones
        </div>
        <div style={{
          fontSize: 13,
          color: colors.textSecondary,
          lineHeight: 1.6,
          padding: '12px',
          background: colors.bg,
          borderRadius: 8
        }}>
          {depositConfig?.termsText || 'El anticipo garantiza tu cita. Si cancelas con menos de 24 horas de anticipo o no asistes, el anticipo será retenido como penalidad.'}
        </div>

        {/* Checkbox de aceptación */}
        <label style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          marginTop: 16,
          cursor: 'pointer',
          padding: '12px',
          borderRadius: 8,
          border: `2px solid ${selected.depositAccepted ? '#10b981' : colors.border}`,
          background: selected.depositAccepted ? '#ecfdf5' : 'transparent',
          transition: 'all 0.2s'
        }}>
          <input
            type="checkbox"
            checked={selected.depositAccepted}
            onChange={(e) => setSelected(s => ({ ...s, depositAccepted: e.target.checked }))}
            style={{
              width: 20,
              height: 20,
              marginTop: 2,
              accentColor: '#10b981',
              cursor: 'pointer'
            }}
          />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: selected.depositAccepted ? '#065f46' : colors.text }}>
              Acepto los términos del anticipo
            </div>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
              Entiendo que debo pagar ${depositAmount.toLocaleString('es-CO')} antes de la cita y acepto las condiciones de cancelación.
            </div>
          </div>
        </label>
      </div>

      {/* Instrucciones de pago */}
      <div style={{
        background: '#dbeafe',
        borderRadius: 12,
        padding: '16px',
        marginBottom: 20,
        border: '1px solid #3b82f6',
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1e40af', marginBottom: 8 }}>
          💳 ¿Cómo pagar el anticipo?
        </div>
        <div style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
          El pago se realiza directamente en el establecimiento o mediante transferencia.
          Una vez realizado el pago, tu cita quedará confirmada.
        </div>
      </div>

      <div className="book-action-row" style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setStep(4)}
          style={{ background: colors.bgSecondary, color: colors.text, border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >
          ← Atrás
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !selected.depositAccepted}
          style={{
            background: !selected.depositAccepted ? colors.bgSecondary : gradient,
            color: !selected.depositAccepted ? colors.textSecondary : 'white',
            border: 'none', borderRadius: 8, padding: '11px 24px',
            cursor: (!selected.depositAccepted || submitting) ? 'not-allowed' : 'pointer',
            fontSize: 14, fontWeight: 700, flex: 1, maxWidth: 300,
          }}
        >
          {submitting ? '⏳ Reservando...' : '✅ Confirmar cita con anticipo'}
        </button>
      </div>
    </div>
  );
}
