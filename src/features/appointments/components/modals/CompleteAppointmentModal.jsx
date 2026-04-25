/**
 * Modal para completar cita con selección de método de pago
 * Extraído de Appointments.jsx
 */
// No external imports needed - using inline SVG if needed

/**
 * Modal de completar cita
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Object} props.appointment - Datos de la cita a completar
 * @param {string} props.paymentMethod - Método de pago seleccionado ('cash' | 'transfer')
 * @param {Function} props.onPaymentMethodChange - Callback al cambiar método
 * @param {Function} props.onComplete - Callback al completar (recibe paymentMethod)
 * @param {Function} props.onCancel - Callback al cancelar
 * @param {boolean} props.isCompleting - Estado de carga
 * @param {Object} props.colors - Colores del tema
 */
export function CompleteAppointmentModal({
  isOpen,
  appointment,
  paymentMethod,
  onPaymentMethodChange,
  onComplete,
  onCancel,
  isCompleting,
  colors
}) {
  if (!isOpen || !appointment) return null;

  const handleComplete = () => {
    onComplete(paymentMethod);
  };

  return (
    <div style={{
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', 
      display: 'flex',
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 1000
    }}>
      <div style={{
        background: colors.cardBg, 
        borderRadius: '16px', 
        padding: '28px',
        maxWidth: '420px', 
        width: '90%', 
        border: `1px solid ${colors.border}`,
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
      }}>
        <h2 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '20px', 
          fontWeight: 800, 
          color: colors.text 
        }}>
          ✅ Completar Cita
        </h2>
        <p style={{ 
          margin: '0 0 24px 0', 
          fontSize: '14px', 
          color: colors.textSecondary 
        }}>
          Selecciona el método de pago utilizado por <strong>{appointment.clientName}</strong>.
        </p>

        {/* Opciones de pago */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 12, 
          marginBottom: 28 
        }}>
          {/* Efectivo */}
          <label 
            onClick={() => onPaymentMethodChange('cash')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 14, 
              padding: '16px', 
              borderRadius: '12px', 
              border: `2px solid ${paymentMethod === 'cash' ? colors.primary : colors.border}`,
              background: paymentMethod === 'cash' ? `${colors.primary}08` : 'transparent',
              cursor: 'pointer', 
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ 
              width: 20, 
              height: 20, 
              borderRadius: '50%', 
              border: `2px solid ${paymentMethod === 'cash' ? colors.primary : colors.textTertiary}`,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              {paymentMethod === 'cash' && (
                <div style={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  background: colors.primary 
                }} />
              )}
            </div>
            <div>
              <div style={{ 
                fontWeight: 700, 
                fontSize: 15, 
                color: colors.text 
              }}>
                💵 Efectivo
              </div>
              <div style={{ 
                fontSize: 12, 
                color: colors.textSecondary 
              }}>
                Pago recibido en físico
              </div>
            </div>
          </label>

          {/* Transferencia */}
          <label 
            onClick={() => onPaymentMethodChange('transfer')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 14, 
              padding: '16px', 
              borderRadius: '12px', 
              border: `2px solid ${paymentMethod === 'transfer' ? colors.primary : colors.border}`,
              background: paymentMethod === 'transfer' ? `${colors.primary}08` : 'transparent',
              cursor: 'pointer', 
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ 
              width: 20, 
              height: 20, 
              borderRadius: '50%', 
              border: `2px solid ${paymentMethod === 'transfer' ? colors.primary : colors.textTertiary}`,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              {paymentMethod === 'transfer' && (
                <div style={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  background: colors.primary 
                }} />
              )}
            </div>
            <div>
              <div style={{ 
                fontWeight: 700, 
                fontSize: 15, 
                color: colors.text 
              }}>
                📲 Transferencia
              </div>
              <div style={{ 
                fontSize: 12, 
                color: colors.textSecondary 
              }}>
                Nequi, Daviplata o Banco
              </div>
            </div>
          </label>
        </div>

        {/* Botones */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'stretch' 
        }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, 
              background: 'transparent', 
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`, 
              borderRadius: '10px',
              padding: '12px', 
              fontSize: '14px', 
              fontWeight: 600, 
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            style={{
              flex: 2, 
              background: colors.primary, 
              color: 'white',
              border: 'none', 
              borderRadius: '10px', 
              padding: '12px',
              fontSize: '14px', 
              fontWeight: 700, 
              cursor: isCompleting ? 'not-allowed' : 'pointer',
              opacity: isCompleting ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: `0 4px 12px ${colors.primary}40`
            }}
          >
            {isCompleting ? (
              <>
                Procesando...
              </>
            ) : (
              <>Confirmar Pago</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompleteAppointmentModal;
