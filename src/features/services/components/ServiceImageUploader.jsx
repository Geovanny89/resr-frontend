/**
 * Service image upload component with preview
 */
import { useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';

// URL base para imágenes
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BACKEND_URL = isLocal ? 'http://localhost:4000' : 'https://api-reservas.k-dice.com';

function getImgUrl(url, api) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const base = (api?.defaults?.baseURL && !api.defaults.baseURL.startsWith('/')) 
    ? api.defaults.baseURL.replace('/api', '') 
    : BACKEND_URL;
  return `${base}${cleanUrl}`;
}

export function ServiceImageUploader({ imageUrl, uploading, onImageChange, onClear, api }) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onClear?.();
  };

  return (
    <div style={{ marginBottom: 20, textAlign: 'center' }}>
      <div 
        onClick={handleClick}
        style={{
          width: '100%',
          height: 180,
          borderRadius: 16,
          border: '2px dashed var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          background: imageUrl ? 'none' : 'var(--bg-secondary)',
          transition: 'all 0.3s'
        }}
      >
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Subiendo...</span>
          </div>
        ) : imageUrl ? (
          <>
            <img 
              src={getImgUrl(imageUrl, api)} 
              alt="Servicio" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <div style={{ 
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s' 
            }} className="hover-overlay">
              <Camera color="white" size={32} />
            </div>
            <button 
              onClick={handleClear}
              style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: 4, cursor: 'pointer' }}
            >
              <X size={16} color="white" />
            </button>
          </>
        ) : (
          <>
            <Camera size={32} color="var(--text-muted)" style={{ marginBottom: 8 }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Foto del servicio</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>(Opcional)</span>
          </>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onImageChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />
    </div>
  );
}

export default ServiceImageUploader;
