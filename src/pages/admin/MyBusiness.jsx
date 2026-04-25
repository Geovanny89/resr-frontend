import { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AdminLayout from '../../components/AdminLayout';

// Hooks
import { useBusiness } from '../../features/business/hooks/useBusiness';
import { useGallery } from '../../features/business/hooks/useGallery';
import { usePaymentMethods } from '../../features/business/hooks/usePaymentMethods';
import { useBranches } from '../../features/business/hooks/useBranches';
import { useImageUpload } from '../../features/business/hooks/useImageUpload';

// Components
import {
  InfoTab, BranchesTab, MediaTab, GalleryTab, SocialTab,
  PaymentsTab, MissionVisionTab, DesignTab, HoursTab, ModulesTab,
  Sidebar, DeleteImageModal, BranchModal, Toast, TabNavigation
} from '../../features/business/components';

export default function MyBusiness() {
  const { business: ctxBiz, refreshBusiness } = useAuth();
  const { colors } = useTheme();
  const [tab, setTab] = useState('info');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Hooks
  const {
    business, loading, saving, form, setForm,
    showWhatsAppReconnect, setShowWhatsAppReconnect,
    saveBusiness, handleReconnectWhatsApp, updateFormField,
    updateModuleEnabled, updateDepositConfig,
    publicUrl, previewGradient
  } = useBusiness(ctxBiz, refreshBusiness);

  const {
    gallery, uploadingGallery, showDeleteConfirm,
    handleGalleryUpload, handleRemoveGalleryImage,
    confirmDeleteImage, cancelDelete, setGalleryFromBusiness
  } = useGallery(business?.gallery, showToast);

  const {
    paymentMethods, setPaymentMethods,
    addPaymentMethod, removePaymentMethod, updatePaymentMethod,
    setMethodsFromBusiness
  } = usePaymentMethods(business?.paymentMethods);

  const {
    branches, showBranchModal, branchForm,
    branchScreenshot, submittingBranch,
    loadBranches, handleBranchSubmit, updateBranchField,
    setBranchScreenshot, openBranchModal, closeBranchModal
  } = useBranches(showToast);

  const {
    uploadingLogo, uploadingBanner,
    uploadLogo, uploadBanner, handlePaymentUpload
  } = useImageUpload(showToast);

  // Sync gallery and payment methods when business loads
  const handleLoadComplete = useCallback(() => {
    if (business) {
      setGalleryFromBusiness(business.gallery);
      setMethodsFromBusiness(business.paymentMethods);
      loadBranches(ctxBiz?.id);
    }
  }, [business, setGalleryFromBusiness, setMethodsFromBusiness, loadBranches, ctxBiz?.id]);

  // Handle save
  const handleSave = useCallback(async (e) => {
    e?.preventDefault();
    await saveBusiness(gallery, paymentMethods, (whatsappChanged) => {
      if (whatsappChanged) {
        showToast('Cambios guardados. Reconecta WhatsApp con el nuevo número', 'warning');
        setShowWhatsAppReconnect(true);
      } else {
        showToast('Cambios guardados correctamente');
      }
    }, (e) => {
      showToast(e.response?.data?.error || 'Error al guardar', 'error');
    });
  }, [saveBusiness, gallery, paymentMethods, showToast, setShowWhatsAppReconnect]);

  // Handle logo upload
  const handleLogoUpload = useCallback(async (file) => {
    await uploadLogo(file, (url) => {
      setForm(prev => ({ ...prev, logoUrl: url }));
    });
  }, [uploadLogo, setForm]);

  // Handle banner upload
  const handleBannerUpload = useCallback(async (file) => {
    await uploadBanner(file, (url) => {
      setForm(prev => ({ ...prev, bannerUrl: url }));
    });
  }, [uploadBanner, setForm]);

  // Handle payment screenshot upload
  const handlePaymentScreenshot = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await handlePaymentUpload(file, async () => {
      await saveBusiness(gallery, paymentMethods);
    });
  }, [handlePaymentUpload, saveBusiness, gallery, paymentMethods]);

  // Handle reconnect WhatsApp
  const onReconnectWhatsApp = useCallback(async () => {
    await handleReconnectWhatsApp(() => {
      showToast('Sesión cerrada. Ve al Dashboard para reconectar WhatsApp', 'success');
    }, () => {
      showToast('Error al cerrar sesión. Ve al Dashboard y usa "Vincular WhatsApp"', 'error');
    });
  }, [handleReconnectWhatsApp, showToast]);

  // Handle branch submit
  const onBranchSubmit = useCallback(async (e) => {
    e.preventDefault();
    await handleBranchSubmit(refreshBusiness, () => {
      // Reload branches after successful submission
      loadBranches(ctxBiz?.id);
    });
  }, [handleBranchSubmit, refreshBusiness, loadBranches, ctxBiz?.id]);

  // Handle copy URL
  const handleCopyUrl = useCallback(() => {
    navigator.clipboard.writeText(publicUrl);
    showToast('Enlace copiado');
  }, [publicUrl, showToast]);

  if (loading) {
    return (
      <AdminLayout title="Mi Negocio">
        <Toast toast={toast} />
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300}}>
          <div style={{textAlign:'center',color:'var(--text-muted)'}}>
            <div style={{width:40,height:40,border:'3px solid var(--border)',borderTopColor:'var(--primary)',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 12px'}}/>
            <p>Cargando...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Mi Negocio" subtitle="Personaliza tu página pública y gestiona tu información">
      <Toast toast={toast} />
      
      <style>{`
        @media (max-width: 1024px) {
          .my-business-layout {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .my-business-sidebar {
            width: 100% !important;
          }
        }
        @media (max-width: 768px) {
          .my-business-layout {
            align-items: stretch !important;
          }
          .my-business-main {
            min-width: 0;
          }
          .my-business-sidebar {
            min-width: 0;
          }
        }
        @media (max-width: 640px) {
          .my-business-tabs { display: none !important; }
          .my-business-tab-select { display: block !important; }
          .my-business-tabs {
            overflow-x: auto;
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch;
            width: 100%;
          }
          .my-business-tabs::-webkit-scrollbar {
            height: 6px;
          }
          .my-business-tabs button {
            flex: 0 0 auto;
          }
          .my-business-info-grid {
            grid-template-columns: 1fr !important;
          }
          .my-business-logo-row {
            flex-direction: column;
            align-items: flex-start !important;
          }
          .my-business-logo-actions {
            width: 100%;
            flex-direction: column;
          }
          .my-business-logo-actions button {
            width: 100%;
            justify-content: center;
          }
          .my-business-design-grid {
            grid-template-columns: 1fr !important;
          }
          .my-business-banner-img {
            height: 160px !important;
          }
        }
        @media (min-width: 641px) {
          .my-business-tab-select { display: none !important; }
        }
      `}</style>

      <div className="my-business-layout" style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:24,alignItems:'start',minWidth:0}}>
        {/* Panel principal */}
        <div className="my-business-main" style={{minWidth:0}}>
          <TabNavigation 
            activeTab={tab} 
            onChange={setTab} 
            isBranch={business?.isBranch} 
          />

          <form onSubmit={handleSave}>
            {tab === 'info' && (
              <InfoTab 
                form={form} 
                onUpdateField={updateFormField}
                onSubmit={handleSave}
                saving={saving}
              />
            )}

            {tab === 'branches' && (
              <BranchesTab 
                business={business}
                branches={branches}
                onOpenModal={openBranchModal}
              />
            )}

            {tab === 'media' && (
              <MediaTab 
                form={form}
                onUpdateField={updateFormField}
                onSubmit={handleSave}
                saving={saving}
                uploadingLogo={uploadingLogo}
                uploadingBanner={uploadingBanner}
                onUploadLogo={handleLogoUpload}
                onUploadBanner={handleBannerUpload}
              />
            )}

            {tab === 'gallery' && (
              <GalleryTab 
                gallery={gallery}
                uploadingGallery={uploadingGallery}
                onGalleryUpload={handleGalleryUpload}
                onRemoveImage={handleRemoveGalleryImage}
              />
            )}

            {tab === 'social' && (
              <SocialTab 
                form={form}
                business={business}
                onUpdateField={updateFormField}
                onSubmit={handleSave}
                saving={saving}
                showWhatsAppReconnect={showWhatsAppReconnect}
                onReconnectWhatsApp={onReconnectWhatsApp}
              />
            )}

            {tab === 'payments' && (
              <PaymentsTab 
                form={form}
                paymentMethods={paymentMethods}
                onUpdateField={updateFormField}
                onUpdatePaymentMethod={updatePaymentMethod}
                onAddPaymentMethod={addPaymentMethod}
                onRemovePaymentMethod={removePaymentMethod}
                onSubmit={handleSave}
                saving={saving}
              />
            )}

            {tab === 'mission-vision' && (
              <MissionVisionTab 
                form={form}
                onUpdateField={updateFormField}
                onSubmit={handleSave}
                saving={saving}
              />
            )}

            {tab === 'design' && (
              <DesignTab 
                form={form}
                onUpdateField={updateFormField}
                onSubmit={handleSave}
                saving={saving}
                previewGradient={previewGradient}
              />
            )}

            {tab === 'hours' && (
              <HoursTab 
                form={form}
                onUpdateField={updateFormField}
                onSubmit={handleSave}
                saving={saving}
              />
            )}

            {tab === 'modules' && (
              <ModulesTab 
                form={form}
                onModuleToggle={updateModuleEnabled}
                onDepositConfigUpdate={updateDepositConfig}
                onSubmit={handleSave}
                saving={saving}
              />
            )}
          </form>
        </div>

        {/* Panel lateral */}
        <Sidebar 
          business={business}
          form={form}
          publicUrl={publicUrl}
          previewGradient={previewGradient}
          onCopyUrl={handleCopyUrl}
          onPaymentUpload={handlePaymentScreenshot}
          paymentUploading={false}
        />
      </div>

      <DeleteImageModal 
        show={showDeleteConfirm}
        onCancel={cancelDelete}
        onConfirm={confirmDeleteImage}
      />

      <BranchModal 
        show={showBranchModal}
        onClose={closeBranchModal}
        onSubmit={onBranchSubmit}
        branchForm={branchForm}
        onUpdateField={updateBranchField}
        branchScreenshot={branchScreenshot}
        onScreenshotChange={setBranchScreenshot}
        submitting={submittingBranch}
      />
    </AdminLayout>
  );
}
