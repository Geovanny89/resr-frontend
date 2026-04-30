import { useState } from 'react';
import { X, Image, Check, Layers } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const BACKEND_URL = API_BASE_URL.replace(/\/api$/, '');

function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_URL}${cleanUrl}`;
}

export default function ScreenshotModal({ screenshot, business, onClose, onApprove }) {
  const [includeBranches, setIncludeBranches] = useState(false);
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
        
        <div style={{ padding: '0 20px 16px' }}>
          <label 
            style={{ 
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px', 
              borderRadius: 12, background: includeBranches ? '#ecfdf5' : 'var(--gray-50)',
              border: `1px solid ${includeBranches ? '#10b981' : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <input 
              type="checkbox" 
              checked={includeBranches}
              onChange={e => setIncludeBranches(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#10b981' }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: includeBranches ? '#059669' : 'var(--text)' }}>
                Modo Combo: Activar todas las sedes
              </div>
              <div style={{ fontSize: 11, color: includeBranches ? '#059669' : 'var(--text-muted)', opacity: 0.8 }}>
                Suma 30 días a todos los locales de {business?.name?.split(' ')[0]}
              </div>
            </div>
            <Layers size={20} style={{ marginLeft: 'auto', opacity: 0.5, color: includeBranches ? '#10b981' : 'inherit' }} />
          </label>
        </div>
        
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 12 }}>
          <button 
            className="btn-primary" 
            style={{ 
              flex: 1, background: includeBranches ? 'linear-gradient(to right, #10b981, #3b82f6)' : 'var(--success)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 15, fontWeight: 700, border: 'none', boxShadow: includeBranches ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
            }} 
            onClick={() => onApprove(business?.id, includeBranches)}
          >
            <Check size={20} />
            {includeBranches ? 'Aprobar Todo el Combo' : 'Aprobar Pago (+30 días)'}
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
