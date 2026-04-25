import { useTheme } from '../../../context/ThemeContext';

export function Footer({ setModalOpen }) {
  const { colors } = useTheme();

  return (
    <footer style={{ background: colors.bgSecondary || colors.bg, borderTop: `1px solid ${colors.border}`, padding: '60px 24px 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32, marginBottom: 48 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <img src="/kdice.png" alt="K" style={{ width: 32, height: 32, borderRadius: '8px' }} />
            <div style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>KDice</div>
          </div>
          <p style={{ color: colors.textSecondary, lineHeight: 1.6, fontSize: 14 }}>
            La plataforma definitiva para la gestión de citas y fidelización de clientes en negocios de servicios.
          </p>
        </div>

        <div>
          <h4 style={{ fontWeight: 700, marginBottom: 16, color: colors.text, fontSize: 15 }}>Producto</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="#features" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: 14 }}>Características</a>
            <a href="#pricing" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: 14 }}>Precios</a>
            <a href="#demo" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: 14 }}>Demo</a>
          </div>
        </div>

        <div>
          <h4 style={{ fontWeight: 700, marginBottom: 16, color: colors.text, fontSize: 15 }}>Legal</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => setModalOpen('privacy')} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', color: colors.textSecondary, cursor: 'pointer', fontSize: 14 }}>Privacidad</button>
            <button onClick={() => setModalOpen('terms')} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', color: colors.textSecondary, cursor: 'pointer', fontSize: 14 }}>Términos</button>
          </div>
        </div>

        <div>
          <h4 style={{ fontWeight: 700, marginBottom: 16, color: colors.text, fontSize: 15 }}>Contacto</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="https://wa.me/573125205513" target="_blank" rel="noreferrer" style={{ color: '#25d366', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>WhatsApp</a>
            <span style={{ color: colors.textSecondary, fontSize: 14 }}>soporte@k-dice.com</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 24, borderTop: `1px solid ${colors.border}`, textAlign: 'center', color: colors.textTertiary, fontSize: 13 }}>
        © {new Date().getFullYear()} KDice. Todos los derechos reservados. Hecho con ❤️ en Colombia.
      </div>
    </footer>
  );
}
