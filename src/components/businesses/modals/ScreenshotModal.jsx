import { X, Image, Check } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const BACKEND_URL = API_BASE_URL.replace(/\/api$/, '');

function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_URL}${cleanUrl}`;
}

export default function ScreenshotModal({ screenshot, business, onClose, onApprove }) {
  if (!screenshot) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: 500, maxHeight: '90vh', background: 'var(--surface)', 
          padding: 0, borderRadius: 16, overflow: 'hidden',
          display: 'flex', flexDirection: 'column'
        }}
      >
        <div style={{ 
          background: 'linear-gradient(135deg, #10b981, #059669)', 
          padding: '16px 20px', color: 'white', display: 'flex', 
          justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Image size={20} />
            <span style={{ fontWeight: 600 }}>Comprobante de Pago</span>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              color: 'white', background: 'rgba(255,255,255,0.2)', border: 'none', 
              borderRadius: 8, width: 32, height: 32, display: 'flex', 
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
            }}
          >
            <X size={18} />
          </button>
        </div>
        
        <div 
          style={{ padding: 20, overflow: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }} 
          className="hide-scrollbar"
        >
          <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
          <img 
            src={getImgUrl(screenshot)} 
            alt="Comprobante de Pago" 
            style={{ 
              width: '100%', maxHeight: '60vh', borderRadius: 8, objectFit: 'contain'
            }} 
          />
        </div>
        
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 12 }}>
          <button 
            className="btn-primary" 
            style={{ 
              flex: 1, background: 'var(--success)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 15, fontWeight: 700
            }} 
            onClick={() => onApprove(business?.id)}
          >
            <Check size={20} />
            Aprobar Pago (+30 días)
          </button>
          <button 
            className="btn-secondary" 
            style={{ flex: 1, padding: '12px', borderRadius: 8, fontWeight: 600 }} 
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
