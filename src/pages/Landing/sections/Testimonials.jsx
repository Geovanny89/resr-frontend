import { useTheme } from '../../../context/ThemeContext';
import { testimonials } from '../constants';

export function Testimonials() {
  const { isDark, colors } = useTheme();

  return (
    <section style={{ padding: '120px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <h2 style={{ fontSize: 'clamp(32px, 5vw, 40px)', fontWeight: 800, textAlign: 'center', marginBottom: 64, color: colors.text }}>
        Confiado por profesionales
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
        {testimonials.map((t, i) => (
          <div key={i} className="test-card">
            <div style={{ color: '#fbbf24', fontSize: 20, marginBottom: 16 }}>★★★★★</div>
            <p style={{ fontSize: 17, color: colors.text, marginBottom: 32, lineHeight: 1.7 }}>
              {t.text}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
              }}>{t.avatar}</div>
              <div>
                <div style={{ fontWeight: 700, color: colors.text, fontSize: 16 }}>{t.name}</div>
                <div style={{ fontSize: 14, color: colors.textSecondary }}>{t.business}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
