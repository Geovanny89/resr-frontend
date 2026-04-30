import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import BusinessCard from '../../components/businesses/BusinessCard';
import { 
  BusinessDetailModal, 
  SubscriptionModal, 
  ScreenshotModal, 
  QuickAddUsersModal, 
  DeleteConfirmModal 
} from '../../components/businesses/modals';
import { useBusinessSubscriptions } from '../../hooks/useBusinessSubscriptions';
import api from '../../api/client';
import { Search, RefreshCw } from 'lucide-react';
import '../../styles/responsive.css';

const ITEMS_PER_PAGE = 6;

export default function BusinessesResponsive() {
  const [businesses, setBusinesses] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Toast state
  const [toast, setToast] = useState(null);
  
  // Modal states
  const [detailBiz, setDetailBiz] = useState(null);
  const [screenshotBiz, setScreenshotBiz] = useState(null);
  const [businessToDelete, setBusinessToDelete] = useState(null);

  // Use subscription hook
  const {
    PLANS,
    subModal,
    setSubModal,
    subForm,
    updateSubForm,
    quickAddModal,
    setQuickAddModal,
    quickAddCount,
    setQuickAddCount,
    quickAdding,
    saving,
    calculateTotal,
    openSubscriptionModal,
    handleSubscriptionUpdate,
    handleQuickAddUsers,
    handleApprovePayment,
    handleApproveBranch,
    openQuickAddModal
  } = useBusinessSubscriptions({ businesses, setBusinesses, showToast });

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

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const filtered = (businesses || []).filter(biz => {
    const name = biz.name || '';
    const slug = biz.slug || '';
    const ownerName = biz.Owner?.name || '';
    
    const matchSearch = !search || 
      name.toLowerCase().includes(search.toLowerCase()) ||
      slug.toLowerCase().includes(search.toLowerCase()) ||
      ownerName.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = filterStatus === 'all' || biz.status === filterStatus;
    
    return matchSearch && matchStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

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

  const handleDelete = async () => {
    if (!businessToDelete) return;
    try {
      await api.delete(`/businesses/${businessToDelete.id}`);
      setBusinesses(prev => prev.filter(b => b.id !== businessToDelete.id));
      showToast('Negocio eliminado correctamente');
      setBusinessToDelete(null);
    } catch (err) {
      showToast('Error al eliminar negocio', 'error');
    }
  };

  const handleViewScreenshot = async (biz) => {
    setScreenshotBiz(biz);
    // Mark as viewed in UI immediately
    if (!biz.paymentScreenshotViewed) {
      setBusinesses(prev => prev.map(b => 
        b.id === biz.id ? { ...b, paymentScreenshotViewed: true } : b
      ));
      // Then call backend
      try {
        await api.patch(`/businesses/${biz.id}/screenshot-viewed`);
      } catch (e) {
        console.error('Error al marcar como visto:', e);
        // Revert if fails
        setBusinesses(prev => prev.map(b => 
          b.id === biz.id ? { ...b, paymentScreenshotViewed: false } : b
        ));
      }
    }
  };

  const handleCloseScreenshot = () => {
    setScreenshotBiz(null);
  };

  const handleApprovePaymentAndClose = async (bizId) => {
    const success = await handleApprovePayment(bizId);
    if (success) {
      setScreenshotBiz(null);
    }
  };

  const handleOpenSubscriptionFromDetail = () => {
    setDetailBiz(null);
    openSubscriptionModal(detailBiz);
  };

  return (
    <SuperAdminLayout title="Empresas">
      <style>{`
        @media (max-width: 1024px) {
          .sa-biz-grid { 
            grid-template-columns: 1fr 1fr !important; 
            gap: 16px !important;
          }
        }
        @media (max-width: 640px) {
          .sa-biz-grid {
            grid-template-columns: 1fr !important;
          }
          .sa-biz-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
          }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 20px', borderRadius: 8, background: toast.type === 'success' ? '#10b981' : '#ef4444', color: 'white' }}>
          {toast.msg}
        </div>
      )}

      <div className="sa-biz-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
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
          <div className="sa-biz-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {paginatedItems.map(biz => (
              <BusinessCard 
                key={biz.id} 
                biz={biz} 
                businessTypes={businessTypes}
                onViewScreenshot={handleViewScreenshot}
                onApproveBranch={handleApproveBranch}
                onQuickAddUsers={openQuickAddModal}
                onViewDetails={setDetailBiz}
                onToggleStatus={handleStatusToggle}
                onDelete={setBusinessToDelete}
              />
            ))}
          </div>
          
          {/* Pagination */}
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

      {/* Modals */}
      <BusinessDetailModal
        business={detailBiz}
        allBusinesses={businesses}
        businessTypes={businessTypes}
        onClose={() => setDetailBiz(null)}
        onOpenSubscription={handleOpenSubscriptionFromDetail}
        onUpdateBusiness={(id, updates) => {
          setBusinesses(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
          if (detailBiz?.id === id) setDetailBiz({ ...detailBiz, ...updates });
        }}
      />

      <SubscriptionModal
        business={subModal}
        form={subForm}
        onClose={() => setSubModal(null)}
        onUpdate={handleSubscriptionUpdate}
        onChange={updateSubForm}
        saving={saving}
        calculateTotal={calculateTotal}
      />

      <ScreenshotModal
        screenshot={screenshotBiz?.paymentScreenshot || screenshotBiz?.branchPaymentScreenshot}
        business={screenshotBiz}
        onClose={handleCloseScreenshot}
        onApprove={handleApprovePaymentAndClose}
      />

      <QuickAddUsersModal
        business={quickAddModal}
        count={quickAddCount}
        onClose={() => setQuickAddModal(null)}
        onConfirm={handleQuickAddUsers}
        onChangeCount={setQuickAddCount}
        adding={quickAdding}
      />

      <DeleteConfirmModal
        business={businessToDelete}
        onClose={() => setBusinessToDelete(null)}
        onConfirm={handleDelete}
        saving={saving}
      />
    </SuperAdminLayout>
  );
}
