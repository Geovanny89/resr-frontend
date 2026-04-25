export const CompleteModal = ({ show, colors, completeAppointmentData, paymentMethod, setPaymentMethod, completing, onClose, onSubmit }) => {
  if (!show || !completeAppointmentData) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 3000
    }}>
      <div style={{
        background: colors.cardBg, borderRadius: '16px', padding: '28px',
        maxWidth: '420px', width: '90%', border: `1px solid ${colors.border}`,
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800, color: colors.text }}>
          ✅ Completar Cita
        </h2>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: colors.textSecondary }}>
          Selecciona el método de pago utilizado por <strong>{completeAppointmentData.clientName}</strong>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          <label 
            onClick={() => setPaymentMethod('cash')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px', 
              borderRadius: '12px', border: `2px solid ${paymentMethod === 'cash' ? colors.primary : colors.border}`,
              background: paymentMethod === 'cash' ? `${colors.primary}08` : 'transparent',
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <div style={{ 
              width: 20, height: 20, borderRadius: '50%', border: `2px solid ${paymentMethod === 'cash' ? colors.primary : colors.textSecondary}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {paymentMethod === 'cash' && <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors.primary }} />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>💵 Efectivo</div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>Pago recibido en físico</div>
            </div>
          </label>

          <label 
            onClick={() => setPaymentMethod('transfer')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px', 
              borderRadius: '12px', border: `2px solid ${paymentMethod === 'transfer' ? colors.primary : colors.border}`,
              background: paymentMethod === 'transfer' ? `${colors.primary}08` : 'transparent',
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <div style={{ 
              width: 20, height: 20, borderRadius: '50%', border: `2px solid ${paymentMethod === 'transfer' ? colors.primary : colors.textSecondary}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {paymentMethod === 'transfer' && <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors.primary }} />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>📲 Transferencia</div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>Nequi, Daviplata o Banco</div>
            </div>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'stretch' }}>
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
            disabled={completing}
            style={{
              flex: 2, background: colors.primary, color: 'white',
              border: 'none', borderRadius: '10px', padding: '12px',
              fontSize: '14px', fontWeight: 700, cursor: completing ? 'not-allowed' : 'pointer',
              boxShadow: `0 4px 12px ${colors.primary}40`
            }}
          >
            {completing ? 'Completando...' : 'Completar'}
          </button>
        </div>
      </div>
    </div>
  );
};
