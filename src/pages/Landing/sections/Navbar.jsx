import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import ThemeToggle from '../../../components/ThemeToggle';
import { navLinks } from '../constants';

export function Navbar({ navHidden, navOpen, setNavOpen, setVideoModalOpen }) {
  const navigate = useNavigate();
  const { isDark, colors } = useTheme();

  const handleDemoClick = () => {
    setVideoModalOpen(true);
    setNavOpen(false);
  };

  return (
    <nav className="glass-nav" style={{
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: 80,
      transform: navHidden ? 'translateY(-100%)' : 'translateY(0)',
      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img
          src="/kdice.png"
          alt="KDice Logo"
          style={{ width: 45, height: 45, objectFit: 'contain', borderRadius: '12px' }}
        />
        <div style={{ fontSize: 24, fontWeight: 800, color: colors.text, letterSpacing: '-0.5px' }}>KDice</div>
      </div>

      {/* Desktop links */}
      <div className="nav-links-desktop" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {navLinks.map(l => (
          l.isDemo ? (
            <button key={l.label} onClick={() => setVideoModalOpen(true)} className="land-nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              {l.label}
            </button>
          ) : (
            <a key={l.href} href={l.href} className="land-nav-link">{l.label}</a>
          )
        ))}
        <div style={{ width: 1, height: 24, background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', margin: '0 12px' }}></div>

        <div style={{ marginRight: 8 }}>
          <ThemeToggle />
        </div>

        <button
          onClick={() => navigate('/login')}
          className="btn-primary"
          style={{ padding: '10px 24px', fontSize: 14, borderRadius: 10 }}
        >
          Entrar
        </button>
      </div>

      {/* Mobile hamburger */}
      <div className="nav-mobile" style={{ display: 'none' }}>
        <button
          onClick={() => setNavOpen(v => !v)}
          style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: 10, color: '#4a5568' }}
        >
          {navOpen ? '✕' : '☰'}
        </button>
        {navOpen && (
          <div className="nav-mobile-menu" style={{ background: colors.cardBg, borderBottom: `1px solid ${colors.border}` }}>
            {navLinks.map(l => (
              l.isDemo ? (
                <button key={l.label} onClick={handleDemoClick} className="land-nav-link" style={{ fontSize: 18, padding: '12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  {l.label}
                </button>
              ) : (
                <a key={l.href} href={l.href} className="land-nav-link" onClick={() => setNavOpen(false)} style={{ fontSize: 18, padding: '12px' }}>
                  {l.label}
                </a>
              )
            ))}
            <hr style={{ border: 'none', borderTop: `1px solid ${colors.border}`, margin: '12px 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
              <ThemeToggle />
            </div>

            <hr style={{ border: 'none', borderTop: `1px solid ${colors.border}`, margin: '12px 0' }} />
            <button
              onClick={() => { navigate('/login'); setNavOpen(false); }}
              style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#f8fafc', color: colors.text, border: `1px solid ${colors.border}`, borderRadius: 12, padding: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              Entrar
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
