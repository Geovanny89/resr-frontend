import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: colors.bgTertiary,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        padding: '8px 12px',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 16,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}
      onMouseEnter={e => {
        e.target.style.background = colors.bgSecondary;
      }}
      onMouseLeave={e => {
        e.target.style.background = colors.bgTertiary;
      }}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
