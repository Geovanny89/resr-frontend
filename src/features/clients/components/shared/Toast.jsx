import { CheckCircle, XCircle } from 'lucide-react';

export function Toast({ message, type = 'success' }) {
  if (!message) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      padding: '12px 20px',
      borderRadius: 10,
      fontWeight: 600,
      fontSize: 14,
      background: type === 'error' ? '#fee2e2' : '#d1fae5',
      color: type === 'error' ? '#991b1b' : '#065f46',
      border: `1px solid ${type === 'error' ? '#fecaca' : '#a7f3d0'}`,
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      animation: 'fadeInDown 0.3s ease-out'
    }}>
      {type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
      {message}
    </div>
  );
}
