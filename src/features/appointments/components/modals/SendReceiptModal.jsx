/**
 * Modal de confirmación para enviar comprobante de pago
 * Extraído de Appointments.jsx
 */
import { Mail } from 'lucide-react';

export function SendReceiptModal({
  isOpen,
  onClose,
  onConfirm,
  isSending,
  colors
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
    }} onClick={onClose}>
      <div style={{
        background: colors.cardBg, borderRadius: 16, padding: 24,
        maxWidth: 400, width: '100%', border: `1px solid ${colors.border}`
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Mail size={28} color="#0ea5e9" />
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, textAlign: 'center', color: colors.text }}>
          ¿Enviar comprobante de pago?
        </h3>
        
        <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24, textAlign: 'center' }}>
          Se enviará el comprobante por correo electrónico al cliente.
        </p>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={onClose} 
            style={{ 
              flex: 1, padding: 12, borderRadius: 10, 
              border: `1px solid ${colors.border}`, background: 'none', 
              fontWeight: 600, cursor: 'pointer', color: colors.text
            }}
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isSending}
            style={{ 
              flex: 1, padding: 12, borderRadius: 10, border: 'none',
              background: '#0ea5e9', color: 'white', fontWeight: 700,
              cursor: isSending ? 'not-allowed' : 'pointer', opacity: isSending ? 0.7 : 1
            }}
          >
            {isSending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SendReceiptModal;
