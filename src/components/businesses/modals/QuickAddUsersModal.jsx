import { X } from 'lucide-react';

const PLANS = {
  basic: { name: 'Básico', price: 70000, includedUsers: 3 },
  pro: { name: 'Pro', price: 90000, includedUsers: 5 },
  premium: { name: 'Premium', price: 130000, includedUsers: 10 }
};

const ADDITIONAL_USER_PRICE = 20000;

export default function QuickAddUsersModal({ 
  business, 
  count, 
  onClose, 
  onConfirm, 
  onChangeCount,
  adding 
}) {
  if (!business) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: 420, width: '98%', padding: 0, overflow: 'hidden', 
          borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)' 
        }}
      >
        <div style={{ 
          background: 'linear-gradient(135deg, #3730a3, #6366f1)', 
          padding: '24px 28px', color: 'white', display: 'flex', 
          justifyContent: 'space-between', alignItems: 'center' 
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>➕ Agregar Profesionales</h2>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: 13 }}>{business.name} (el admin no cuenta)</p>
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
        
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--gray-100)', padding: '16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Plan actual:</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{PLANS[business.subscriptionPlan]?.name || 'Básico'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Profesionales incluidos:</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{PLANS[business.subscriptionPlan]?.includedUsers || 2}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Profesionales extras:</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{business.additionalUsers || 0}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total profesionales permitidos:</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                {(PLANS[business.subscriptionPlan]?.includedUsers || 2) + (business.additionalUsers || 0)}
              </span>
            </div>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', 
              marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' 
            }}>
              Profesionales a agregar
            </label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input 
                type="number" 
                min="1"
                value={count}
                onChange={e => onChangeCount(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ 
                  flex: 1, padding: '12px', borderRadius: 8, border: '1px solid var(--border)', 
                  fontSize: 16, background: 'var(--surface)', color: 'var(--text)', 
                  textAlign: 'center', fontWeight: 600 
                }}
              />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Costo adicional</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success-text)' }}>
                  ${(count * ADDITIONAL_USER_PRICE).toLocaleString()}/mes
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              Cada usuario adicional cuesta ${ADDITIONAL_USER_PRICE.toLocaleString()} COP/mes
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button 
              className="btn-secondary" 
              style={{ flex: 1, padding: '12px', borderRadius: 8, fontWeight: 600, fontSize: 14 }} 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              className="btn-primary" 
              style={{ 
                flex: 2, padding: '12px', borderRadius: 8, fontWeight: 700, 
                fontSize: 14, background: 'linear-gradient(135deg, #3730a3, #6366f1)' 
              }}
              onClick={onConfirm}
              disabled={adding}
            >
              {adding ? 'Agregando...' : `➕ Agregar ${count} profesional${count > 1 ? 'es' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
