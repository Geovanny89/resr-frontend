import { useTheme } from '../../../context/ThemeContext';

export function Modal({ isOpen, onClose, title, children }) {
  const { colors } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
        overflow: 'hidden'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.cardBg,
          borderRadius: 16,
          padding: '24px 32px 32px',
          maxWidth: 600,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${colors.border}`
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 20,
            background: 'none',
            border: 'none',
            fontSize: 28,
            cursor: 'pointer',
            color: colors.textSecondary,
            zIndex: 10
          }}
        >
          ×
        </button>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: colors.text, paddingRight: 40 }}>
          {title}
        </h2>
        <div style={{ color: colors.textSecondary, lineHeight: 1.7, fontSize: 14 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
