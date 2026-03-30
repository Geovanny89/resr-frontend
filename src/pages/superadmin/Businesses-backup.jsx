import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import api from '../../api/client';
import {
  Building2, Search, Eye, Lock, Unlock, CheckCircle, XCircle,
  Clock, AlertTriangle, Image, X, RefreshCw, Filter,
  User, Calendar, CreditCard
} from 'lucide-react';
import '../../styles/responsive.css';

const SUB_LABELS = {
  pending: { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7', text: '#92400e' },
  paid:    { label: 'Pagado',    color: '#10b981', bg: '#d1fae5', text: '#065f46' },
  overdue: { label: 'Vencido',    color: '#ef4444', bg: '#fee2e2', text: '#991b1b' },
};

export default function BusinessesResponsive() {
  const [businesses, setBusinesses]     = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSub, setFilterSub]       = useState('all');
  const [screenshot, setScreenshot]     = useState(null);
  const [detailBiz, setDetailBiz]       = useState(null);
  const [subModal, setSubModal]         = useState(null);
  const [subForm, setSubForm]           = useState({ subscriptionStatus: '', lastPaymentDate: '' });
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [bRes, tRes] = await Promise.all([
        api.get('/businesses'),
        api.get('/business-types/all'),
      ]);
      setBusinesses(bRes.data);
      setBusinessTypes(tRes.data);
    } catch {
      showToast('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getTypeInfo = (typeId) => {
    const type = businessTypes.find(t => t.id === typeId);
    return type ? {
      icon: type.id === 1 ? <Building2 size={14} /> : <Building2 size={14} />,
      label: type.name
    } : { icon: <Building2 size={14} />, label: 'Desconocido' };
  };

  const filtered = businesses.filter(biz => {
    const matchSearch = !search || 
      biz.name.toLowerCase().includes(search.toLowerCase()) ||
      biz.slug.toLowerCase().includes(search.toLowerCase()) ||
      biz.Owner?.name?.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = filterStatus === 'all' || biz.status === filterStatus;
    const matchSub = filterSub === 'all' || biz.subscriptionStatus === filterSub;
    
    return matchSearch && matchStatus && matchSub;
  });

  const handleStatusToggle = async (biz) => {
    try {
      const newStatus = biz.status === 'active' ? 'blocked' : 'active';
      await api.patch(`/superadmin/businesses/${biz.id}/status`, { status: newStatus });
      setBusinesses(prev => prev.map(b => 
        b.id === biz.id ? { ...b, status: newStatus } : b
      ));
      showToast(`Empresa ${newStatus === 'active' ? 'activada' : 'bloqueada'}`);
    } catch {
      showToast('Error al cambiar estado', 'error');
    }
  };

  const handleSubscriptionUpdate = async () => {
    setSaving(true);
    try {
      await api.patch(`/superadmin/businesses/${subModal.id}/subscription`, subForm);
      setBusinesses(prev => prev.map(b => 
        b.id === subModal.id ? { ...b, ...subForm } : b
      ));
      showToast('Suscripción actualizada');
      setSubModal(null);
      setSubForm({ subscriptionStatus: '', lastPaymentDate: '' });
    } catch {
      showToast('Error al actualizar suscripción', 'error');
    } finally {
      setSaving(false);
    }
  };

  const BusinessCard = ({ biz }) => {
    const typeInfo = getTypeInfo(biz.type);
    const subInfo  = SUB_LABELS[biz.subscriptionStatus] || SUB_LABELS.pending;
    
    return (
      <div className="card" style={{ 
        marginBottom: 16, 
        padding: 16,
        border: '1px solid var(--border)',
        borderRadius: 12,
        background: 'var(--surface)',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 50, 
            height: 50, 
            borderRadius: 12, 
            flexShrink: 0,
            background: biz.status === 'active' ? '#ede9fe' : '#f3f4f6',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {biz.logoUrl
              ? <img src={biz.logoUrl} alt="" style={{ width: 50, height: 50, borderRadius: 12, objectFit: 'cover' }} />
              : typeInfo.icon
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: 1.2 }}>{biz.name}</h3>
            <p style={{ margin: '2px 0', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>/{biz.slug}</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{biz.Owner?.name || '—'}</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{biz.Owner?.email || '—'}</p>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
            background: 'var(--gray-100)', color: 'var(--gray-700)'
          }}>
            {typeInfo.icon} {typeInfo.label}
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: biz.status === 'active' ? '#d1fae5' : '#fee2e2',
            color: biz.status === 'active' ? '#065f46' : '#991b1b'
          }}>
            {biz.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {biz.status === 'active' ? 'Activa' : 'Bloqueada'}
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: subInfo.bg, color: subInfo.text
          }}>
            {biz.subscriptionStatus === 'paid'    && <CheckCircle size={12} />}
            {biz.subscriptionStatus === 'pending' && <Clock size={12} />}
            {biz.subscriptionStatus === 'overdue' && <AlertTriangle size={12} />}
            {subInfo.label}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
            {biz.paymentScreenshot && (
              <button
                onClick={() => setScreenshot({ url: biz.paymentScreenshot, business: biz })}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: 'linear-gradient(135deg, #ede9fe, #f5f3ff)',
                  border: '1px solid #ddd6fe', color: '#7c3aed', cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <Image size={13} /> Comprobante
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setDetailBiz(biz)}
              style={{
                padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
                background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              <Eye size={14} />
            </button>
            <button
              onClick={() => handleStatusToggle(biz)}
              style={{
                padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
                background: biz.status === 'active' ? '#fef2f2' : '#f0fdf4',
                color: biz.status === 'active' ? '#dc2626' : '#16a34a',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              {biz.status === 'active' ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SuperAdminLayout>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 8, fontSize: 14,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Empresas</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
            Gestiona todas las empresas registradas
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-outline" onClick={() => setSubModal({})}>
            <CreditCard size={16} /> Suscripciones
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar por nombre, slug o propietario..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36, width: '100%', height: 40 }}
              />
            </div>
            <div style={{ position: 'relative', minWidth: 160 }}>
              <Filter size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ paddingLeft: 30, height: 40 }}>
                <option value="all">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="blocked">Bloqueadas</option>
              </select>
            </div>
            <div style={{ position: 'relative', minWidth: 180 }}>
              <CreditCard size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select value={filterSub} onChange={e => setFilterSub(e.target.value)} style={{ paddingLeft: 30, height: 40 }}>
                <option value="all">Todas las suscripciones</option>
                <option value="paid">Pagado</option>
                <option value="pending">Pendiente</option>
                <option value="overdue">Vencido</option>
              </select>
            </div>
            <button className="btn-outline btn-sm" onClick={loadAll} style={{ flexShrink: 0, height: 40, width: '100%', minWidth: 120 }}>
              <RefreshCw size={14} /> Actualizar
            </button>
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>
            Mostrando <strong>{filtered.length}</strong> de <strong>{businesses.length}</strong> empresas
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #ede9fe', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12 }}>Cargando empresas...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Building2 size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 8 }}>No se encontraron empresas</p>
          <p style={{ color: 'var(--text-light)', fontSize: 14 }}>Intenta con otros filtros</p>
        </div>
      ) : (
        <div className="businesses-grid">
          {filtered.map(biz => <BusinessCard key={biz.id} biz={biz} />)}
        </div>
      )}

      {/* Modals */}
      {/* Modal de detalle */}
      {detailBiz && (
        <div className="modal-overlay" onClick={() => setDetailBiz(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Detalle de Empresa</h3>
              <button onClick={() => setDetailBiz(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>
                <X />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <strong>Nombre:</strong> {detailBiz.name}
              </div>
              <div>
                <strong>Slug:</strong> /{detailBiz.slug}
              </div>
              <div>
                <strong>Email:</strong> {detailBiz.Owner?.email}
              </div>
              <div>
                <strong>Teléfono:</strong> {detailBiz.Owner?.phone || 'No registrado'}
              </div>
              <div>
                <strong>Estado:</strong>
                <span style={{
                  padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                  background: detailBiz.status === 'active' ? '#d1fae5' : '#fee2e2',
                  color: detailBiz.status === 'active' ? '#065f46' : '#991b1b'
                }}>
                  {detailBiz.status === 'active' ? 'Activa' : 'Bloqueada'}
                </span>
              </div>
              <div>
                <strong>Suscripción:</strong>
                <span style={{
                  padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                  background: SUB_LABELS[detailBiz.subscriptionStatus]?.bg || '#fef3c7',
                  color: SUB_LABELS[detailBiz.subscriptionStatus]?.text || '#92400e'
                }}>
                  {SUB_LABELS[detailBiz.subscriptionStatus]?.label || 'Pendiente'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suscripción */}
      {subModal && (
        <div className="modal-overlay" onClick={() => setSubModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                {subModal.id ? 'Actualizar Suscripción' : 'Nueva Suscripción'}
              </h3>
              <button onClick={() => setSubModal(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>
                <X />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Estado de Suscripción</label>
                <select 
                  value={subForm.subscriptionStatus} 
                  onChange={e => setSubForm(prev => ({ ...prev, subscriptionStatus: e.target.value }))}
                  style={{ width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 8 }}
                >
                  <option value="">Seleccionar...</option>
                  <option value="paid">Pagado</option>
                  <option value="pending">Pendiente</option>
                  <option value="overdue">Vencido</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Fecha de Último Pago</label>
                <input
                  type="date"
                  value={subForm.lastPaymentDate}
                  onChange={e => setSubForm(prev => ({ ...prev, lastPaymentDate: e.target.value }))}
                  style={{ width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 8 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn-outline" onClick={() => setSubModal(null)}>
                  Cancelar
                </button>
                <button 
                  className="btn" 
                  onClick={handleSubscriptionUpdate}
                  disabled={saving}
                  style={{ opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de screenshot */}
      {screenshot && (
        <div className="modal-overlay" onClick={() => setScreenshot(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 800, width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                Comprobante de Pago - {screenshot.business.name}
              </h3>
              <button onClick={() => setScreenshot(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>
                <X />
              </button>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img 
                src={screenshot.url} 
                alt="Comprobante de pago" 
                style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 8, border: '1px solid var(--border)' }}
              />
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
