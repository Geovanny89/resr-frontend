import { Trash2 } from 'lucide-react';

export default function DeleteImageModal({ 
  show, 
  onCancel, 
  onConfirm 
}) {
  if (!show) return null;

  return (
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
      onClick={onCancel}
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
            onClick={onCancel}
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
            onClick={onConfirm}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
