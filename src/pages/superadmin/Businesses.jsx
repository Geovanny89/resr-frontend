import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import api from '../../api/client';
import {
  Building2, Search, Eye, Lock, Unlock, CheckCircle, XCircle,
  Clock, AlertTriangle, Image, X, RefreshCw, Filter,
  CreditCard, Calendar, User, Trash2, Check
} from 'lucide-react';
import '../../styles/responsive.css';

// Extraer la URL base del backend desde el cliente API
const API_BASE_URL = api.defaults.baseURL || '';
const BACKEND_URL = API_BASE_URL.replace(/\/api$/, ''); // Quitar el sufijo /api si existe

function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  // Asegurar que la URL comience con / si no lo tiene
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_URL}${cleanUrl}`;
}

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
  const [subForm, setSubForm]           = useState({ 
    subscriptionStatus: '', 
    lastPaymentDate: '',
    subscriptionStartDate: '',
    subscriptionEndDate: ''
  });
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState(null);
  const [currentPage, setCurrentPage]     = useState(1);
  const ITEMS_PER_PAGE = 6;

  const handleApprovePayment = async (bizId) => {
    try {
      const response = await api.post(`/businesses/${bizId}/approve-payment`);
      setBusinesses(prev => prev.map(b => 
        b.id === bizId ? { ...b, ...response.data.business, subscriptionStatus: 'paid' } : b
      ));
      setScreenshot(null);
      showToast('Pago aprobado correctamente. Suscripción activada por 30 días.');
    } catch (err) {
      showToast('Error al aprobar el pago', 'error');
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [bRes, tRes] = await Promise.all([
        api.get('/businesses'),
        api.get('/business-types/all'),
      ]);
      setBusinesses(bRes.data || []);
      setBusinessTypes(tRes.data || []);
    } catch (err) {
      console.error(err);
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
      icon: <Building2 size={14} />,
      label: type.name
    } : { icon: <Building2 size={14} />, label: 'Desconocido' };
  };

  const filtered = (businesses || []).filter(biz => {
    const name = biz.name || '';
    const slug = biz.slug || '';
    const ownerName = biz.Owner?.name || '';
    
    const matchSearch = !search || 
      name.toLowerCase().includes(search.toLowerCase()) ||
      slug.toLowerCase().includes(search.toLowerCase()) ||
      ownerName.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = filterStatus === 'all' || biz.status === filterStatus;
    const matchSub = filterSub === 'all' || biz.subscriptionStatus === filterSub;
    
    return matchSearch && matchStatus && matchSub;
  });

  // Paginación
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  // Reset a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterSub]);

  const handleStatusToggle = async (biz) => {
    try {
      const newStatus = biz.status === 'active' ? 'blocked' : 'active';
      await api.patch(`/businesses/${biz.id}/status`, { status: newStatus });
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
      const response = await api.patch(`/businesses/${subModal.id}/subscription-dates`, subForm);
      setBusinesses(prev => prev.map(b => 
        b.id === subModal.id ? { ...b, ...response.data } : b
      ));
      showToast('Suscripción actualizada');
      setSubModal(null);
    } catch {
      showToast('Error al actualizar suscripción', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (biz) => {
    if (!confirm(`¿Estás seguro de eliminar el negocio "${biz.name}"?\n\nEsta acción no se puede deshacer y eliminará todos los datos asociados (citas, servicios, empleados).`)) {
      return;
    }
    try {
      await api.delete(`/businesses/${biz.id}`);
      setBusinesses(prev => prev.filter(b => b.id !== biz.id));
      showToast('Negocio eliminado correctamente');
    } catch (err) {
      showToast('Error al eliminar negocio', 'error');
    }
  };

  const handleViewScreenshot = async (biz) => {
    setScreenshot({ url: biz.paymentScreenshot, business: biz });
    // Marcar como visto inmediatamente en UI
    if (!biz.paymentScreenshotViewed) {
      setBusinesses(prev => prev.map(b => 
        b.id === biz.id ? { ...b, paymentScreenshotViewed: true } : b
      ));
      // Luego llamar al backend
      try {
        await api.patch(`/businesses/${biz.id}/screenshot-viewed`);
      } catch (e) {
        console.error('Error al marcar como visto:', e);
        // Revertir si falla
        setBusinesses(prev => prev.map(b => 
          b.id === biz.id ? { ...b, paymentScreenshotViewed: false } : b
        ));
      }
    }
  };

  const BusinessCard = ({ biz }) => {
    const typeInfo = getTypeInfo(biz.type);
    const subInfo  = SUB_LABELS[biz.subscriptionStatus] || SUB_LABELS.pending;
    
    return (
      <div className="card" style={{ 
        padding: 20, border: '1px solid var(--border)',
        borderRadius: 16, background: 'var(--surface)',
        display: 'flex', flexDirection: 'column', height: '100%',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, flexShrink: 0,
            background: biz.status === 'active' ? 'linear-gradient(135deg, var(--gray-50), var(--gray-100))' : 'var(--gray-100)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            border: '1px solid var(--border)'
          }}>
            {biz.logoUrl
              ? <img src={getImgUrl(biz.logoUrl)} alt="" style={{ width: '100%', height: '100%', borderRadius: 14, objectFit: 'cover' }} />
              : typeInfo.icon
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{biz.name}</h3>
            <p style={{ margin: '2px 0 4px', fontSize: 12, color: 'var(--primary)', fontWeight: 600, fontFamily: 'monospace' }}>/{biz.slug}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-main)', fontWeight: 500 }}>{biz.Owner?.name || '—'}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{biz.Owner?.email || '—'}</p>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 'auto', flexWrap: 'wrap' }}>
          <span className="badge" style={{ 
            padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
            background: biz.status === 'active' ? 'var(--success-bg)' : 'var(--danger-bg)', 
            color: biz.status === 'active' ? 'var(--success-text)' : 'var(--danger-text)',
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            {biz.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {biz.status === 'active' ? 'Activa' : 'Bloqueada'}
          </span>
          <span className="badge" style={{ 
            padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
            background: subInfo.bg, color: subInfo.text,
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            {biz.subscriptionStatus === 'paid' && <CheckCircle size={12} />}
            {biz.subscriptionStatus === 'pending' && <Clock size={12} />}
            {biz.subscriptionStatus === 'overdue' && <AlertTriangle size={12} />}
            {subInfo.label}
          </span>
          {biz.paymentScreenshot && !biz.paymentScreenshotViewed && (
            <span className="badge" style={{ 
              padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: 'var(--info-bg)', color: 'var(--info-text)',
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              <Image size={12} />
              Nuevo comprobante
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          {biz.paymentScreenshot && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                className="btn-icon" 
                onClick={() => handleViewScreenshot(biz)}
                title="Ver comprobante"
                style={{ 
                  background: !biz.paymentScreenshotViewed ? 'var(--info-bg)' : 'var(--gray-100)', 
                  color: !biz.paymentScreenshotViewed ? 'var(--info-text)' : 'var(--text-muted)',
                  border: biz.paymentScreenshotViewed ? '1px solid var(--border)' : '2px solid var(--primary)',
                  position: 'relative'
                }}
              >
                <Image size={18} />
                {!biz.paymentScreenshotViewed && (
                  <span style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'var(--danger)',
                    border: '2px solid var(--surface)'
                  }} />
                )}
              </button>
            </div>
          )}
          <button 
            className="btn-icon" 
            onClick={() => setDetailBiz(biz)}
            title="Ver detalles"
            style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}
          >
            <Eye size={18} />
          </button>
          <button 
            className="btn-icon" 
            onClick={() => handleStatusToggle(biz)}
            title={biz.status === 'active' ? 'Bloquear' : 'Desbloquear'}
            style={{ 
              background: biz.status === 'active' ? 'var(--danger-bg)' : 'var(--success-bg)', 
              color: biz.status === 'active' ? 'var(--danger-text)' : 'var(--success-text)' 
            }}
          >
            {biz.status === 'active' ? <Lock size={18} /> : <Unlock size={18} />}
          </button>
          <button 
            className="btn-icon" 
            onClick={() => handleDelete(biz)}
            title="Eliminar negocio"
            style={{ 
              background: 'var(--danger-bg)', 
              color: 'var(--danger-text)'
            }}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <SuperAdminLayout title="Empresas">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 20px', borderRadius: 8, background: toast.type === 'success' ? '#10b981' : '#ef4444', color: 'white' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Gestión de Empresas</h2>
        <button className="btn-primary" onClick={loadAll}><RefreshCw size={16} /> Actualizar</button>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="blocked">Bloqueadas</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Cargando empresas...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {paginatedItems.map(biz => <BusinessCard key={biz.id} biz={biz} />)}
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: 8, 
              marginTop: 32,
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: currentPage === 1 ? 'var(--gray-100)' : 'var(--surface)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                ← Anterior
              </button>
              
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: currentPage === page ? 'var(--primary)' : 'white',
                      color: currentPage === page ? 'white' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: currentPage === totalPages ? 'var(--gray-100)' : 'var(--surface)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Siguiente →
              </button>
            </div>
          )}
          
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginTop: 16 }}>
            Mostrando {paginatedItems.length} de {filtered.length} empresas
            {filtered.length > ITEMS_PER_PAGE && ` (Página ${currentPage} de ${totalPages})`}
          </p>
        </>
      )}

      {detailBiz && (
        <div className="modal-overlay" onClick={() => setDetailBiz(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, padding: 0, overflow: 'hidden', borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '24px 28px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{detailBiz.name}</h3>
                <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: 13 }}>Información detallada del negocio</p>
              </div>
              <button className="btn-icon" onClick={() => setDetailBiz(null)} style={{ color: 'white', background: 'rgba(255,255,255,0.2)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: 28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <Search size={20} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Identificador</p>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>/{detailBiz.slug}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success-text)' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Propietario</p>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{detailBiz.Owner?.email}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '20px', background: 'var(--gray-100)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Suscripción desde</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Calendar size={16} color="var(--primary)" />
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--primary)' }}>
                        {detailBiz.subscriptionStartDate ? new Date(detailBiz.subscriptionStartDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'No definida'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vence el día</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={16} color="var(--danger)" />
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--danger)' }}>
                        {detailBiz.subscriptionEndDate ? new Date(detailBiz.subscriptionEndDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'No definida'}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '14px', borderRadius: 10, fontWeight: 700, marginTop: 4, fontSize: 15 }}
                  onClick={() => {
                    setSubForm({
                      subscriptionStatus: detailBiz.subscriptionStatus || 'pending',
                      lastPaymentDate: detailBiz.lastPaymentDate ? detailBiz.lastPaymentDate.split('T')[0] : '',
                      subscriptionStartDate: detailBiz.subscriptionStartDate ? detailBiz.subscriptionStartDate.split('T')[0] : '',
                      subscriptionEndDate: detailBiz.subscriptionEndDate ? detailBiz.subscriptionEndDate.split('T')[0] : ''
                    });
                    setSubModal(detailBiz);
                    setDetailBiz(null);
                  }}
                >
                  <CreditCard size={18} style={{ marginRight: 8 }} />
                  Actualizar Suscripción
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {subModal && (
        <div className="modal-overlay" onClick={() => setSubModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, width: '98%', maxHeight: '90vh', padding: 0, overflow: 'hidden', borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '24px 28px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Actualizar Suscripción</h2>
                <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: 13 }}>{subModal.name}</p>
              </div>
              <button onClick={() => setSubModal(null)} style={{ color: 'white', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="hide-scrollbar">
              <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado de suscripción</label>
                <select value={subForm.subscriptionStatus} onChange={e => setSubForm(prev => ({ ...prev, subscriptionStatus: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'var(--surface)', color: 'var(--text)' }}>
                  <option value="pending">⏳ Pendiente</option>
                  <option value="paid">✅ Al día</option>
                  <option value="overdue">❌ Vencido</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inicio</label>
                  <input type="date" value={subForm.subscriptionStartDate} onChange={e => setSubForm(prev => ({ ...prev, subscriptionStartDate: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'var(--surface)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vencimiento</label>
                  <input type="date" value={subForm.subscriptionEndDate} onChange={e => setSubForm(prev => ({ ...prev, subscriptionEndDate: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'var(--surface)', color: 'var(--text)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn-secondary" style={{ flex: 1, padding: '10px', borderRadius: 8, fontWeight: 600, fontSize: 14 }} onClick={() => setSubModal(null)}>Cancelar</button>
                <button className="btn-primary" style={{ flex: 2, padding: '10px', borderRadius: 8, fontWeight: 700, fontSize: 14 }} onClick={handleSubscriptionUpdate} disabled={saving}>{saving ? 'Guardando...' : '💾 Guardar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {screenshot && (
        <div className="modal-overlay" onClick={() => setScreenshot(null)} style={{ zIndex: 10000 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ 
            maxWidth: 500, 
            maxHeight: '90vh',
            background: 'var(--surface)', 
            padding: 0, 
            borderRadius: 16,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #10b981, #059669)', 
              padding: '16px 20px', 
              color: 'white', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Image size={20} />
                <span style={{ fontWeight: 600 }}>Comprobante de Pago</span>
              </div>
              <button 
                onClick={() => setScreenshot(null)} 
                style={{ 
                  color: 'white', 
                  background: 'rgba(255,255,255,0.2)', 
                  border: 'none', 
                  borderRadius: 8, 
                  width: 32, 
                  height: 32, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer' 
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 20, overflow: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="hide-scrollbar">
              <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
              <img 
                src={getImgUrl(screenshot.url)} 
                alt="Comprobante de Pago" 
                style={{ 
                  width: '100%', 
                  maxHeight: '60vh',
                  borderRadius: 8,
                  objectFit: 'contain'
                }} 
              />
            </div>
            <div style={{ padding: '0 20px 20px', display: 'flex', gap: 12 }}>
              <button 
                className="btn-primary" 
                style={{ 
                  flex: 1, 
                  background: 'var(--success)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 15,
                  fontWeight: 700
                }} 
                onClick={() => handleApprovePayment(screenshot.business.id)}
              >
                <Check size={20} />
                Aprobar Pago (+30 días)
              </button>
              <button 
                className="btn-secondary" 
                style={{ flex: 1, padding: '12px', borderRadius: 8, fontWeight: 600 }} 
                onClick={() => setScreenshot(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
