import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const CompleteModal = ({ show, colors, completeAppointmentData, setCompleteAppointmentData, services = [], paymentMethod, setPaymentMethod, completing, onClose, onSubmit }) => {
  const [discount, setDiscount] = useState(0);
  const [finalPriceOverride, setFinalPriceOverride] = useState(null);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [showFinalPriceInput, setShowFinalPriceInput] = useState(false);
  const [extraServiceSearch, setExtraServiceSearch] = useState('');
  const [showExtraServiceList, setShowExtraServiceList] = useState(false);

  const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

  // Calcular totales
  const basePrice = parseFloat(completeAppointmentData?.basePrice || completeAppointmentData?.Service?.price || 0);
  const extraServices = completeAppointmentData?.extraServices || [];
  const extrasTotal = extraServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
  const subtotal = basePrice + extrasTotal;
  const currentFinalPrice = finalPriceOverride !== null ? finalPriceOverride : (subtotal - discount);

  useEffect(() => {
    if (show && completeAppointmentData) {
      setDiscount(parseFloat(completeAppointmentData.discountApplied || 0));
      setFinalPriceOverride(null);
      setShowDiscountInput(false);
      setShowFinalPriceInput(false);
      setExtraServiceSearch('');
      setShowExtraServiceList(false);
    }
  }, [show, completeAppointmentData?.id]); // Solo ejecutar al cambiar el ID para no resetear al agregar extras

  if (!show || !completeAppointmentData) return null;

  const handleConfirm = () => {
    onSubmit({
      paymentMethod,
      discountApplied: discount,
      finalPrice: currentFinalPrice,
      extraServices: completeAppointmentData.extraServices // <-- Enviar extraServices modificados
    });
  };

  const filteredExtraServices = services.filter(s => 
    s.id !== completeAppointmentData.serviceId && 
    !(completeAppointmentData.extraServices || []).find(es => es.serviceId === s.id) &&
    s.name.toLowerCase().includes(extraServiceSearch.toLowerCase())
  );

  const handleAddExtraService = (service) => {
    const currentExtras = completeAppointmentData.extraServices || [];
    if (currentExtras.find(s => s.serviceId === service.id)) return;
    
    const newExtras = [...currentExtras, {
      serviceId: service.id,
      name: service.name,
      price: service.price,
      durationMin: service.durationMin
    }];
    
    setCompleteAppointmentData({ ...completeAppointmentData, extraServices: newExtras });
    setFinalPriceOverride(null);
    setExtraServiceSearch('');
    setShowExtraServiceList(false);
  };

  const handleRemoveExtraService = (svcId) => {
    const currentExtras = completeAppointmentData.extraServices || [];
    setCompleteAppointmentData({ 
      ...completeAppointmentData, 
      extraServices: currentExtras.filter(s => s.serviceId !== svcId) 
    });
    setFinalPriceOverride(null);
  };

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
        <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: colors.textSecondary }}>
          Confirma el cobro para <strong>{completeAppointmentData.clientName}</strong>.
        </p>

        {/* Desglose */}
        <div style={{ background: colors.bgSecondary, borderRadius: 12, padding: 16, marginBottom: 20, border: `1px solid ${colors.border}` }}>
          <div style={{ marginBottom: 12, borderBottom: `1px solid ${colors.border}`, paddingBottom: 8 }}>
            <div style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 600, marginBottom: 4 }}>SERVICIOS</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: colors.text }}>{completeAppointmentData.Service?.name}</span>
              <span style={{ fontWeight: 600, color: colors.text }}>{fmt(basePrice)}</span>
            </div>
            {extraServices.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 4, alignItems: 'center' }}>
                <span style={{ color: colors.text }}>
                  + {s.name}
                  <X size={12} color="#ef4444" style={{ cursor: 'pointer', marginLeft: 6, verticalAlign: 'middle' }} onClick={() => handleRemoveExtraService(s.serviceId || s.id)} />
                </span>
                <span style={{ fontWeight: 600, color: colors.text }}>{fmt(s.price)}</span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="➕ Agregar servicio adicional..."
                value={extraServiceSearch}
                onFocus={() => setShowExtraServiceList(true)}
                onChange={(e) => setExtraServiceSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: `1px dashed ${colors.border}`, borderRadius: 8, fontSize: 13, background: colors.inputBg, color: colors.text }}
              />
              {showExtraServiceList && extraServiceSearch && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, 
                  background: colors.cardBg, border: `1px solid ${colors.border}`,
                  borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  zIndex: 101, maxHeight: 120, overflowY: 'auto', marginTop: 4
                }}>
                  {filteredExtraServices.length === 0 ? (
                    <div style={{ padding: '8px 12px', fontSize: 13, color: colors.textSecondary }}>No encontrado</div>
                  ) : (
                    filteredExtraServices.map(s => (
                      <div
                        key={s.id}
                        onClick={() => handleAddExtraService(s)}
                        style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between' }}
                        onMouseEnter={(e) => e.target.style.background = colors.bgSecondary}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: 13, color: colors.text }}>{s.name}</span>
                        <span style={{ fontSize: 13, color: colors.text, fontWeight: 600 }}>{fmt(s.price)}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div 
              onClick={() => setShowDiscountInput(!showDiscountInput)}
              style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', color: '#059669', fontSize: 13, fontWeight: 600 }}
            >
              <span>{showDiscountInput ? '✕ Cerrar' : '🏷️ Aplicar descuento?'}</span>
              {discount > 0 && <span>-{fmt(discount)}</span>}
            </div>
            {showDiscountInput && (
              <input
                type="number"
                autoFocus
                placeholder="Monto..."
                value={discount}
                onChange={(e) => { setDiscount(parseFloat(e.target.value) || 0); setFinalPriceOverride(null); }}
                style={{ width: '100%', marginTop: 8, padding: '8px', borderRadius: 6, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
              />
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: `2px dashed ${colors.border}` }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>TOTAL</span>
            <div style={{ textAlign: 'right' }}>
              {showFinalPriceInput ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <input
                    type="number"
                    autoFocus
                    value={finalPriceOverride !== null ? finalPriceOverride : currentFinalPrice}
                    onChange={(e) => setFinalPriceOverride(parseFloat(e.target.value) || 0)}
                    style={{ width: '120px', padding: '6px', borderRadius: 6, border: `1px solid ${colors.primary}`, background: colors.inputBg, color: colors.text, fontSize: 16, fontWeight: 'bold', textAlign: 'right' }}
                  />
                  <div 
                    onClick={() => setShowFinalPriceInput(false)}
                    style={{ fontSize: 11, color: colors.textSecondary, cursor: 'pointer' }}
                  >
                    ✓ Listo
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontWeight: 800, fontSize: 20, color: colors.primary }}>{fmt(currentFinalPrice)}</div>
                  <div 
                    onClick={() => setShowFinalPriceInput(true)}
                    style={{ fontSize: 11, color: colors.textSecondary, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Ajustar manualmente
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          <label 
            onClick={() => setPaymentMethod('cash')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px', 
              borderRadius: '12px', border: `2px solid ${paymentMethod === 'cash' ? colors.primary : colors.border}`,
              background: paymentMethod === 'cash' ? `${colors.primary}08` : 'transparent',
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <div style={{ 
              width: 18, height: 18, borderRadius: '50%', border: `2px solid ${paymentMethod === 'cash' ? colors.primary : colors.textTertiary}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {paymentMethod === 'cash' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.primary }} />}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>💵 Efectivo</div>
          </label>

          <label 
            onClick={() => setPaymentMethod('transfer')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px', 
              borderRadius: '12px', border: `2px solid ${paymentMethod === 'transfer' ? colors.primary : colors.border}`,
              background: paymentMethod === 'transfer' ? `${colors.primary}08` : 'transparent',
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <div style={{ 
              width: 18, height: 18, borderRadius: '50%', border: `2px solid ${paymentMethod === 'transfer' ? colors.primary : colors.textTertiary}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {paymentMethod === 'transfer' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.primary }} />}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>📲 Transferencia</div>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ flex: 1, background: 'transparent', color: colors.textSecondary, border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={completing}
            style={{ flex: 2, background: colors.primary, color: 'white', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: completing ? 'not-allowed' : 'pointer', opacity: completing ? 0.7 : 1, boxShadow: `0 4px 12px ${colors.primary}40` }}
          >
            {completing ? '...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};
