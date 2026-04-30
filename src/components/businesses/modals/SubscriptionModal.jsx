import { X } from 'lucide-react';

const PLANS = {
  basic: { name: 'Básico', price: 70000, includedUsers: 3 },
  pro: { name: 'Pro', price: 90000, includedUsers: 5 },
  premium: { name: 'Premium', price: 130000, includedUsers: 10 }
};

export default function SubscriptionModal({ 
  business, 
  form, 
  onClose, 
  onUpdate, 
  onChange, 
  saving,
  calculateTotal
}) {
  if (!business) return null;

  const handleInputChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: 480, width: '98%', maxHeight: '90vh', padding: 0, overflow: 'hidden', 
          borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', 
          display: 'flex', flexDirection: 'column' 
        }}
      >
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea, #764ba2)', 
          padding: '24px 28px', 
          color: 'white', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexShrink: 0 
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Actualizar Suscripción</h2>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: 13 }}>{business.name}</p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              color: 'white', background: 'rgba(255,255,255,0.2)', border: 'none', 
              borderRadius: 8, width: 36, height: 36, display: 'flex', 
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
            }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div 
          style={{ 
            padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, 
            overflow: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' 
          }} 
          className="hide-scrollbar"
        >
          <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
          
          {/* Sección: Plan de Suscripción */}
          <div style={{ background: 'var(--gray-100)', padding: '16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              📦 Plan de Suscripción
            </h4>
            
            <div style={{ marginBottom: 12 }}>
              <label style={{ 
                display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', 
                marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' 
              }}>Plan</label>
              <select 
                value={form.subscriptionPlan} 
                onChange={e => handleInputChange('subscriptionPlan', e.target.value)} 
                style={{ 
                  width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', 
                  fontSize: 14, background: 'var(--surface)', color: 'var(--text)' 
                }}
              >
                <option value="basic">💚 Básico - $70.000 (3 profesionales)</option>
                <option value="pro">💙 Pro - $90.000 (5 profesionales)</option>
                <option value="premium">💛 Premium - $130.000 (10 profesionales)</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', 
                  marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' 
                }}>Profesionales extras</label>
                <input 
                  type="number" 
                  min="0"
                  value={form.additionalUsers} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') {
                      handleInputChange('additionalUsers', '');
                    } else {
                      const num = parseInt(val);
                      if (!isNaN(num) && num >= 0) {
                        handleInputChange('additionalUsers', num);
                      }
                    }
                  }}
                  onBlur={e => {
                    if (e.target.value === '') {
                      handleInputChange('additionalUsers', 0);
                    }
                  }}
                  style={{ 
                    width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', 
                    fontSize: 14, background: 'var(--surface)', color: 'var(--text)' 
                  }} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', 
                  marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' 
                }}>
                  💰 Precio personalizado (opcional)
                </label>
                <input 
                  type="number" 
                  min="0"
                  placeholder={`${PLANS[form.subscriptionPlan]?.price.toLocaleString()}`}
                  value={form.customMonthlyPrice} 
                  onChange={e => handleInputChange('customMonthlyPrice', e.target.value)}
                  onBlur={e => {
                    if (e.target.value === '') {
                      handleInputChange('customMonthlyPrice', '');
                    }
                  }}
                  style={{ 
                    width: '100%', padding: '10px', borderRadius: 8, 
                    border: form.customMonthlyPrice ? '2px solid #f59e0b' : '1px solid var(--border)', 
                    fontSize: 14, 
                    background: form.customMonthlyPrice ? '#fef3c7' : 'var(--surface)', 
                    color: 'var(--text)' 
                  }} 
                />
                <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 4 }}>
                  Deja vacío para usar el precio del plan
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', 
                  marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' 
                }}>Total mensual a cobrar</label>
                <div style={{ 
                  padding: '10px', borderRadius: 8, 
                  background: form.customMonthlyPrice ? '#fef3c7' : 'var(--success-bg)', 
                  color: form.customMonthlyPrice ? '#92400e' : 'var(--success-text)', 
                  fontWeight: 700, fontSize: 16, textAlign: 'center',
                  border: form.customMonthlyPrice ? '2px solid #f59e0b' : 'none'
                }}>
                  ${calculateTotal().toLocaleString()}
                  {form.customMonthlyPrice && <span style={{fontSize: 11, display: 'block', marginTop: 2}}>🎯 Precio personalizado</span>}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              {PLANS[form.subscriptionPlan]?.includedUsers} incluidos + {form.additionalUsers === '' ? 0 : (form.additionalUsers || 0)} extras = {PLANS[form.subscriptionPlan]?.includedUsers + (form.additionalUsers === '' ? 0 : (parseInt(form.additionalUsers) || 0))} profesionales totales (admin no cuenta)
            </div>
          </div>
          
          {/* Sección: Estado de Suscripción */}
          <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              📊 Estado y Registro de Pago
            </h4>
            
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>
                Estado de suscripción
              </label>
              <select 
                value={form.subscriptionStatus} 
                onChange={e => handleInputChange('subscriptionStatus', e.target.value)} 
                style={{ 
                  width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', 
                  fontSize: 14, background: 'var(--surface)', color: 'var(--text)',
                  fontWeight: 600, borderLeft: '4px solid ' + (form.subscriptionStatus === 'paid' ? '#10b981' : '#ef4444')
                }}
              >
                <option value="pending">⏳ Pendiente de Pago</option>
                <option value="paid">✅ Pago Recibido (Al día)</option>
                <option value="overdue">❌ Suscripción Vencida</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#059669', marginBottom: 4 }}>Monto Recibido ($)</label>
                <input 
                  type="number" 
                  value={form.paymentAmount || ''} 
                  onChange={e => handleInputChange('paymentAmount', e.target.value)}
                  placeholder={calculateTotal().toString()}
                  style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #bcf0da', fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#059669', marginBottom: 4 }}>Fecha de Pago</label>
                <input 
                  type="date" 
                  value={form.lastPaymentDate || new Date().toISOString().split('T')[0]} 
                  onChange={e => handleInputChange('lastPaymentDate', e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #bcf0da', fontSize: 14 }}
                />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#059669', marginBottom: 4 }}>Referencia / Comprobante</label>
              <input 
                type="text" 
                value={form.paymentReference || ''} 
                onChange={e => handleInputChange('paymentReference', e.target.value)}
                placeholder="Ej: Transferencia Bancaria #123"
                style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #bcf0da', fontSize: 14 }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ 
                display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', 
                marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' 
              }}>Inicio</label>
              <input 
                type="date" 
                value={form.subscriptionStartDate} 
                onChange={e => handleInputChange('subscriptionStartDate', e.target.value)} 
                style={{ 
                  width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', 
                  fontSize: 14, background: 'var(--surface)', color: 'var(--text)' 
                }} 
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', 
                marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' 
              }}>Vencimiento</label>
              <input 
                type="date" 
                value={form.subscriptionEndDate} 
                onChange={e => handleInputChange('subscriptionEndDate', e.target.value)} 
                style={{ 
                  width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', 
                  fontSize: 14, background: 'var(--surface)', color: 'var(--text)' 
                }} 
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button 
              className="btn-secondary" 
              style={{ flex: 1, padding: '10px', borderRadius: 8, fontWeight: 600, fontSize: 14 }} 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              className="btn-primary" 
              style={{ flex: 2, padding: '10px', borderRadius: 8, fontWeight: 700, fontSize: 14 }} 
              onClick={onUpdate} 
              disabled={saving}
            >
              {saving ? 'Guardando...' : '💾 Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
