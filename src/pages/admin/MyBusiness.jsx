import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import { Store, Globe, Image, Palette, Share2, Clock, Eye, Upload, Trash2, Plus, CreditCard, Trash, CheckCircle, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

// URL base para imágenes
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const FALLBACK_BACKEND_URL = isLocal ? 'http://localhost:4000' : 'https://api-reservas.k-dice.com';

function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const base = (api.defaults.baseURL && !api.defaults.baseURL.startsWith('/')) 
    ? api.defaults.baseURL.replace('/api', '') 
    : FALLBACK_BACKEND_URL;
  return `${base}${cleanUrl}`;
}

const SUB_STATUS_COLORS  = { pending: '#f6ad55', paid: '#48bb78', overdue: '#f56565' };
const SUB_STATUS_LABELS  = { pending: 'Pendiente', paid: 'Al dia', overdue: 'Vencido' };

const TABS = [
  { id: 'info',    icon: Store,   label: 'Informacion' },
  { id: 'branches', icon: Store,  label: 'Sucursales' },
  { id: 'media',   icon: Image,   label: 'Logo & Banner' },
  { id: 'gallery', icon: Image,   label: 'Galeria' },
  { id: 'social',  icon: Share2,  label: 'Redes Sociales' },
  { id: 'payments', icon: CreditCard, label: 'Metodos de Pago' },
  { id: 'mission-vision', icon: Store, label: 'Mision y Vision' },
  { id: 'design',  icon: Palette, label: 'Diseno' },
  { id: 'hours',   icon: Clock,   label: 'Horarios' },
  { id: 'modules', icon: Store,   label: 'Modulos' },
];

