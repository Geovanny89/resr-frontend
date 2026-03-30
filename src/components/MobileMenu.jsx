import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

/**
 * Componente MobileMenu
 * Botón hamburguesa para dispositivos móviles y tablets (≤ 1024px)
 */
export default function MobileMenu({ isOpen, onToggle, onClose }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile && isOpen) onClose();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onClose]);

  if (!isMobile) return null;

  return (
    <button
      onClick={onToggle}
      style={{
        position: 'fixed',
        top: 14,
        left: 14,
        zIndex: 201,
        background: 'var(--primary)',
        color: 'white',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        padding: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow)',
        width: 36,
        height: 36,
      }}
      title={isOpen ? 'Cerrar menú' : 'Abrir menú'}
    >
      {isOpen ? <X size={18} /> : <Menu size={18} />}
    </button>
  );
}
