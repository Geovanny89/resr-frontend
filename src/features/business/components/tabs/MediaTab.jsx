import { Image, Upload, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { getImgUrl } from '../../hooks/useBusiness';

export default function MediaTab({ 
  form, 
  onUpdateField, 
  onSubmit, 
  saving,
  uploadingLogo,
  uploadingBanner,
  onUploadLogo,
  onUploadBanner
}) {
  const logoRef = useRef();
  const bannerRef = useRef();

  return (
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
                <button type="button" className="btn-danger" onClick={()=>onUpdateField('logoUrl', '')}>
                  <Trash2 size={14}/> Eliminar
                </button>
              )}
            </div>
            <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e => onUploadLogo(e.target.files[0])}/>
          </div>
        </div>
        {form.logoUrl && (
          <div className="form-group" style={{marginTop:16}}>
            <label>URL del logo</label>
            <input type="text" value={form.logoUrl} onChange={e=>onUpdateField('logoUrl', e.target.value)} placeholder="https://... o /uploads/..."/>
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
          Imagen de fondo del encabezado de tu página. Recomendado: 1200x400px o más ancho.
        </p>
        <div style={{display:'flex',gap:8}}>
          <button type="button" className="btn-primary" onClick={()=>bannerRef.current.click()} disabled={uploadingBanner}>
            <Upload size={14}/> {uploadingBanner ? 'Subiendo...' : 'Subir banner'}
          </button>
          {form.bannerUrl && (
            <button type="button" className="btn-danger" onClick={()=>onUpdateField('bannerUrl', '')}>
              <Trash2 size={14}/> Eliminar
            </button>
          )}
        </div>
        <input ref={bannerRef} type="file" accept="image/*" style={{display:'none'}} onChange={e => onUploadBanner(e.target.files[0])}/>
      </div>

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Guardando...' : '💾 Guardar cambios'}
      </button>
    </div>
  );
}
