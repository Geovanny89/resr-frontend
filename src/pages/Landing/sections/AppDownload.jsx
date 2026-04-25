import { useTheme } from '../../../context/ThemeContext';

export function AppDownload() {
  const { isDark, colors } = useTheme();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/apk/kdice-reservas.apk';
    link.download = 'kdice-reservas.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="app" style={{ padding: '80px 24px', background: isDark ? colors.bgSecondary : '#f8fafc' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginBottom: 16, color: colors.text }}>
          📱 Lleva KDice en tu bolsillo
        </h2>
        <p style={{ fontSize: 18, color: colors.textSecondary, marginBottom: 40, maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.6 }}>
          Descarga nuestra aplicación móvil para Android y gestiona tu negocio desde cualquier lugar. Tus citas, empleados y reportes siempre a mano.
        </p>

        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownload}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              background: '#10b981', color: 'white',
              padding: '16px 32px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 600, fontSize: 16,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              transition: 'transform 0.2s',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0225 3.503C15.5902 8.479 13.853 8.1432 12 8.1432c-1.853 0-3.5906.3358-5.1368.8969L4.8406 5.5369a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589.3432 18.6617h23.3136c0-4.0028-2.3457-7.475-5.775-9.3403"/>
            </svg>
            Descargar APK Android
          </button>
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ background: isDark ? colors.border : '#e2e8f0', padding: '6px 12px', borderRadius: 20, fontSize: 13, color: colors.textSecondary }}>
            ✅ Gestión de citas
          </span>
          <span style={{ background: isDark ? colors.border : '#e2e8f0', padding: '6px 12px', borderRadius: 20, fontSize: 13, color: colors.textSecondary }}>
            ✅ Notificaciones push
          </span>
          <span style={{ background: isDark ? colors.border : '#e2e8f0', padding: '6px 12px', borderRadius: 20, fontSize: 13, color: colors.textSecondary }}>
            ✅ Reportes en tiempo real
          </span>
        </div>
      </div>
    </section>
  );
}
