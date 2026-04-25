export function DeleteConfirmModal({ onConfirm, onCancel, colors }) {
  return (
    <div 
      className="modal-overlay" 
      onClick={onCancel}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20
      }}
    >
      <div 
        style={{
          background: 'var(--card-bg)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
          border: '1px solid var(--border)'
        }} 
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
          ¿Eliminar etiqueta?
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, textAlign: 'center' }}>
          Se removerá de todos los clientes. Esta acción no se puede deshacer.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={onCancel}
            style={{ 
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            style={{ 
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              background: '#ef4444',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
