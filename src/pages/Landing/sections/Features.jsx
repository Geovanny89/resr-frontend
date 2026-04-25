import { useTheme } from '../../../context/ThemeContext';
import { features } from '../constants';

export function Features() {
  const { colors } = useTheme();

  return (
    <section id="features" style={{ padding: '120px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 80 }}>
        <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, marginBottom: 20, color: colors.text }}>
          Potencia tu productividad
        </h2>
        <p style={{ color: colors.textSecondary, fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
          Todo lo que necesitas para gestionar tu agenda y hacer crecer tu marca personal.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
        {features.map((f, i) => (
          <div key={i} className="feat-card">
            <div className="feat-icon-wrapper">{f.icon}</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14, color: colors.text }}>{f.title}</h3>
            <p style={{ fontSize: 16, color: colors.textSecondary, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
