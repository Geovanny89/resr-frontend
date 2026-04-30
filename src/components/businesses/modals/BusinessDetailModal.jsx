import { useState, useEffect } from 'react';
import { X, Search, User, Calendar, Clock, CreditCard, Edit2, Save, Trash2 } from 'lucide-react';
import api from '../../../api/client';

export default function BusinessDetailModal({ business, allBusinesses, businessTypes, onClose, onOpenSubscription, onUpdateBusiness }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: business?.name || '',
    type: business?.type || 'belleza',
    isTechnicalServices: business?.isTechnicalServices || false
  });
  const [saving, setSaving] = useState(false);

  // Sincronizar formulario cuando cambie el negocio seleccionado
  useEffect(() => {
    if (business) {
      setEditForm({
        name: business.name || '',
        type: business.type || 'belleza',
        isTechnicalServices: business.isTechnicalServices || false
      });
      setIsEditing(false); // Resetear modo edición al cambiar de negocio
    }
  }, [business]);

  if (!business) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/businesses/${business.id}`, editForm);
      if (onUpdateBusiness) onUpdateBusiness(business.id, editForm);
      setIsEditing(false);
    } catch (err) {
      alert('Error al actualizar el negocio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: 480, padding: 0, overflow: 'hidden', borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div style={{ 
          background: isEditing ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', 
          padding: '24px 28px', 
          color: 'white', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
              {isEditing ? 'Editar Negocio' : business.name}
            </h3>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: 13 }}>
              {isEditing ? 'Modificando perfil de empresa' : 'Información detallada del negocio'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                style={{ color: 'white', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Edit2 size={18} />
              </button>
            )}
            <button 
              className="btn-icon" 
              onClick={onClose} 
              style={{ color: 'white', background: 'rgba(255,255,255,0.2)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div style={{ padding: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {isEditing ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>Nombre del Negocio</label>
                  <input 
                    type="text" 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>Tipo de Negocio</label>
                  <select 
                    value={editForm.type} 
                    onChange={e => setEditForm({...editForm, type: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border)' }}
                  >
                    {businessTypes?.map(t => (
                      <option key={t.id || t.value} value={t.value}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                    {!businessTypes?.length && (
                      <option value="otro">📁 Otro</option>
                    )}
                  </select>
                </div>
                <div style={{ padding: '12px', background: '#fef3c7', borderRadius: 10, border: '1px solid #fcd34d' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={editForm.isTechnicalServices} 
                      onChange={e => setEditForm({...editForm, isTechnicalServices: e.target.checked})}
                      style={{ width: 18, height: 18 }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>Habilitar Módulo de Servicios Técnicos</span>
                  </label>
                  <p style={{ margin: '4px 0 0 28px', fontSize: 11, color: '#92400e', opacity: 0.8 }}>
                    Activa Órdenes de Servicio y Técnicos a domicilio.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancelar</button>
                  <button className="btn-primary" style={{ flex: 1, background: '#f59e0b', color: 'white', border: 'none' }} onClick={handleSave} disabled={saving}>
                    {saving ? 'Guardando...' : <><Save size={18} style={{marginRight: 8}} /> Guardar Cambios</>}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: 10, background: 'var(--gray-100)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' 
                  }}>
                    <Search size={20} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Identificador y Tipo</p>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                      /{business.slug} <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                        • {businessTypes?.find(t => t.value === business.type)?.icon} {businessTypes?.find(t => t.value === business.type)?.label || business.type}
                      </span>
                    </p>
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

                {/* Sedes Vinculadas */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                  <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    🏢 Sedes Vinculadas ({allBusinesses?.filter(b => b.ownerId === business.ownerId && b.id !== business.id).length || 0})
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {allBusinesses?.filter(b => b.ownerId === business.ownerId && b.id !== business.id).map(branch => (
                      <div key={branch.id} style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--border)' 
                      }}>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{branch.name}</span>
                        <span style={{ 
                          fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700,
                          background: branch.status === 'active' ? '#d1fae5' : '#fee2e2',
                          color: branch.status === 'active' ? '#065f46' : '#991b1b'
                        }}>
                          {branch.status === 'active' ? 'ACTIVA' : 'BLOQUEADA'}
                        </span>
                      </div>
                    ))}
                    {allBusinesses?.filter(b => b.ownerId === business.ownerId && b.id !== business.id).length === 0 && (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                        Este cliente no tiene otras sedes registradas.
                      </p>
                    )}
                  </div>
                </div>

                {/* Programa de Referidos */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                  <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    🤝 Programa de Referidos
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>CÓDIGO PROPIO</p>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{business.referralCode || 'N/A'}</p>
                    </div>
                    {business.referredByCode && (
                      <div>
                        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>TRAÍDO POR</p>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{business.referredByCode}</p>
                      </div>
                    )}
                  </div>

                  <div style={{ background: 'var(--gray-50)', padding: '12px', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <p style={{ margin: '0 0 8px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>INVITADOS EXITOSOS ({allBusinesses?.filter(b => b.referredByCode === business.referralCode).length || 0})</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {allBusinesses?.filter(b => b.referredByCode === business.referralCode).map(ref => (
                        <div key={ref.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>• {ref.name}</span>
                          <span style={{ 
                            fontSize: 9, padding: '1px 6px', borderRadius: 6, fontWeight: 700,
                            background: ref.subscriptionStatus === 'paid' || ref.subscriptionStatus === 'active' ? '#d1fae5' : '#fee2e2',
                            color: ref.subscriptionStatus === 'paid' || ref.subscriptionStatus === 'active' ? '#065f46' : '#991b1b'
                          }}>
                            {ref.subscriptionStatus === 'paid' || ref.subscriptionStatus === 'active' ? 'ACTIVO' : 'PENDIENTE'}
                          </span>
                        </div>
                      ))}
                      {allBusinesses?.filter(b => b.referredByCode === business.referralCode).length === 0 && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>No ha traído referidos aún.</p>
                      )}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
