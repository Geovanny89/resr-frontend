import { Image, Plus, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { getImgUrl } from '../../hooks/useBusiness';

export default function GalleryTab({ 
  gallery, 
  uploadingGallery, 
  onGalleryUpload,
  onRemoveImage,
  maxImages = 20
}) {
  const galleryRef = useRef();

  return (
    <div className="card">
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:8,display:'flex',alignItems:'center',gap:8}}>
        <Image size={18} style={{color:'var(--primary)'}}/> Galería de imágenes
      </h3>
      <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:20}}>
        Sube hasta {maxImages} imágenes de tu negocio, trabajos realizados o instalaciones. Máximo 10MB por imagen.
      </p>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        <button type="button" className="btn-primary" onClick={()=>galleryRef.current.click()} disabled={uploadingGallery}>
          <Plus size={14}/> {uploadingGallery ? 'Subiendo...' : 'Agregar imágenes'}
        </button>
      </div>
      <input ref={galleryRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>onGalleryUpload(e.target.files)}/>
      
      {gallery.length === 0 ? (
        <div style={{textAlign:'center',padding:'40px 20px',border:'2px dashed var(--border)',borderRadius:12,color:'var(--text-muted)'}}>
          <div style={{fontSize:40,marginBottom:8}}>🖼️</div>
          <p style={{margin:0}}>No hay imágenes en la galería. ¡Sube tus primeras fotos!</p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12}}>
          {gallery.map((img,i) => (
            <div key={i} style={{position:'relative',aspectRatio:'1',borderRadius:10,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
              <img src={getImgUrl(img)} alt={`Galería ${i+1}`} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              <button type="button" onClick={()=>onRemoveImage(img)}
                style={{position:'absolute',top:6,right:6,background:'rgba(239,68,68,0.9)',border:'none',borderRadius:'50%',width:26,height:26,color:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>
                <Trash2 size={12}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
