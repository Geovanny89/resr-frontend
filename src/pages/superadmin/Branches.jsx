import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import api from '../../api/client';
import {
  Store, Building2, Search, Eye, CheckCircle, XCircle,
  Clock, Image, X, RefreshCw, Filter, Trash2
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

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending_approval');
  const [screenshot, setScreenshot] = useState(null);
  const [detailBiz, setDetailBiz] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/businesses');
      // Filtrar solo los que son sucursales
      const allBranches = (res.data || []).filter(b => b.isBranch);
      setBranches(allBranches);
    } catch (err) {
      console.error(err);
      showToast('Error al cargar sucursales', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApproveBranch = async (bizId, approve) => {
    try {
      await api.post(`/businesses/${bizId}/approve-branch`, { approve });
      setBranches(prev => prev.map(b => 
        b.id === bizId ? { 
          ...b, 
          branchStatus: approve ? 'approved' : 'rejected', 
          status: approve ? 'active' : 'blocked',
          subscriptionStatus: approve ? 'paid' : b.subscriptionStatus
        } : b
      ));
      showToast(approve ? 'Sucursal aprobada y activada' : 'Sucursal rechazada');
    } catch (err) {
      showToast('Error al procesar la sucursal', 'error');
    }
  };

  const handleViewScreenshot = async (biz) => {
    setScreenshot({ url: biz.branchPaymentScreenshot, business: biz });
    // Marcar como visto inmediatamente en UI si no se ha visto
    if (!biz.paymentScreenshotViewed) {
      setBranches(prev => prev.map(b => 
        b.id === biz.id ? { ...b, paymentScreenshotViewed: true } : b
      ));
      try {
        await api.patch(`/businesses/${biz.id}/screenshot-viewed`);
      } catch (e) {
        console.error('Error al marcar como visto:', e);
      }
    }
  };

  const filtered = branches.filter(b => {
    const matchSearch = !search || 
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.Owner?.name?.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = filterStatus === 'all' || b.branchStatus === filterStatus;
    
    return matchSearch && matchStatus;
  });

  const BranchCard = ({ biz }) => (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 16,
      border: '1px solid var(--border)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.2s ease',
      height: '100%'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)';
    }}
    >
      {/* Header con gradiente */}
      <div style={{
        height: 8,
        background: biz.branchStatus === 'approved'
          ? 'linear-gradient(90deg, #10b981, #34d399)'
          : biz.branchStatus === 'pending_approval'
          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
          : 'linear-gradient(90deg, #ef4444, #f87171)'
      }} />

      <div style={{ padding: 24 }}>
        {/* Info principal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: biz.logoUrl ? 'transparent' : 'var(--primary-color-10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--border)',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {biz.logoUrl
              ? <img src={getImgUrl(biz.logoUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Building2 size={32} color="var(--primary-color)" />
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{biz.name}</h3>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 6,
              padding: '4px 10px',
              background: 'var(--bg-secondary)',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)'
            }}>
              <Store size={12} />
              {biz.ParentBusiness?.name || 'Negocio Principal'}
            </div>
          </div>
        </div>

        {/* Info del dueño */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          border: '1px solid var(--border)'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            Responsable
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            {biz.Owner?.name || 'Sin asignar'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            {biz.Owner?.email || '—'}
          </div>
        </div>

        {/* Status badges */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            background: biz.branchStatus === 'approved' ? '#d1fae5' : biz.branchStatus === 'pending_approval' ? '#fef3c7' : '#fee2e2',
            border: `1px solid ${biz.branchStatus === 'approved' ? '#10b981' : biz.branchStatus === 'pending_approval' ? '#f59e0b' : '#ef4444'}`
          }}>
            {biz.branchStatus === 'approved' ? <CheckCircle size={14} color="#059669" /> : biz.branchStatus === 'pending_approval' ? <Clock size={14} color="#d97706" /> : <XCircle size={14} color="#dc2626" />}
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: biz.branchStatus === 'approved' ? '#059669' : biz.branchStatus === 'pending_approval' ? '#d97706' : '#dc2626',
              textTransform: 'uppercase'
            }}>
              {biz.branchStatus === 'approved' ? 'Aprobada' : biz.branchStatus === 'pending_approval' ? 'Pendiente' : 'Rechazada'}
            </span>
          </div>

          {biz.branchPaymentScreenshot && !biz.paymentScreenshotViewed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              background: '#dbeafe',
              border: '1px solid #3b82f6'
            }}>
              <Image size={14} color="#2563eb" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>Nuevo</span>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: 8 }}>
          {biz.branchStatus === 'pending_approval' && (
            <>
              <button
                onClick={() => handleApproveBranch(biz.id, true)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#059669'}
                onMouseLeave={(e) => e.target.style.background = '#10b981'}
              >
                <CheckCircle size={16} />
                Aprobar
              </button>
              <button
                onClick={() => handleApproveBranch(biz.id, false)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                onMouseLeave={(e) => e.target.style.background = '#ef4444'}
              >
                <XCircle size={16} />
                Rechazar
              </button>
            </>
          )}

          {biz.branchPaymentScreenshot && (
            <button
              onClick={() => handleViewScreenshot(biz)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                background: !biz.paymentScreenshotViewed ? '#dbeafe' : 'var(--bg-secondary)',
                color: !biz.paymentScreenshotViewed ? '#2563eb' : 'var(--text)',
                border: `1px solid ${!biz.paymentScreenshotViewed ? '#3b82f6' : 'var(--border)'}`,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                flex: biz.branchStatus === 'pending_approval' ? 'unset' : 1
              }}
            >
              <Image size={16} />
              {biz.branchStatus === 'pending_approval' ? '' : 'Comprobante'}
            </button>
          )}

          <button
            onClick={() => setDetailBiz(biz)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 16px',
              background: 'var(--bg-secondary)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Ver detalles"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <SuperAdminLayout title="Solicitudes de Sucursales">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 20px', borderRadius: 8, background: toast.type === 'success' ? '#10b981' : '#ef4444', color: 'white' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Gestión de Sucursales</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>Revisa y aprueba las solicitudes de nuevas sedes</p>
        </div>
        <button className="btn-primary" onClick={loadBranches}><RefreshCw size={16} /> Actualizar</button>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Buscar sucursal o dueño..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36, width: '100%' }} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="pending_approval">Pendientes de Aprobación</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <Store size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
          <p>No se encontraron solicitudes de sucursales.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map(biz => <BranchCard key={biz.id} biz={biz} />)}
        </div>
      )}

      {/* Modal de Detalle */}
      {detailBiz && (
        <div className="modal-overlay" onClick={() => setDetailBiz(null)} style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            maxWidth: 420,
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            borderRadius: 16,
            background: 'white',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            {/* Header azul */}
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              padding: '24px 24px 20px',
              borderRadius: '16px 16px 0 0',
              position: 'relative'
            }}>
              <button
                onClick={() => setDetailBiz(null)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                <X size={20} />
              </button>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'white' }}>
                {detailBiz.name}
              </h3>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>
                Información detallada de la sucursal
              </p>
            </div>

            {/* Body */}
            <div style={{ padding: 24 }}>
              {/* Info items con iconos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Identificador */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Store size={20} color="#64748b" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Negocio Padre
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginTop: 2 }}>
                      {detailBiz.ParentBusiness?.name || 'Negocio Principal'}
                    </div>
                  </div>
                </div>

                {/* Propietario */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>👤</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Propietario
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginTop: 2 }}>
                      {detailBiz.Owner?.name || 'N/A'}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 1 }}>
                      {detailBiz.Owner?.email || '—'}
                    </div>
                  </div>
                </div>

                {/* Contacto de sucursal */}
                <div style={{
                  background: '#f8fafc',
                  borderRadius: 12,
                  padding: 16,
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                        � Dirección
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>
                        {detailBiz.address || 'No registrada'}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                        📞 Teléfono
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>
                        {detailBiz.phone || 'No registrado'}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #e2e8f0' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                      📧 Email
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>
                      {detailBiz.email || 'No registrado'}
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: detailBiz.branchStatus === 'approved' ? '#dcfce7' : detailBiz.branchStatus === 'pending_approval' ? '#fef3c7' : '#fee2e2',
                  borderRadius: 10,
                  border: `1px solid ${detailBiz.branchStatus === 'approved' ? '#86efac' : detailBiz.branchStatus === 'pending_approval' ? '#fcd34d' : '#fecaca'}`
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Estado de la Sucursal</span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: detailBiz.branchStatus === 'approved' ? '#16a34a' : detailBiz.branchStatus === 'pending_approval' ? '#d97706' : '#dc2626',
                    textTransform: 'uppercase'
                  }}>
                    {detailBiz.branchStatus === 'approved' ? '✓ Aprobada' : detailBiz.branchStatus === 'pending_approval' ? '⏳ Pendiente' : '✗ Rechazada'}
                  </span>
                </div>
              </div>

              {/* Botón de acción */}
              <button
                onClick={() => setDetailBiz(null)}
                style={{
                  width: '100%',
                  marginTop: 20,
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(59,130,246,0.45)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59,130,246,0.35)';
                }}
              >
                <Eye size={18} />
                Ver en lista completa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Comprobante */}
      {screenshot && (
        <div className="modal-overlay" onClick={() => setScreenshot(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h3>Comprobante de Pago - {screenshot.business.name}</h3>
              <button onClick={() => setScreenshot(null)}><X size={20} /></button>
            </div>
            <div style={{ textAlign: 'center', padding: 20 }}>
              {screenshot.url ? (
                <>
                  <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 20,
                    border: '3px solid var(--primary-color)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: 'var(--primary-color)',
                      marginBottom: 12,
                      letterSpacing: 0.5
                    }}>
                      📄 Comprobante de Pago
                    </div>
                    <img
                      src={getImgUrl(screenshot.url)}
                      alt="Comprobante de pago"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 400,
                        borderRadius: 8,
                        objectFit: 'contain',
                        border: '1px solid var(--border)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div style={{
                      display: 'none',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 12,
                      padding: 40,
                      color: 'var(--text-muted)'
                    }}>
                      <Image size={48} />
                      <p>No se pudo cargar la imagen del comprobante</p>
                    </div>
                  </div>

                  <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 20,
                    fontSize: 13,
                    color: 'var(--text-secondary)'
                  }}>
                    <strong>Negocio:</strong> {screenshot.business.name}<br/>
                    <strong>Propietario:</strong> {screenshot.business.Owner?.name || 'N/A'}<br/>
                    <strong>Email:</strong> {screenshot.business.Owner?.email || 'N/A'}
                  </div>
                </>
              ) : (
                <div style={{
                  padding: 40,
                  color: 'var(--text-muted)',
                  textAlign: 'center'
                }}>
                  <Image size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                  <p>No hay comprobante de pago adjunto</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button
                  className="btn-success"
                  style={{ flex: 1, padding: '12px 20px', fontSize: 14 }}
                  onClick={() => { handleApproveBranch(screenshot.business.id, true); setScreenshot(null); }}
                >
                  <CheckCircle size={16} style={{ marginRight: 8 }} />
                  Aprobar Sucursal
                </button>
                <button
                  className="btn-danger"
                  style={{ flex: 1, padding: '12px 20px', fontSize: 14 }}
                  onClick={() => { handleApproveBranch(screenshot.business.id, false); setScreenshot(null); }}
                >
                  <XCircle size={16} style={{ marginRight: 8 }} />
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
