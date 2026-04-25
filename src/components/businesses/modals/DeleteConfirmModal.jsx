import { X, Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({ business, onClose, onConfirm, saving }) {
  if (!business) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: 420 }}
      >
        <div className="modal-header" style={{ borderBottomColor: 'var(--danger)' }}>
          <div className="modal-title" style={{ color: 'var(--danger)' }}>⚠️ Eliminar negocio</div>
          <button className="btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            ¿Estás seguro de eliminar el negocio <strong>"{business.name}"</strong>?<br/><br/>
            Esta acción no se puede deshacer y eliminará todos los datos asociados (citas, servicios, empleados).
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn-danger" 
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? 'Eliminando...' : <><Trash2 size={14} /> Eliminar</>}
          </button>
        </div>
      </div>
    </div>
  );
}
