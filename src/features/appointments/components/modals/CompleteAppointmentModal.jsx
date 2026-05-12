import { useState, useEffect } from 'react';
import { X, Tag, Calculator, Check } from 'lucide-react';

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

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
  const [discount, setDiscount] = useState(0);
  const [suppliesCost, setSuppliesCost] = useState(0);
  const [finalPriceOverride, setFinalPriceOverride] = useState(null);
  const [reschedule, setReschedule] = useState(false);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [showPriceOverrideInput, setShowPriceOverrideInput] = useState(false);
  const [showSuppliesInput, setShowSuppliesInput] = useState(false);

  // Calcular totales
  const basePrice = parseFloat(appointment?.basePrice || appointment?.Service?.price || 0);
  const extraServices = appointment?.extraServices || [];
  const extrasTotal = extraServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
  const additionalAmount = parseFloat(appointment?.additionalAmount || 0);
  const subtotal = basePrice + extrasTotal + additionalAmount;
  
  const currentFinalPrice = finalPriceOverride !== null ? finalPriceOverride : (subtotal - discount);

  useEffect(() => {
    if (isOpen && appointment) {
      setDiscount(parseFloat(appointment.discountApplied || 0));
      setSuppliesCost(parseFloat(appointment.suppliesCost || appointment.Service?.suppliesCost || 0));
      setFinalPriceOverride(null);
      setShowDiscountInput(false);
      setShowPriceOverrideInput(false);
      setShowSuppliesInput(false);
    }
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) return null;

  const handleComplete = () => {
    onComplete({
      paymentMethod,
      discountApplied: discount,
      finalPrice: currentFinalPrice,
      suppliesCost: suppliesCost,
      reschedule // Pasar la intención de reagendar
    });
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
          margin: '0 0 20px 0', 
          fontSize: '14px', 
          color: colors.textSecondary 
        }}>
          Confirma el cobro para <strong>{appointment.clientName}</strong>.
        </p>

        {/* Desglose de Servicios */}
        <div style={{ 
          background: colors.bgSecondary, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 20,
          border: `1px solid ${colors.border}`
        }}>
          <div style={{ marginBottom: 12, borderBottom: `1px solid ${colors.border}`, paddingBottom: 8 }}>
            <div style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 600, marginBottom: 4 }}>SERVICIOS</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: colors.text }}>{appointment.Service?.name || 'Servicio Principal'}</span>
              <span style={{ fontWeight: 600, color: colors.text }}>{fmt(basePrice)}</span>
            </div>
            {extraServices.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 4 }}>
                <span style={{ color: colors.text }}>+ {s.name}</span>
                <span style={{ fontWeight: 600, color: colors.text }}>{fmt(s.price)}</span>
              </div>
            ))}
            {additionalAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 4 }}>
                <span style={{ color: colors.text }}>+ Cargo Adicional</span>
                <span style={{ fontWeight: 600, color: colors.text }}>{fmt(additionalAmount)}</span>
              </div>
            )}
          </div>

          {/* Insumos (Opcional) */}
          <div style={{ marginBottom: 12 }}>
            <div 
              onClick={() => {
                setShowSuppliesInput(!showSuppliesInput);
              }}
              style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                cursor: 'pointer', color: '#6366f1', fontSize: 13, fontWeight: 600 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calculator size={14} /> {showSuppliesInput ? 'Cerrar costo insumos' : '¿Descontar costo de insumos?'}
              </div>
              {suppliesCost > 0 && <span>{fmt(suppliesCost)}</span>}
            </div>
            
            {showSuppliesInput && (
              <div style={{ marginTop: 8 }}>
                <input
                  type="number"
                  placeholder="Costo de insumos..."
                  value={suppliesCost === 0 ? '' : suppliesCost}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSuppliesCost(val === '' ? 0 : parseFloat(val));
                  }}
                  onFocus={(e) => e.target.select()}
                  style={{ 
                    width: '100%', padding: '8px 10px', borderRadius: 6, 
                    border: `1px solid ${colors.border}`, background: colors.inputBg, 
                    color: colors.text, fontSize: 14 
                  }}
                />
                <div style={{ fontSize: 10, color: colors.textSecondary, marginTop: 4 }}>
                  Este valor se restará del total antes de calcular la comisión.
                </div>
              </div>
            )}
          </div>

          {/* Descuento Manual */}
          <div style={{ marginBottom: 12 }}>
            <div 
              onClick={() => {
                setShowDiscountInput(!showDiscountInput);
                if (!showDiscountInput) setShowPriceOverrideInput(false);
              }}
              style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                cursor: 'pointer', color: '#059669', fontSize: 13, fontWeight: 600 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Tag size={14} /> {showDiscountInput ? 'Cerrar descuento' : '¿Aplicar descuento manual?'}
              </div>
              {discount > 0 && <span>-{fmt(discount)}</span>}
            </div>
            
            {showDiscountInput && (
              <div style={{ marginTop: 8 }}>
                <input
                  type="number"
                  placeholder="Monto a descontar..."
                  value={discount === 0 ? '' : discount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setDiscount(0);
                    } else {
                      setDiscount(parseFloat(val));
                    }
                    setFinalPriceOverride(null);
                  }}
                  onFocus={(e) => e.target.select()}
                  style={{ 
                    width: '100%', padding: '8px 10px', borderRadius: 6, 
                    border: `1px solid ${colors.border}`, background: colors.inputBg, 
                    color: colors.text, fontSize: 14 
                  }}
                />
              </div>
            )}
          </div>

          {/* Total Final */}
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            paddingTop: 8, borderTop: `2px dashed ${colors.border}` 
          }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: colors.text }}>TOTAL A PAGAR</span>
            <div style={{ textAlign: 'right', flex: 1, paddingLeft: 16 }}>
              {showPriceOverrideInput ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <input
                    type="number"
                    autoFocus
                    value={currentFinalPrice === 0 ? '' : currentFinalPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setFinalPriceOverride(0);
                      } else {
                        setFinalPriceOverride(parseFloat(val));
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    style={{
                      width: '120px', padding: '6px 8px', borderRadius: 6, textAlign: 'right',
                      border: `1.5px solid ${colors.primary}`, background: colors.inputBg,
                      color: colors.primary, fontSize: 18, fontWeight: 800, outline: 'none'
                    }}
                  />
                  <div 
                    onClick={() => {
                      setShowPriceOverrideInput(false);
                      setFinalPriceOverride(null);
                    }}
                    style={{ fontSize: 10, color: colors.textSecondary, cursor: 'pointer' }}
                  >
                    Restaurar calculado
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontWeight: 800, fontSize: 22, color: colors.primary }}>{fmt(currentFinalPrice)}</div>
                  <div 
                    onClick={() => {
                      setShowPriceOverrideInput(true);
                      setShowDiscountInput(false);
                    }}
                    style={{ fontSize: 11, color: colors.textSecondary, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Ajustar manualmente
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

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

        {/* Opción de Reagendar */}
        <div 
          onClick={() => setReschedule(!reschedule)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            background: reschedule ? '#ecfdf5' : colors.bgSecondary,
            borderRadius: '10px',
            border: `1px solid ${reschedule ? '#10b981' : colors.border}`,
            marginBottom: 24,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: 4,
            border: `2px solid ${reschedule ? '#10b981' : colors.textTertiary}`,
            background: reschedule ? '#10b981' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            {reschedule && <Check size={14} strokeWidth={4} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: reschedule ? '#065f46' : colors.text }}>
              📅 Agendar próxima cita
            </div>
            <div style={{ fontSize: 11, color: colors.textSecondary }}>
              Abrir formulario con datos precargados (+15 días)
            </div>
          </div>
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
