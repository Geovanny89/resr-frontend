import { Trash2 } from 'lucide-react';

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeletingUsage,
  colors
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16
    }} onClick={onClose}>
      <div style={{
        background: colors.cardBg, borderRadius: 16, padding: 28,
        maxWidth: 380, width: '100%', textAlign: 'center'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Trash2 size={28} color="white" />
        </div>
        <h3 style={{ margin: '0 0 8px', fontSize: 18, color: colors.text }}>
          {isDeletingUsage ? '¿Eliminar consumo?' : '¿Eliminar insumo?'}
        </h3>
        <p style={{ margin: '0 0 20px', color: colors.textSecondary, fontSize: 14 }}>
          {isDeletingUsage ? 'El stock será restaurado automáticamente' : 'Esta acción no se puede deshacer'}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px', borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: 'none', color: colors.text,
              fontWeight: 600, cursor: 'pointer'
            }}
          >
            No, cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px', borderRadius: 10,
              border: 'none', background: '#ef4444', color: 'white',
              fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Trash2 size={16} />
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