export default function MyBusiness() {
  const { business: ctxBiz, refreshBusiness } = useAuth();
  const { colors } = useTheme();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('info');
  const [form, setForm] = useState({});
  const [gallery, setGallery] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [paymentUploading, setPaymentUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [branches, setBranches] = useState([]);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: '', type: 'otro', address: '', phone: '' });
  const [branchScreenshot, setBranchScreenshot] = useState(null);
  const [submittingBranch, setSubmittingBranch] = useState(false);
  const [showWhatsAppReconnect, setShowWhatsAppReconnect] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const MAX_GALLERY_IMAGES = 20;
  const logoRef    = useRef();
  const bannerRef  = useRef();
  const galleryRef = useRef();
  const paymentRef = useRef();
  const branchPaymentRef = useRef();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      // Cargamos el negocio y las sucursales por separado para que si una falla la otra no bloquee todo
      // Usamos el ctxBiz.id del contexto para saber cual negocio cargar si el admin tiene varios
      const res = await api.get(`/businesses/my/business${ctxBiz?.id ? `?businessId=${ctxBiz.id}` : ''}`);
      const biz = res.data;
      setBusiness(biz);

      try {
        const bRes = await api.get('/businesses/my/branches');
        setBranches(bRes.data || []);
      } catch (branchErr) {
        console.log('No se pudieron cargar las sucursales:', branchErr.message);
        setBranches([]);
      }

      let gal = [];
      try { gal = JSON.parse(biz.gallery || '[]'); } catch(e) { gal = []; }
      setGallery(gal);
      let pmt = [];
      try { 
        if (typeof biz.paymentMethods === 'string') {
          pmt = JSON.parse(biz.paymentMethods || '[]');
        } else {
          pmt = biz.paymentMethods || [];
        }
      } catch(e) { pmt = []; }
      setPaymentMethods(pmt);
      setForm({
        name: biz.name || '',
        type: biz.type || 'otro',
        description: biz.description || '',
        phone: biz.phone || '',
        address: biz.address || '',
        tagline: biz.tagline || '',
        ctaText: biz.ctaText || 'Reservar cita ahora',
        businessHours: biz.businessHours || '',
        metaDescription: biz.metaDescription || '',
        isTechnicalServices: biz.isTechnicalServices || false,
        hasFieldTechnicians: biz.hasFieldTechnicians || false,
        whatsapp: biz.whatsapp || '',
        whatsappCatalog: biz.whatsappCatalog || '',
        instagram: biz.instagram || '',
        facebook: biz.facebook || '',
        tiktok: biz.tiktok || '',
        twitter: biz.twitter || '',
        pinterest: biz.pinterest || '',
        youtube: biz.youtube || '',
        website: biz.website || '',
        primaryColor: biz.primaryColor || '#667eea',
        secondaryColor: biz.secondaryColor || '#764ba2',
        logoUrl: biz.logoUrl || '',
        bannerUrl: biz.bannerUrl || '',
        showPaymentMethods: biz.showPaymentMethods || false,
        mission: biz.mission || '',
        vision: biz.vision || '',
        showMissionVision: biz.showMissionVision || false,
        useParentWhatsApp: biz.useParentWhatsApp !== undefined ? biz.useParentWhatsApp : true,
        googleMapsUrl: biz.googleMapsUrl || '',
        enabledModules: biz.enabledModules || { expenses: false, inventory: false, deposits: false },
        depositConfig: biz.depositConfig || {
          required: false,
          amount: 0,
          percentage: 30,
          cancelationHours: 24,
          penaltyEnabled: true,
          termsText: 'El anticipo garantiza tu cita. Si cancelas con menos de 24 horas de anticipo o no asistes, el anticipo será retenido como penalidad.'
        }
      });
    } catch(e) {
      if (e.response?.status !== 404) {
        showToast('Error al cargar el negocio', 'error');
      }
      console.error('Error loading business:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [ctxBiz?.id]);

  const handleSave = async (e) => {
    e && e.preventDefault();
    setSaving(true);
    try {
      // Detectar si cambió el número de WhatsApp
      const originalWhatsApp = business?.whatsapp || '';
      const newWhatsApp = form.whatsapp || '';
      const whatsappChanged = originalWhatsApp !== newWhatsApp && newWhatsApp !== '';
      
      const payload = { ...form, gallery: JSON.stringify(gallery), paymentMethods: JSON.stringify(paymentMethods) };
      console.log('Saving showPaymentMethods:', payload.showPaymentMethods);
      await api.put(`/businesses/my/business${ctxBiz?.id ? `?businessId=${ctxBiz.id}` : ''}`, payload);
      if (refreshBusiness) await refreshBusiness();
      await load();
      
      if (whatsappChanged) {
        showToast('Cambios guardados. Reconecta WhatsApp con el nuevo número', 'warning');
        setShowWhatsAppReconnect(true);
      } else {
        showToast('Cambios guardados correctamente');
      }
    } catch(e) {
      showToast(e.response?.data?.error || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const handleReconnectWhatsApp = async () => {
    try {
      await api.post(`/notifications/whatsapp/logout?businessId=${business.id}`);
      showToast('Sesión cerrada. Ve al Dashboard para reconectar WhatsApp', 'success');
      setShowWhatsAppReconnect(false);
    } catch (e) {
      showToast('Error al cerrar sesión. Ve al Dashboard y usa "Vincular WhatsApp"', 'error');
    }
  };

  const handleBranchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (submittingBranch) return;
    if (!branchScreenshot) return showToast('El comprobante es obligatorio', 'error');
    
    setSubmittingBranch(true);
    console.log('[BranchSubmit] Iniciando solicitud de sucursal...');
    try {
      // 1. Subir comprobante
      const fd = new FormData();
      fd.append('image', branchScreenshot);
      console.log('[BranchSubmit] Subiendo imagen a /upload...');
      const uploadRes = await api.post('/upload', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      const imageUrl = uploadRes.data.url;
      console.log('[BranchSubmit] Imagen subida con éxito:', imageUrl);
      
      // 2. Solicitar sucursal
      const branchData = {
        name: branchForm.name,
        type: branchForm.type || 'otro',
        address: branchForm.address,
        phone: branchForm.phone,
        isTechnicalServices: branchForm.isTechnicalServices || false,
        branchPaymentScreenshot: imageUrl
      };
      
      console.log('[BranchSubmit] Enviando datos finales:', branchData);
      const branchRes = await api.post('/businesses/request-branch', branchData);
      console.log('[BranchSubmit] Respuesta del servidor:', branchRes.data);
      
      // LIMPIAR ESTADOS
      setShowBranchModal(false);
      setBranchForm({ name: '', type: 'otro', address: '', phone: '' });
      setBranchScreenshot(null);
      
      // NOTIFICAR ÉXITO
      showToast('✅ Solicitud enviada correctamente al administrador');
      
      // REFRESCAR DATOS
      if (refreshBusiness) await refreshBusiness();
      await load();
      
    } catch (err) {
      console.error('[BranchSubmit] ERROR DETALLADO:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMsg = err.response?.data?.error || err.message || 'Error al solicitar sucursal';
      showToast('❌ ' + errorMsg, 'error');
    } finally {
      setSubmittingBranch(false);
    }
  };

  const handleUploadImage = async (file, field, setUploading) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, [field]: res.data.url }));
      showToast('Imagen subida correctamente');
    } catch(e) {
      showToast('Error al subir imagen', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    // Verificar límite de 20 fotos
    const currentCount = gallery.length;
    const newCount = currentCount + files.length;
    
    if (currentCount >= MAX_GALLERY_IMAGES) {
      showToast(`Solo puedes subir ${MAX_GALLERY_IMAGES} fotos. Elimina algunas para subir más.`, 'error');
      return;
    }
    
    if (newCount > MAX_GALLERY_IMAGES) {
      const allowed = MAX_GALLERY_IMAGES - currentCount;
      showToast(`Solo puedes subir ${allowed} foto(s) más. Límite: ${MAX_GALLERY_IMAGES} fotos.`, 'error');
      return;
    }
    
    setUploadingGallery(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('images', f));
      const res = await api.post('/upload/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setGallery(g => [...g, ...res.data.urls]);
      showToast(`${res.data.urls.length} imagen(es) subida(s)`);
    } catch(e) {
      showToast('Error al subir imagenes', 'error');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (url) => {
    setImageToDelete(url);
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;
    try {
      await api.delete('/upload/gallery/remove', { data: { url: imageToDelete } });
      setGallery(g => g.filter(u => u !== imageToDelete));
      showToast('Imagen eliminada correctamente');
    } catch(e) {
      showToast('Error al eliminar imagen', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setImageToDelete(null);
    }
  };

  const handlePaymentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPaymentUploading(true);
    try {
      const fd = new FormData();
      fd.append('screenshot', file);
      await api.post('/businesses/my/payment-screenshot', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await load();
      showToast('Comprobante enviado correctamente');
    } catch(e) {
      showToast('Error al subir comprobante', 'error');
    } finally {
      setPaymentUploading(false);
    }
  };

  const publicUrl = business ? `${window.location.origin}/${business.slug}` : '';
  const previewGradient = `linear-gradient(135deg, ${form.primaryColor || '#667eea'} 0%, ${form.secondaryColor || '#764ba2'} 100%)`;

  if (loading) return (
    <AdminLayout title="Mi Negocio">
      {toast && (
        <div style={{position:'fixed',top:20,right:20,zIndex:9999,padding:'12px 20px',borderRadius:10,background:toast.type==='error'?'#f56565':'#48bb78',color:'white',fontWeight:600,boxShadow:'0 4px 20px rgba(0,0,0,0.2)',animation:'slideIn 0.3s ease'}}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
          <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
        </div>
      )}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300}}>
        <div style={{textAlign:'center',color:'var(--text-muted)'}}>
          <div style={{width:40,height:40,border:'3px solid var(--border)',borderTopColor:'var(--primary)',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 12px'}}/>
          <p>Cargando...</p>
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Mi Negocio" subtitle="Personaliza tu pagina publica y gestiona tu informacion">
      <style>{`
        /* Ajustes de layout para pantallas pequeñas */
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
          /* En móvil usamos un selector en vez de tabs con scroll */
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
      {/* Toast */}
      {toast && (
        <div style={{position:'fixed',top:20,right:20,zIndex:9999,padding:'12px 20px',borderRadius:10,background:toast.type==='error'?'#f56565':'#48bb78',color:'white',fontWeight:600,boxShadow:'0 4px 20px rgba(0,0,0,0.2)',animation:'slideIn 0.3s ease'}}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
          <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
        </div>
      )}

      <div className="my-business-layout" style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:24,alignItems:'start',minWidth:0}}>
        {/* Panel principal */}
        <div className="my-business-main" style={{minWidth:0}}>
          {/* Selector (solo móvil) */}
          <div className="my-business-tab-select" style={{ display: 'none', marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
              Sección
            </label>
            <select value={tab} onChange={(e) => setTab(e.target.value)}>
              {TABS
                .filter(t => t.id !== 'branches' || !business?.isBranch)
                .map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          {/* Tabs */}
          <div className="my-business-tabs" style={{display:'flex',gap:4,background:'var(--bg-secondary)',borderRadius:12,padding:4,marginBottom:24,flexWrap:'wrap'}}>
            {TABS
              .filter(t => t.id !== 'branches' || !business?.isBranch)
              .map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={()=>setTab(t.id)}
                  style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,transition:'all 0.2s',
                    background:tab===t.id?'white':'transparent',
                    color:tab===t.id?'var(--primary)':'var(--text-muted)',
                    boxShadow:tab===t.id?'0 2px 8px rgba(0,0,0,0.1)':'none',
                  }}>
                  <Icon size={14}/> {t.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSave}>
            {/* TAB: Informacion */}
            {tab === 'info' && (
              <div className="card">
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
                  <Store size={18} style={{color:'var(--primary)'}}/>  Informacion del negocio
                </h3>
                <div className="my-business-info-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  <div className="form-group" style={{gridColumn:'1/-1'}}>
                    <label>Nombre del negocio *</label>
                    <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
                  </div>
                  <div className="form-group">
                    <label>Telefono</label>
                    <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+57 300 000 0000"/>
                  </div>
                  <div className="form-group">
                    <label>Direccion</label>
                    <input type="text" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Calle 10 #5-30, Ciudad"/>
                  </div>
                  <div className="form-group" style={{gridColumn:'1/-1'}}>
                    <label>Google Maps (URL de ubicación)</label>
                    <input 
                      type="text" 
                      value={form.googleMapsUrl} 
                      onChange={e=>setForm({...form,googleMapsUrl:e.target.value})} 
                      placeholder="https://www.google.com/maps/embed?pb=..."
                    />
                    <small style={{color:'var(--text-muted)'}}>
                      Pega aquí la URL de Google Maps (modo embed) para mostrar el mapa en tu página pública. 
                      <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" style={{color:'var(--primary)'}}>Abrir Google Maps</a>
                    </small>
                  </div>
                  <div className="form-group" style={{gridColumn:'1/-1'}}>
                    <label>Descripcion del negocio</label>
                    <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={4} placeholder="Describe tu negocio, servicios especiales, experiencia..."/>
                  </div>
                  <div className="form-group" style={{gridColumn:'1/-1'}}>
                    <label>Slogan / Tagline</label>
                    <input type="text" value={form.tagline} onChange={e=>setForm({...form,tagline:e.target.value})} placeholder="Tu estilo, nuestra pasion"/>
                    <small style={{color:'var(--text-muted)'}}>Aparece debajo del nombre en tu pagina publica</small>
                  </div>
                  <div className="form-group">
                    <label>Texto del boton de reserva</label>
                    <input type="text" value={form.ctaText} onChange={e=>setForm({...form,ctaText:e.target.value})} placeholder="Reservar cita ahora"/>
                  </div>
                  <div className="form-group">
                    <label>Meta descripcion (SEO)</label>
                    <input type="text" value={form.metaDescription} onChange={e=>setForm({...form,metaDescription:e.target.value})} placeholder="Descripcion para buscadores..."/>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1/-1', marginTop: 10, padding: 20, background: 'rgba(99, 102, 241, 0.05)', borderRadius: 12, border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', margin: 0 }}>
                      <input 
                        type="checkbox" 
                        checked={form.isTechnicalServices} 
                        onChange={e => setForm({ ...form, isTechnicalServices: e.target.checked })}
                        style={{ width: 20, height: 20, cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 15 }}>Empresa de Servicios Especializados</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>
                          Activa esta opción si tu negocio es de  servicios epecializados, soporte técnico, reparaciones o revisiones. Esto ocultará los precios de los servicios y permitirá cotizar en sitio.
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1/-1', marginTop: 10, padding: 20, background: 'rgba(245, 158, 11, 0.05)', borderRadius: 12, border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', margin: 0 }}>
                      <input 
                        type="checkbox" 
                        checked={form.hasFieldTechnicians} 
                        onChange={e => setForm({ ...form, hasFieldTechnicians: e.target.checked })}
                        style={{ width: 20, height: 20, cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: 15 }}>🔧 Técnicos a Domicilio (Seguimiento en Campo)</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>
                          Activa esta opción si envías técnicos a domicilio. Deshabilita recordatorios WhatsApp (el técnico los recibe por la app), habilita botones de seguimiento "En Camino", "Llegué", registro de insumos y reporte técnico.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: 24 }} disabled={saving}>
                  {saving ? 'Guardando...' : '💾 Guardar cambios'}
                </button>
              </div>
            )}

            {/* TAB: Sucursales */}
            {tab === 'branches' && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Store size={18} style={{ color: 'var(--primary)' }}/> Mis Sucursales
                  </h3>
                  {!business?.isBranch && (
                    <button type="button" className="btn-primary" onClick={() => setShowBranchModal(true)}>
                      <Plus size={14}/> Solicitar Sucursal
                    </button>
                  )}
                </div>

                <div style={{ background: '#f0f9ff', padding: 16, borderRadius: 12, border: '1px solid #bae6fd', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: '#0369a1', margin: 0, fontWeight: 500 }}>
                    🎁 ¡Aprovecha nuestro beneficio! Cada sucursal nueva tiene un <strong>50% de descuento (35.000)</strong> en la suscripción mensual. 
                    Solo debes subir el comprobante de pago para que la habilitemos.
                  </p>
                </div>

                {branches.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, border: '2px dashed var(--border)', borderRadius: 12, color: 'var(--text-muted)' }}>
                    <Store size={40} style={{ opacity: 0.2, marginBottom: 12 }}/>
                    <p style={{ margin: 0 }}>No tienes sucursales registradas aún.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {branches.map(b => (
                      <div key={b.id} style={{ 
                        padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>{b.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.address || 'Sin dirección'}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ 
                            fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                            background: b.branchStatus === 'approved' ? '#dcfce7' : b.branchStatus === 'pending_approval' ? '#fef3c7' : '#fee2e2',
                            color: b.branchStatus === 'approved' ? '#166534' : b.branchStatus === 'pending_approval' ? '#92400e' : '#991b1b'
                          }}>
                            {b.branchStatus === 'approved' ? 'Activa' : b.branchStatus === 'pending_approval' ? 'Pendiente' : 'Rechazada'}
                          </span>
                          <button type="button" className="btn-icon" onClick={() => window.open(`/${b.slug}`, '_blank')}>
                            <Globe size={16}/>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Logo & Banner */}
            {tab === 'media' && (
              <div style={{display:'flex',flexDirection:'column',gap:20}}>
                <div className="card">
                  <h3 style={{fontSize:16,fontWeight:700,marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
                    <Image size={18} style={{color:'var(--primary)'}}/> Logo del negocio
                  </h3>
                  <div className="my-business-logo-row" style={{display:'flex',alignItems:'center',gap:20}}>
                    <div style={{width:100,height:100,borderRadius:'50%',overflow:'hidden',border:'3px solid var(--border)',background:'var(--bg-secondary)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      {form.logoUrl ? (
                        <img src={getImgUrl(form.logoUrl)} alt="Logo" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      ) : (
                        <span style={{fontSize:36}}>🏪</span>
                      )}
                    </div>
                    <div style={{flex:1}}>
                      <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:12}}>
                        Sube el logo de tu negocio. Recomendado: imagen cuadrada de al menos 200x200px.
                      </p>
                      <div className="my-business-logo-actions" style={{display:'flex',gap:8}}>
                        <button type="button" className="btn-primary" onClick={()=>logoRef.current.click()} disabled={uploadingLogo}>
                          <Upload size={14}/> {uploadingLogo ? 'Subiendo...' : 'Subir logo'}
                        </button>
                        {form.logoUrl && (
                          <button type="button" className="btn-danger" onClick={()=>setForm(f=>({...f,logoUrl:''}))}>
                            <Trash2 size={14}/> Eliminar
                          </button>
                        )}
                      </div>
                      <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleUploadImage(e.target.files[0],'logoUrl',setUploadingLogo)}/>
                    </div>
                  </div>
                  {form.logoUrl && (
                    <div className="form-group" style={{marginTop:16}}>
                      <label>URL del logo</label>
                      <input type="text" value={form.logoUrl} onChange={e=>setForm({...form,logoUrl:e.target.value})} placeholder="https://... o /uploads/..."/>
                    </div>
                  )}
                </div>

                <div className="card">
                  <h3 style={{fontSize:16,fontWeight:700,marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
                    <Image size={18} style={{color:'var(--primary)'}}/> Imagen de portada (Banner)
                  </h3>
                  {form.bannerUrl && (
                    <div style={{borderRadius:12,overflow:'hidden',marginBottom:16,maxHeight:200}}>
                      <img className="my-business-banner-img" src={getImgUrl(form.bannerUrl)} alt="Banner" style={{width:'100%',height:200,objectFit:'cover'}}/>
                    </div>
                  )}
                  <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:12}}>
                    Imagen de fondo del encabezado de tu pagina. Recomendado: 1200x400px o mas ancho.
                  </p>
                  <div style={{display:'flex',gap:8}}>
                    <button type="button" className="btn-primary" onClick={()=>bannerRef.current.click()} disabled={uploadingBanner}>
                      <Upload size={14}/> {uploadingBanner ? 'Subiendo...' : 'Subir banner'}
                    </button>
                    {form.bannerUrl && (
                      <button type="button" className="btn-danger" onClick={()=>setForm(f=>({...f,bannerUrl:''}))}>
                        <Trash2 size={14}/> Eliminar
                      </button>
                    )}
                  </div>
                  <input ref={bannerRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleUploadImage(e.target.files[0],'bannerUrl',setUploadingBanner)}/>
                </div>

                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : '💾 Guardar cambios'}
                </button>
              </div>
            )}

            {/* TAB: Galeria */}
            {tab === 'gallery' && (
              <div className="card">
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:8,display:'flex',alignItems:'center',gap:8}}>
                  <Image size={18} style={{color:'var(--primary)'}}/> Galeria de imagenes
                </h3>
                <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:20}}>
                  Sube hasta 20 imagenes de tu negocio, trabajos realizados o instalaciones. Maximo 10MB por imagen.
                </p>
                <div style={{display:'flex',gap:8,marginBottom:20}}>
                  <button type="button" className="btn-primary" onClick={()=>galleryRef.current.click()} disabled={uploadingGallery}>
                    <Plus size={14}/> {uploadingGallery ? 'Subiendo...' : 'Agregar imagenes'}
                  </button>
                  <input ref={galleryRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>handleGalleryUpload(e.target.files)}/>
                </div>
                {gallery.length === 0 ? (
                  <div style={{textAlign:'center',padding:'40px 20px',border:'2px dashed var(--border)',borderRadius:12,color:'var(--text-muted)'}}>
                    <div style={{fontSize:40,marginBottom:8}}>🖼️</div>
                    <p style={{margin:0}}>No hay imagenes en la galeria. Sube tus primeras fotos!</p>
                  </div>
                ) : (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12}}>
                    {gallery.map((img,i) => (
                      <div key={i} style={{position:'relative',aspectRatio:'1',borderRadius:10,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
                        <img src={getImgUrl(img)} alt={`Galeria ${i+1}`} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        <button type="button" onClick={()=>handleRemoveGalleryImage(img)}
                          style={{position:'absolute',top:6,right:6,background:'rgba(239,68,68,0.9)',border:'none',borderRadius:'50%',width:26,height:26,color:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Redes Sociales */}
            {tab === 'social' && (
              <div className="card">
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
                  <Share2 size={18} style={{color:'var(--primary)'}}/> Redes sociales y contacto
                </h3>

                {business?.isBranch && (
                  <div className="form-group" style={{ marginBottom: 24, background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
                      <input 
                        type="checkbox" 
                        checked={form.useParentWhatsApp} 
                        onChange={e => setForm({ ...form, useParentWhatsApp: e.target.checked })}
                        style={{ width: 20, height: 20 }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>Usar WhatsApp del negocio principal</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                          Si esta activo, los recordatorios y notificaciones se enviaran desde el numero del negocio principal.
                        </div>
                      </div>
                    </label>
                  </div>
                )}

                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  {[
                    {field:'whatsapp',  icon:'📱', label:'WhatsApp',  placeholder:'+57 300 000 0000', hint:'Numero con codigo de pais. Aparece como boton flotante en tu pagina.', disabled: business?.isBranch && form.useParentWhatsApp},
                    {field:'whatsappCatalog', icon:'🛍️', label:'Catálogo de WhatsApp', placeholder:'https://wa.me/c/573000000000', hint:'Enlace directo a tu catálogo de productos en WhatsApp.'},
                    {field:'instagram', icon:'📸', label:'Instagram', placeholder:'@tunegocio o https://instagram.com/tunegocio'},
                    {field:'facebook',  icon:'👤', label:'Facebook',  placeholder:'https://facebook.com/tunegocio'},
                    {field:'tiktok',    icon:'🎵', label:'TikTok',    placeholder:'@tunegocio'},
                    {field:'twitter',   icon:'🐦', label:'Twitter/X', placeholder:'@tunegocio'},
                    {field:'pinterest', icon:'📌', label:'Pinterest', placeholder:'https://pinterest.com/tunegocio'},
                    {field:'youtube',   icon:'▶️', label:'YouTube',   placeholder:'https://youtube.com/@tunegocio'},
                    {field:'website',   icon:'🌐', label:'Sitio web', placeholder:'https://tunegocio.com'},
                  ].map(({field,icon,label,placeholder,hint,disabled}) => (
                    <div key={field} className="form-group" style={{ opacity: disabled ? 0.6 : 1 }}>
                      <label style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{fontSize:16}}>{icon}</span> {label}
                      </label>
                      <input 
                        type="text" 
                        value={disabled ? (business?.ParentBusiness?.whatsapp || 'Usando WhatsApp del principal') : (form[field]||'')} 
                        onChange={e=>setForm({...form,[field]:e.target.value})} 
                        placeholder={placeholder}
                        disabled={disabled}
                        style={{ cursor: disabled ? 'not-allowed' : 'text' }}
                      />
                      {hint && <small style={{color:'var(--text-muted)'}}>{hint}</small>}
                      
                      {/* Alerta de reconexión para WhatsApp */}
                      {field === 'whatsapp' && showWhatsAppReconnect && (
                        <div style={{ marginTop: 12, padding: 12, background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 8 }}>
                          <div style={{ fontSize: 13, color: '#92400e', marginBottom: 8 }}>
                            <strong>⚠️ WhatsApp cambiado:</strong> Debes reconectar la sesión con el nuevo número.
                          </div>
                          <button
                            type="button"
                            onClick={handleReconnectWhatsApp}
                            style={{ 
                              padding: '8px 16px', 
                              background: '#f59e0b', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: 6, 
                              fontSize: 13,
                              cursor: 'pointer'
                            }}
                          >
                            🔓 Cerrar sesión actual y reconectar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button type="submit" className="btn-primary" style={{marginTop:16}} disabled={saving}>
                  {saving ? 'Guardando...' : '💾 Guardar redes sociales'}
                </button>
              </div>
            )}

            {/* TAB: Metodos de Pago */}
            {tab === 'payments' && (
              <div className="card">
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
                  <CreditCard size={18} style={{color:'var(--primary)'}}/> Metodos de pago
                </h3>
                
                <div className="form-group" style={{ marginBottom: 24, background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={form.showPaymentMethods} 
                      onChange={e => setForm({ ...form, showPaymentMethods: e.target.checked })}
                      style={{ width: 20, height: 20 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>Mostrar metodos de pago en la pagina</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                        Activa esta opcion para mostrar tus metodos de pago en la landing page.
                      </div>
                    </div>
                  </label>
                </div>

                {form.showPaymentMethods && (
                  <div style={{display:'flex',flexDirection:'column',gap:16}}>
                    {(!paymentMethods || paymentMethods.length === 0) && (
                      <p style={{color:'var(--text-muted)',fontSize:13,textAlign:'center',padding:'20px 0'}}>
                        No tienes metodos de pago configurados. Agrega uno nuevo.
                      </p>
                    )}
                    
                    {paymentMethods.map((method, index) => (
                      <div key={index} style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:12,alignItems:'end',padding:16,background:'var(--bg-secondary)',borderRadius:12,border:'1px solid var(--border)'}}>
                        <div className="form-group" style={{margin:0}}>
                          <label style={{fontSize:12,fontWeight:600,color:'var(--text-muted)'}}>Nombre</label>
                          <input 
                            type="text" 
                            value={method.name || ''} 
                            onChange={e => {
                              const newMethods = [...paymentMethods];
                              newMethods[index] = { ...method, name: e.target.value };
                              setPaymentMethods(newMethods);
                            }}
                            placeholder="Nequi, Daviplata, Bancolombia..."
                          />
                        </div>
                        <div className="form-group" style={{margin:0}}>
                          <label style={{fontSize:12,fontWeight:600,color:'var(--text-muted)'}}>Numero / Cuenta</label>
                          <input 
                            type="text" 
                            value={method.number || ''} 
                            onChange={e => {
                              const newMethods = [...paymentMethods];
                              newMethods[index] = { ...method, number: e.target.value };
                              setPaymentMethods(newMethods);
                            }}
                            placeholder="31245557521"
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setPaymentMethods(paymentMethods.filter((_, i) => i !== index))}
                          style={{padding:'8px 12px',background:'#ef4444',color:'white',border:'none',borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
                          title="Eliminar"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    ))}
                    
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => setPaymentMethods([...paymentMethods, { name: '', number: '' }])}
                      style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}
                    >
                      <Plus size={16}/> Agregar metodo de pago
                    </button>
                  </div>
                )}
                
                <button type="submit" className="btn-primary" style={{marginTop:24}} disabled={saving}>
                  {saving ? 'Guardando...' : '💾 Guardar metodos de pago'}
                </button>
              </div>
            )}

            {/* TAB: Mision y Vision */}
            {tab === 'mission-vision' && (
              <div className="card">
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
                  <Store size={18} style={{color:'var(--primary)'}}/> Mision y Vision
                </h3>
                
                <div className="form-group" style={{ marginBottom: 24, background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={form.showMissionVision} 
                      onChange={e => setForm({ ...form, showMissionVision: e.target.checked })}
                      style={{ width: 20, height: 20 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>Mostrar Mision y Vision en la pagina</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                        Activa esta opcion para mostrar tu mision y vision en la landing page.
                      </div>
                    </div>
                  </label>
                </div>

                {form.showMissionVision && (
                  <div style={{display:'flex',flexDirection:'column',gap:16}}>
                    <div className="form-group">
                      <label style={{fontSize:12,fontWeight:600,color:'var(--text-muted)'}}>Mision</label>
                      <textarea
                        value={form.mission || ''} 
                        onChange={e => setForm({ ...form, mission: e.target.value })}
                        placeholder="Describe la mision de tu empresa..."
                        rows={4}
                        style={{width:'100%',padding:12,borderRadius:8,border:'1px solid var(--border)',resize:'vertical'}}
                      />
                      <p style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>
                        Cual es el proposito de tu empresa? Que te motiva a ofrecer tus servicios?
                      </p>
                    </div>

                    <div className="form-group">
                      <label style={{fontSize:12,fontWeight:600,color:'var(--text-muted)'}}>Vision</label>
                      <textarea
                        value={form.vision || ''} 
                        onChange={e => setForm({ ...form, vision: e.target.value })}
                        placeholder="Describe la vision de tu empresa..."
                        rows={4}
                        style={{width:'100%',padding:12,borderRadius:8,border:'1px solid var(--border)',resize:'vertical'}}
                      />
                      <p style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>
                        Hacia donde quieres llevar tu empresa? Que aspiras lograr a largo plazo?
                      </p>
                    </div>
                  </div>
                )}
                
                <button type="submit" className="btn-primary" style={{marginTop:24}} disabled={saving}>
                  {saving ? 'Guardando...' : '💾 Guardar Mision y Vision'}
                </button>
              </div>
            )}

            {/* TAB: Diseno */}
            {tab === 'design' && (
              <div className="card">
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
                  <Palette size={18} style={{color:'var(--primary)'}}/> Colores y diseno
                </h3>
                <div className="my-business-design-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
                  <div className="form-group">
                    <label>Color primario</label>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <input type="color" value={form.primaryColor||'#667eea'} onChange={e=>setForm({...form,primaryColor:e.target.value})}
                        style={{width:48,height:40,padding:2,border:'1px solid var(--border)',borderRadius:8,cursor:'pointer'}}/>
                      <input type="text" value={form.primaryColor||'#667eea'} onChange={e=>setForm({...form,primaryColor:e.target.value})}
                        style={{flex:1,fontFamily:'monospace'}} placeholder="#667eea"/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Color secundario</label>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <input type="color" value={form.secondaryColor||'#764ba2'} onChange={e=>setForm({...form,secondaryColor:e.target.value})}
                        style={{width:48,height:40,padding:2,border:'1px solid var(--border)',borderRadius:8,cursor:'pointer'}}/>
                      <input type="text" value={form.secondaryColor||'#764ba2'} onChange={e=>setForm({...form,secondaryColor:e.target.value})}
                        style={{flex:1,fontFamily:'monospace'}} placeholder="#764ba2"/>
                    </div>
                  </div>
                </div>
                {/* Preview */}
                <div style={{borderRadius:16,overflow:'hidden',marginBottom:20,boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>
                  <div style={{background:previewGradient,padding:'32px 24px',textAlign:'center',color:'white'}}>
                    <div style={{width:60,height:60,borderRadius:'50%',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 12px'}}>🏪</div>
                    <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>Vista previa</div>
                    <div style={{fontSize:13,opacity:0.85}}>{form.tagline || 'Tu slogan aqui'}</div>
                  </div>
                  <div style={{background:'white',padding:'16px 24px',display:'flex',justifyContent:'center'}}>
                    <button style={{background:previewGradient,color:'white',border:'none',borderRadius:10,padding:'10px 28px',fontWeight:700,cursor:'default'}}>
                      {form.ctaText || 'Reservar cita ahora'}
                    </button>
                  </div>
                </div>
                {/* Presets */}
                <div style={{marginBottom:20}}>
                  <label style={{fontSize:13,fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:10}}>Paletas predefinidas</label>
                  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                    {[
                      {name:'Violeta',  p:'#667eea',s:'#764ba2'},
                      {name:'Esmeralda',p:'#11998e',s:'#38ef7d'},
                      {name:'Coral',    p:'#f093fb',s:'#f5576c'},
                      {name:'Dorado',   p:'#f7971e',s:'#ffd200'},
                      {name:'Oceano',   p:'#2193b0',s:'#6dd5ed'},
                      {name:'Noche',    p:'#1a1a2e',s:'#16213e'},
                      {name:'Rosa',     p:'#ee0979',s:'#ff6a00'},
                      {name:'Verde',    p:'#134e5e',s:'#71b280'},
                    ].map(preset => (
                      <button key={preset.name} type="button"
                        onClick={()=>setForm(f=>({...f,primaryColor:preset.p,secondaryColor:preset.s}))}
                        style={{border:'2px solid transparent',borderRadius:10,padding:'6px 14px',cursor:'pointer',fontSize:12,fontWeight:600,color:'white',
                          background:`linear-gradient(135deg,${preset.p},${preset.s})`,
                          outline:(form.primaryColor===preset.p)?'3px solid #667eea':'none',
                        }}>
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : '💾 Guardar diseno'}
                </button>
              </div>
            )}

            {/* TAB: Horarios */}
            {tab === 'hours' && (
              <div className="card">
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:8,display:'flex',alignItems:'center',gap:8}}>
                  <Clock size={18} style={{color:'var(--primary)'}}/> Horario de atencion
                </h3>
                <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:16}}>
                  Este texto aparece en el footer de tu pagina publica. Puedes escribirlo libremente.
                </p>
                <br/>
                <div className="form-group">
                  <label>Horario (texto libre)</label>
                  <textarea value={form.businessHours} onChange={e=>setForm({...form,businessHours:e.target.value})} rows={4}
                    placeholder="Lun-Vie: 9am - 7pm&#10;Sabado: 9am - 5pm&#10;Domingo: Cerrado"/>
                </div>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : '💾 Guardar horario'}
                </button>
              </div>
            )}

            {/* TAB: Modulos */}
            {tab === 'modules' && (
              <div className="card">
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
                  <Store size={18} style={{color:'var(--primary)'}}/> Modulos Opcionales
                </h3>
                <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:20}}>
                  Activa o desactiva los modulos adicionales segun las necesidades de tu negocio.
                </p>

                <div style={{display:'flex',flexDirection:'column',gap:16}}>
                  {/* Gastos */}
                  <div style={{
                    display:'flex',alignItems:'center',justifyContent:'space-between',
                    padding:16,background:'var(--bg-secondary)',borderRadius:12,
                    border:'1px solid var(--border)'
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{
                        width:44,height:44,borderRadius:10,background:'#fef2f2',
                        display:'flex',alignItems:'center',justifyContent:'center'
                      }}>
                        <span style={{fontSize:20}}>📉</span>
                      </div>
                      <div>
                        <div style={{fontWeight:700,fontSize:15}}>Gastos / Egresos</div>
                        <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>
                          Registra arriendo, servicios, insumos, nomina y otros gastos
                        </div>
                      </div>
                    </div>
                    <label style={{
                      position:'relative',display:'inline-block',width:50,height:26,
                      cursor:'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={form.enabledModules?.expenses || false}
                        onChange={(e) => setForm({
                          ...form,
                          enabledModules: {...form.enabledModules, expenses: e.target.checked}
                        })}
                        style={{opacity:0,width:0,height:0}}
                      />
                      <span style={{
                        position:'absolute',cursor:'pointer',top:0,left:0,right:0,bottom:0,
                        backgroundColor: form.enabledModules?.expenses ? '#10b981' : '#d1d5db',
                        borderRadius:26,transition:'0.4s'
                      }}/>
                      <span style={{
                        position:'absolute',content:'""',height:20,width:20,left:3,bottom:3,
                        backgroundColor:'white',borderRadius:'50%',transition:'0.4s',
                        transform: form.enabledModules?.expenses ? 'translateX(24px)' : 'translateX(0)'
                      }}/>
                    </label>
                  </div>

                  {/* Insumos */}
                  <div style={{
                    display:'flex',alignItems:'center',justifyContent:'space-between',
                    padding:16,background:'var(--bg-secondary)',borderRadius:12,
                    border:'1px solid var(--border)'
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{
                        width:44,height:44,borderRadius:10,background:'#eff6ff',
                        display:'flex',alignItems:'center',justifyContent:'center'
                      }}>
                        <span style={{fontSize:20}}>📦</span>
                      </div>
                      <div>
                        <div style={{fontWeight:700,fontSize:15}}>Control de Insumos</div>
                        <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>
                          Gestiona materiales, stock y registro de consumo (no es para ventas)
                        </div>
                      </div>
                    </div>
                    <label style={{
                      position:'relative',display:'inline-block',width:50,height:26,
                      cursor:'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={form.enabledModules?.inventory || false}
                        onChange={(e) => setForm({
                          ...form,
                          enabledModules: {...form.enabledModules, inventory: e.target.checked}
                        })}
                        style={{opacity:0,width:0,height:0}}
                      />
                      <span style={{
                        position:'absolute',cursor:'pointer',top:0,left:0,right:0,bottom:0,
                        backgroundColor: form.enabledModules?.inventory ? '#10b981' : '#d1d5db',
                        borderRadius:26,transition:'0.4s'
                      }}/>
                      <span style={{
                        position:'absolute',content:'""',height:20,width:20,left:3,bottom:3,
                        backgroundColor:'white',borderRadius:'50%',transition:'0.4s',
                        transform: form.enabledModules?.inventory ? 'translateX(24px)' : 'translateX(0)'
                      }}/>
                    </label>
                  </div>

                  {/* Depositos / Anticipos */}
                  <div style={{
                    padding:16,background:'var(--bg-secondary)',borderRadius:12,
                    border:'1px solid var(--border)'
                  }}>
                    {/* Header del módulo */}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom: form.enabledModules?.deposits ? 16 : 0}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{
                          width:44,height:44,borderRadius:10,background:'#fff7ed',
                          display:'flex',alignItems:'center',justifyContent:'center'
                        }}>
                          <span style={{fontSize:20}}>🏦</span>
                        </div>
                        <div>
                          <div style={{fontWeight:700,fontSize:15}}>Depositos / Anticipos</div>
                          <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>
                            Gestiona anticipos de clientes para reducir citas fantasma
                          </div>
                        </div>
                      </div>
                      <label style={{
                        position:'relative',display:'inline-block',width:50,height:26,
                        cursor:'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={form.enabledModules?.deposits || false}
                          onChange={(e) => setForm({
                            ...form,
                            enabledModules: {...form.enabledModules, deposits: e.target.checked}
                          })}
                          style={{opacity:0,width:0,height:0}}
                        />
                        <span style={{
                          position:'absolute',cursor:'pointer',top:0,left:0,right:0,bottom:0,
                          backgroundColor: form.enabledModules?.deposits ? '#10b981' : '#d1d5db',
                          borderRadius:26,transition:'0.4s'
                        }}/>
                        <span style={{
                          position:'absolute',content:'""',height:20,width:20,left:3,bottom:3,
                          backgroundColor:'white',borderRadius:'50%',transition:'0.4s',
                          transform: form.enabledModules?.deposits ? 'translateX(24px)' : 'translateX(0)'
                        }}/>
                      </label>
                    </div>

                    {/* Configuración de anticipos (solo si está habilitado) */}
                    {form.enabledModules?.deposits && (
                      <div style={{borderTop:'1px solid var(--border)',paddingTop:16}}>
                        <div style={{fontWeight:600,fontSize:14,marginBottom:12,color:'var(--primary)'}}>
                          ⚙️ Configuración de Anticipos
                        </div>

                        {/* Anticipo obligatorio */}
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                          <label style={{fontSize:13,fontWeight:500}}>
                            🔒 Anticipo obligatorio para agendar
                          </label>
                          <input
                            type="checkbox"
                            checked={form.depositConfig?.required || false}
                            onChange={(e) => setForm({
                              ...form,
                              depositConfig: {...(form.depositConfig || {}), required: e.target.checked}
                            })}
                            style={{width:18,height:18,cursor:'pointer'}}
                          />
                        </div>

                        {/* Monto del anticipo */}
                        <div style={{display:'flex',gap:12,marginBottom:12}}>
                          <div style={{flex:1}}>
                            <label style={{display:'block',fontSize:12,color:'var(--text-muted)',marginBottom:4}}>
                              💰 Monto fijo ($)
                            </label>
                            <input
                              type="number"
                              value={form.depositConfig?.amount || 0}
                              onChange={(e) => setForm({
                                ...form,
                                depositConfig: {...(form.depositConfig || {}), amount: parseInt(e.target.value) || 0}
                              })}
                              placeholder="Ej: 20000"
                              style={{
                                width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',
                                fontSize:13,background:'var(--bg)',color:'var(--text)'
                              }}
                            />
                          </div>
                          <div style={{flex:1}}>
                            <label style={{display:'block',fontSize:12,color:'var(--text-muted)',marginBottom:4}}>
                              📊 O porcentaje (%)
                            </label>
                            <input
                              type="number"
                              value={form.depositConfig?.percentage ?? 30}
                              onChange={(e) => setForm({
                                ...form,
                                depositConfig: {...(form.depositConfig || {}), percentage: parseInt(e.target.value) ?? 30}
                              })}
                              placeholder="Ej: 30"
                              min="0"
                              max="100"
                              style={{
                                width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',
                                fontSize:13,background:'var(--bg)',color:'var(--text)'
                              }}
                            />
                          </div>
                        </div>
                        <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:16,marginTop:-8}}>
                          💡 Si dejas el monto en $0, se calculará el porcentaje sobre el precio del servicio
                        </div>

                        {/* Horas para cancelar */}
                        <div style={{marginBottom:12}}>
                          <label style={{display:'block',fontSize:12,color:'var(--text-muted)',marginBottom:4}}>
                            ⏰ Horas antes para cancelar sin penalidad
                          </label>
                          <input
                            type="number"
                            value={form.depositConfig?.cancelationHours || 24}
                            onChange={(e) => setForm({
                              ...form,
                              depositConfig: {...(form.depositConfig || {}), cancelationHours: parseInt(e.target.value) || 0}
                            })}
                            placeholder="Ej: 24"
                            style={{
                              width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',
                              fontSize:13,background:'var(--bg)',color:'var(--text)'
                            }}
                          />
                        </div>

                        {/* Penalidad habilitada */}
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                          <label style={{fontSize:13,fontWeight:500}}>
                            ⚠️ Penalidad por no asistir / cancelar tarde
                          </label>
                          <input
                            type="checkbox"
                            checked={form.depositConfig?.penaltyEnabled !== false}
                            onChange={(e) => setForm({
                              ...form,
                              depositConfig: {...(form.depositConfig || {}), penaltyEnabled: e.target.checked}
                            })}
                            style={{width:18,height:18,cursor:'pointer'}}
                          />
                        </div>

                        {/* Texto de términos */}
                        <div style={{marginBottom:8}}>
                          <label style={{display:'block',fontSize:12,color:'var(--text-muted)',marginBottom:4}}>
                            📝 Términos y condiciones (que verá el cliente)
                          </label>
                          <textarea
                            value={form.depositConfig?.termsText || 'El anticipo garantiza tu cita. Si cancelas con menos de 24 horas de anticipo o no asistes, el anticipo será retenido como penalidad.'}
                            onChange={(e) => setForm({
                              ...form,
                              depositConfig: {...(form.depositConfig || {}), termsText: e.target.value}
                            })}
                            rows={3}
                            style={{
                              width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',
                              fontSize:13,background:'var(--bg)',color:'var(--text)',resize:'vertical'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={saving} style={{marginTop:24}}>
                  {saving ? 'Guardando...' : '💾 Guardar configuracion'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Panel lateral */}
        <div className="my-business-sidebar" style={{display:'flex',flexDirection:'column',gap:16,minWidth:0}}>
          {/* Enlace publico */}
          {!Capacitor.isNativePlatform() && (
            <div className="card">
              <h3 style={{fontSize:15,fontWeight:700,marginBottom:12,display:'flex',alignItems:'center',gap:8}}>
                <Globe size={16} style={{color:'var(--primary)'}}/> Pagina publica
              </h3>
              {publicUrl ? (
                <>
                  <div style={{background:'var(--bg-secondary)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 14px',marginBottom:12,wordBreak:'break-all',fontSize:12,color:'var(--text-muted)',fontFamily:'monospace'}}>
                    {publicUrl}
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn-primary" style={{flex:1,fontSize:12}} onClick={()=>{navigator.clipboard.writeText(publicUrl);showToast('Enlace copiado');}}>
                      📋 Copiar
                    </button>
                    <a href={`/${business.slug}`} target="_blank" rel="noreferrer" style={{flex:1,textDecoration:'none'}}>
                      <button className="btn-secondary" style={{width:'100%',fontSize:12}}>
                        <Eye size={12}/> Ver
                      </button>
                    </a>
                  </div>
                </>
              ) : (
                <p style={{color:'var(--text-muted)',fontSize:13}}>Guarda el negocio para generar el enlace.</p>
              )}
            </div>
          )}

          {/* Suscripcion */}
          <div className="card" style={{borderLeft:`5px solid ${SUB_STATUS_COLORS[business?.subscriptionStatus||'pending']}`}}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:12}}>💳 Suscripcion</h3>
            <span className="badge" style={{background:SUB_STATUS_COLORS[business?.subscriptionStatus||'pending'],color:'white',padding:'5px 12px',fontSize:13}}>
              {SUB_STATUS_LABELS[business?.subscriptionStatus||'pending']}
            </span>
            {business?.status === 'blocked' && (
              <p style={{color:'#f56565',fontSize:12,fontWeight:700,marginTop:8}}>
                Tu negocio esta bloqueado. Sube tu comprobante para reactivarlo.
              </p>
            )}
            <div style={{background:'var(--bg-secondary)',padding:14,borderRadius:8,marginTop:12}}>
              <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:10}}>
                Envia el comprobante de pago mensual para mantener el servicio activo.
              </p>
              <button className="btn-secondary" style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:12}} onClick={()=>paymentRef.current.click()} disabled={paymentUploading}>
                <Upload size={12}/> {paymentUploading ? 'Enviando...' : 'Subir comprobante'}
              </button>
              <input ref={paymentRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePaymentUpload}/>
              {business?.paymentScreenshot && (
                <p style={{fontSize:11,color:'#48bb78',marginTop:8,textAlign:'center'}}>
                  Comprobante enviado recientemente.
                </p>
              )}
            </div>
          </div>

          {/* Vista previa mini */}
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <div style={{background:previewGradient,padding:'20px 16px',textAlign:'center',color:'white'}}>
              {form.logoUrl ? (
                <img src={getImgUrl(form.logoUrl)} alt="Logo" style={{width:56,height:56,borderRadius:'50%',objectFit:'cover',border:'2px solid rgba(255,255,255,0.8)',marginBottom:8}}/>
              ) : (
                <div style={{fontSize:28,marginBottom:8}}>🏪</div>
              )}
              <div style={{fontWeight:700,fontSize:14}}>{form.name || 'Tu negocio'}</div>
              {form.tagline && <div style={{fontSize:11,opacity:0.8,marginTop:2}}>{form.tagline}</div>}
            </div>
            <div style={{padding:'12px 16px',textAlign:'center',background:'white'}}>
              <span style={{fontSize:11,color:'var(--text-muted)'}}>Vista previa del encabezado</span>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.6)', 
            zIndex: 2000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: 20,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="card" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              maxWidth: 400, 
              width: '100%', 
              textAlign: 'center',
              padding: '32px 28px',
              borderRadius: 20,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              animation: 'modalSlideUp 0.3s ease'
            }}
          >
            <div 
              style={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 10px 25px rgba(245, 101, 101, 0.4)'
              }}
            >
              <Trash2 size={28} color="white" />
            </div>
            
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
              ¿Eliminar esta imagen?
            </h3>
            
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 28px 0', lineHeight: 1.5 }}>
              Esta acción no se puede deshacer. La imagen se eliminará permanentemente de tu galería.
            </p>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ flex: 1, padding: '12px 20px', borderRadius: 12, fontWeight: 600 }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                style={{ 
                  flex: 1, 
                  padding: '12px 20px', 
                  borderRadius: 12, 
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(245, 101, 101, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                onClick={confirmDeleteImage}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showBranchModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Nueva Sucursal</h3>
              <button 
                type="button" 
                onClick={() => setShowBranchModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleBranchSubmit}>
              <div className="form-group">
                <label>Nombre de la sucursal *</label>
                <input type="text" value={branchForm.name} onChange={e => setBranchForm({ ...branchForm, name: e.target.value })} required placeholder="Ej: Barbería El Rey - Sucursal Norte"/>
              </div>
              <div className="form-group">
                <label>Dirección *</label>
                <input type="text" value={branchForm.address} onChange={e => setBranchForm({ ...branchForm, address: e.target.value })} required placeholder="Calle..."/>
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="tel" value={branchForm.phone} onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })} placeholder="300..."/>
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={branchForm.isTechnicalServices} 
                    onChange={e => setBranchForm({ ...branchForm, isTechnicalServices: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Es empresa de servicios Especializados</span>
                </label>
              </div>

              <div className="form-group">
                <label>Comprobante de Pago (50% de descuento) *</label>
                <div style={{ 
                  border: '2px dashed var(--border)', borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer',
                  background: branchScreenshot ? '#f0fdf4' : 'transparent'
                }} onClick={() => branchPaymentRef.current.click()}>
                  {branchScreenshot ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#166534', fontWeight: 600 }}>
                      <CheckCircle size={20}/> Archivo seleccionado
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)' }}>
                      <Upload size={24} style={{ marginBottom: 8 }}/>
                      <div>Haz clic para subir el comprobante</div>
                    </div>
                  )}
                </div>
                <input ref={branchPaymentRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setBranchScreenshot(e.target.files[0])}/>
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowBranchModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={submittingBranch}>
                  {submittingBranch ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
