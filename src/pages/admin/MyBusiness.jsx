import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import { Store, Globe, Image, Palette, Share2, Clock, Eye, Upload, Trash2, Plus } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

const BASE_URL = (api.defaults.baseURL || '').replace('/api', '');
function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
}

const SUB_STATUS_COLORS  = { pending: '#f6ad55', paid: '#48bb78', overdue: '#f56565' };
const SUB_STATUS_LABELS  = { pending: 'Pendiente', paid: 'Al dia', overdue: 'Vencido' };

const TABS = [
  { id: 'info',    icon: Store,   label: 'Informacion' },
  { id: 'media',   icon: Image,   label: 'Logo & Banner' },
  { id: 'gallery', icon: Image,   label: 'Galeria' },
  { id: 'social',  icon: Share2,  label: 'Redes Sociales' },
  { id: 'design',  icon: Palette, label: 'Diseno' },
  { id: 'hours',   icon: Clock,   label: 'Horarios' },
];

export default function MyBusiness() {
  const { business: ctxBiz, refreshBusiness } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('info');
  const [form, setForm] = useState({});
  const [gallery, setGallery] = useState([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [paymentUploading, setPaymentUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const logoRef    = useRef();
  const bannerRef  = useRef();
  const galleryRef = useRef();
  const paymentRef = useRef();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/businesses/my/business');
      const biz = res.data;
      setBusiness(biz);
      let gal = [];
      try { gal = JSON.parse(biz.gallery || '[]'); } catch(e) { gal = []; }
      setGallery(gal);
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
        whatsapp: biz.whatsapp || '',
        instagram: biz.instagram || '',
        facebook: biz.facebook || '',
        tiktok: biz.tiktok || '',
        twitter: biz.twitter || '',
        website: biz.website || '',
        primaryColor: biz.primaryColor || '#667eea',
        secondaryColor: biz.secondaryColor || '#764ba2',
        logoUrl: biz.logoUrl || '',
        bannerUrl: biz.bannerUrl || '',
      });
    } catch(e) {
      showToast('Error al cargar el negocio', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e && e.preventDefault();
    setSaving(true);
    try {
      await api.put('/businesses/my/business', { ...form, gallery: JSON.stringify(gallery) });
      if (refreshBusiness) await refreshBusiness();
      await load();
      showToast('Cambios guardados correctamente');
    } catch(e) {
      showToast(e.response?.data?.error || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
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

  const handleRemoveGalleryImage = async (url) => {
    if (!confirm('Eliminar esta imagen de la galeria?')) return;
    try {
      await api.delete('/upload/gallery/remove', { data: { url } });
      setGallery(g => g.filter(u => u !== url));
      showToast('Imagen eliminada');
    } catch(e) {
      showToast('Error al eliminar imagen', 'error');
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
              {TABS.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          {/* Tabs */}
          <div className="my-business-tabs" style={{display:'flex',gap:4,background:'var(--bg-secondary)',borderRadius:12,padding:4,marginBottom:24,flexWrap:'wrap'}}>
            {TABS.map(t => {
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
                </div>
                <button type="submit" className="btn-primary" style={{marginTop:16}} disabled={saving}>
                  {saving ? 'Guardando...' : '💾 Guardar cambios'}
                </button>
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
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  {[
                    {field:'whatsapp',  icon:'📱', label:'WhatsApp',  placeholder:'+57 300 000 0000', hint:'Numero con codigo de pais. Aparece como boton flotante en tu pagina.'},
                    {field:'instagram', icon:'📸', label:'Instagram', placeholder:'@tunegocio o https://instagram.com/tunegocio'},
                    {field:'facebook',  icon:'👤', label:'Facebook',  placeholder:'https://facebook.com/tunegocio'},
                    {field:'tiktok',    icon:'🎵', label:'TikTok',    placeholder:'@tunegocio'},
                    {field:'twitter',   icon:'🐦', label:'Twitter/X', placeholder:'@tunegocio'},
                    {field:'website',   icon:'🌐', label:'Sitio web', placeholder:'https://tunegocio.com'},
                  ].map(({field,icon,label,placeholder,hint}) => (
                    <div key={field} className="form-group">
                      <label style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{fontSize:16}}>{icon}</span> {label}
                      </label>
                      <input type="text" value={form[field]||''} onChange={e=>setForm({...form,[field]:e.target.value})} placeholder={placeholder}/>
                      {hint && <small style={{color:'var(--text-muted)'}}>{hint}</small>}
                    </div>
                  ))}
                </div>
                <button type="submit" className="btn-primary" style={{marginTop:16}} disabled={saving}>
                  {saving ? 'Guardando...' : '💾 Guardar redes sociales'}
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
                  Este texto aparece en el encabezado de tu pagina publica. Puedes escribirlo libremente.
                </p>
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
    </AdminLayout>
  );
}
