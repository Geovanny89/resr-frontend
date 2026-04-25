import { X, Search, User, Calendar, Clock, CreditCard } from 'lucide-react';

export default function BusinessDetailModal({ business, onClose, onOpenSubscription }) {
  if (!business) return null;

  return (
    <div className="modal-overlay">
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: 480, padding: 0, overflow: 'hidden', borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div style={{ 
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
          padding: '24px 28px', 
          color: 'white', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{business.name}</h3>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: 13 }}>Información detallada del negocio</p>
          </div>
          <button 
            className="btn-icon" 
            onClick={onClose} 
            style={{ color: 'white', background: 'rgba(255,255,255,0.2)' }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div style={{ padding: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ 
                width: 40, height: 40, borderRadius: 10, background: 'var(--gray-100)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' 
              }}>
                <Search size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Identificador</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>/{business.slug}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ 
                width: 40, height: 40, borderRadius: 10, background: 'var(--success-bg)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success-text)' 
              }}>
                <User size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Propietario</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{business.Owner?.email}</p>
              </div>
            </div>

            <div style={{ 
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '20px', 
              background: 'var(--gray-100)', borderRadius: 12, border: '1px solid var(--border)' 
            }}>
              <div>
                <p style={{ 
                  margin: '0 0 6px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, 
                  textTransform: 'uppercase', letterSpacing: '0.5px' 
                }}>Suscripción desde</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={16} color="var(--primary)" />
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--primary)' }}>
                    {business.subscriptionStartDate 
                      ? new Date(business.subscriptionStartDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
                      : 'No definida'}
                  </span>
                </div>
              </div>
              <div>
                <p style={{ 
                  margin: '0 0 6px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, 
                  textTransform: 'uppercase', letterSpacing: '0.5px' 
                }}>Vence el día</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={16} color="var(--danger)" />
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--danger)' }}>
                    {business.subscriptionEndDate 
                      ? new Date(business.subscriptionEndDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
                      : 'No definida'}
                  </span>
                </div>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '14px', borderRadius: 10, fontWeight: 700, marginTop: 4, fontSize: 15 }}
              onClick={onOpenSubscription}
            >
              <CreditCard size={18} style={{ marginRight: 8 }} />
              Actualizar Suscripción
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
