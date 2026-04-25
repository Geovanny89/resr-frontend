import { useTheme } from '../../../context/ThemeContext';

export function VideoModal({ isOpen, onClose }) {
  const { colors } = useTheme();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20
    }} onClick={onClose}>
      <div style={{
        background: colors.cardBg, borderRadius: 24, padding: 0,
        maxWidth: 1000, width: '100%', maxHeight: '90vh',
        overflow: 'hidden', position: 'relative',
        border: `1px solid ${colors.border}`
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 24px', borderBottom: `1px solid ${colors.border}`
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: colors.text, margin: 0 }}>
            🎥 Demo de KDice
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: colors.textSecondary }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: 0, position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/52c3yUGOnDs?autoplay=1&rel=0"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none'
            }}
          ></iframe>
        </div>
      </div>
    </div>
  );
}
