import { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  const navigate   = useNavigate();
  const { isDark, colors } = useTheme();
  const [demoSlug] = useState('demo-kdice');
  const [navOpen, setNavOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(null);
  const [navHidden, setNavHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide nav
        setNavHidden(true);
      } else {
        // Scrolling up - show nav
        setNavHidden(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const features = [
    { icon: '📅', title: 'Gestión de Citas',          desc: 'Sistema completo de reservas online con confirmación automática' },
    { icon: '📱', title: 'App Móvil Personalizada',    desc: 'APK única para tu negocio, descargable directamente' },
    { icon: '💬', title: 'Recordatorios Automáticos',  desc: 'Notificaciones por email 1 hora antes de cada cita' },
    { icon: '👥', title: 'Gestión de Empleados',       desc: 'Horarios, comisiones y disponibilidad en tiempo real' },
    { icon: '💰', title: 'Reportes y Pagos',           desc: 'Seguimiento de ingresos y comisiones por empleado' },
    { icon: '🎨', title: 'Branding Personalizado',     desc: 'Colores, logo y diseño según tu marca' },
  ];

  const plans = [
    {
      name: 'KDice POS Pro', 
      price: '$60,000', 
      period: 'COP/mes', 
      desc: 'Todo incluido para tu negocio', 
      color: '#667eea',
      popular: true,
      features: [
        '✅ Citas ilimitadas',
        '✅ Empleados ilimitados', 
        '✅ App móvil personalizada (APK)',
        '✅ Página web de reservas',
        '✅ Recordatorios automáticos por email',
        '✅ Reportes de ingresos y comisiones',
        '✅ Soporte prioritario',
        '✅ Personalización de marca (colores, logo)',
        '✅ Galería de fotos y horarios'
      ],
      cta: 'Comenzar Ahora',
    },
  ];

  const testimonials = [
    { name: 'María García',   business: 'Salón La Belleza', text: '"Aumentamos nuestras citas un 40% en el primer mes. Los clientes aman la app."', avatar: '👩‍💼' },
    { name: 'Carlos López',   business: 'Barbería Premium', text: '"El sistema de recordatorios redujo nuestras cancelaciones a la mitad."',           avatar: '👨‍💼' },
    { name: 'Ana Martínez',   business: 'Spa Relax',        text: '"Ahora mis empleados saben exactamente cuándo trabajan. Excelente herramienta."',   avatar: '👩‍🦱' },
  ];

  const navLinks = [
    { href: '#features', label: 'Características' },
    { href: '#pricing',  label: 'Planes' },
    { href: '#demo',     label: 'Demo' },
  ];

  return (
    <div style={{ 
      fontFamily: "'Inter', system-ui, sans-serif", 
      background: isDark ? colors.bg : '#ffffff', 
      color: colors.text, 
      overflowX: 'hidden',
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        :root {
          --primary: #6366f1;
          --primary-dark: #4f46e5;
          --secondary: #ec4899;
          --accent: #8b5cf6;
          --bg-main: ${isDark ? colors.bg : '#ffffff'};
          --bg-light: ${isDark ? colors.bgSecondary : '#f8fafc'};
          --card-bg: ${colors.cardBg};
          --text-main: ${colors.text};
          --text-muted: ${colors.textSecondary};
          --nav-bg: ${isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
          --border-color: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'};
        }

        * { box-sizing: border-box; scroll-behavior: smooth; }
        
        .glass-nav {
          background: var(--nav-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
        }

        .land-nav-link {
          text-decoration: none;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 15px;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .land-nav-link:hover {
          color: var(--primary);
          background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99, 102, 241, 0.05)'};
        }

        .hero-gradient {
          background: 
            radial-gradient(circle at 0% 0%, ${isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.15)'} 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, ${isDark ? 'rgba(236, 72, 153, 0.05)' : 'rgba(236, 72, 153, 0.1)'} 0%, transparent 50%),
            var(--bg-main);
          position: relative;
        }

        .hero-title {
          background: linear-gradient(135deg, ${isDark ? '#f8fafc' : '#1e293b'} 0%, #4f46e5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.1;
        }

        .feat-card {
          background: var(--card-bg);
          border-radius: 24px;
          padding: 40px;
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'};
          box-shadow: ${isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.05)'};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .feat-card:hover {
          transform: translateY(-8px);
          box-shadow: ${isDark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 20px 25px -5px rgba(0,0,0,0.1)'};
          border-color: rgba(99, 102, 241, 0.2);
        }

        .feat-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(99, 102, 241, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-bottom: 24px;
          color: var(--primary);
        }

        .plan-card {
          background: ${colors.cardBg};
          border-radius: 32px;
          padding: 48px;
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'};
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          position: relative;
          transition: all 0.3s ease;
        }
        .plan-card.popular {
          border: 2px solid var(--primary);
          box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.25);
          transform: scale(1.05);
          z-index: 10;
        }

        .badge-popular {
          position: absolute;
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
          color: white;
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .test-card {
          background: var(--bg-light);
          border-radius: 24px;
          padding: 32px;
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'};
          transition: all 0.3s ease;
        }
        .test-card:hover {
          background: ${colors.cardBg};
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px 32px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.4);
          filter: brightness(1.1);
        }

        .btn-secondary {
          background: ${isDark ? 'rgba(255,255,255,0.05)' : 'white'};
          color: ${colors.text};
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
          border-radius: 12px;
          padding: 16px 32px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-secondary:hover {
          background: ${isDark ? 'rgba(255,255,255,0.1)' : '#f8fafc'};
          border-color: ${isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'};
          transform: translateY(-2px);
        }

        .floating-anim {
          animation: floating 3s ease-in-out infinite;
        }
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @media(max-width:768px){
          .nav-links-desktop{display:none!important}
          .nav-mobile{display:block!important}
          .nav-mobile-menu{
            position:fixed;
            top:80px;
            left:0;
            right:0;
            background:${colors.cardBg};
            padding:24px;
            display:flex;
            flex-direction:column;
            gap:12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            z-index:200;
            border-bottom: 1px solid ${colors.border};
          }
          .plan-card.popular { transform: none; margin-top: 24px; }
          .hero-btns { flex-direction: column; }
          .btn-primary, .btn-secondary { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* Toggle de tema (público) - MOVED TO NAVBAR */}

      {/* ── NAVBAR ── */}
      <nav className="glass-nav" style={{
        padding: '0 24px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', position: 'sticky', top: 0, zIndex: 100,
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
            <a key={l.href} href={l.href} className="land-nav-link">{l.label}</a>
          ))}
          <div style={{ width: 1, height: 24, background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', margin: '0 12px' }}></div>
          
          {/* Theme Toggle in Nav */}
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
            <div className="nav-mobile-menu">
              {navLinks.map(l => (
                <a key={l.href} href={l.href} className="land-nav-link" onClick={() => setNavOpen(false)} style={{ fontSize: 18, padding: '12px' }}>
                  {l.label}
                </a>
              ))}
              <hr style={{ border: 'none', borderTop: `1px solid ${colors.border}`, margin: '12px 0' }} />
              
              {/* Dark Mode Toggle for Mobile */}
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

      {/* ── HERO ── */}
      <section className="hero-gradient" style={{ padding: '120px 24px 100px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative' }}>
          <div className="badge-popular" style={{ position: 'static', display: 'inline-block', transform: 'none', marginBottom: 24, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', boxShadow: 'none' }}>
            ✨ Gestión de citas
          </div>
          <h1 className="hero-title" style={{ fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: 800, marginBottom: 16, maxWidth: 900, margin: '0 auto 16px' }}>
            ¡Libérate del WhatsApp!
          </h1>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 600, marginBottom: 24, maxWidth: 800, margin: '0 auto 24px', color: colors.text }}>
            Tu negocio, tus citas, todo bajo control.
          </h2>
          <p style={{ fontSize: 'clamp(18px, 2.5vw, 20px)', color: colors.textSecondary, marginBottom: 48, maxWidth: 650, margin: '0 auto 48px', lineHeight: 1.6 }}>
            Tu propio sistema de reservas y app móvil para que tus clientes agenden en segundos, 24/7. El asistente digital que tu negocio de servicios necesita.
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center' }}>
            <button onClick={() => navigate('/register-vendor')} className="btn-primary" style={{ fontSize: 18, padding: '18px 40px' }}>
              Registrar mi Negocio
              <span style={{ fontSize: 20 }}>→</span>
            </button>
            <button onClick={() => navigate(`/${demoSlug}`)} className="btn-secondary" style={{ fontSize: 18, padding: '18px 40px' }}>
              Ver Demo Interactiva
            </button>
          </div>

          {/* Abstract visual element */}
          <div className="floating-anim" style={{ 
            marginTop: 80, maxWidth: 900, margin: '80px auto 0', 
            background: colors.cardBg, borderRadius: '24px 24px 0 0', 
            padding: '12px', boxShadow: isDark ? '0 50px 100px -20px rgba(0,0,0,0.5)' : '0 50px 100px -20px rgba(0,0,0,0.15)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, borderBottom: 'none',
            overflow: 'hidden'
          }}>
            <img 
              src="/reporte1.png" 
              alt="Dashboard de Reportes" 
              style={{ 
                width: '100%', 
                height: 'auto', 
                borderRadius: '16px 16px 0 0',
                display: 'block'
              }} 
            />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
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

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '120px 24px', background: isDark ? colors.bgSecondary : '#f8fafc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, marginBottom: 20, color: colors.text }}>
              Transparente y sin sorpresas
            </h2>
            <p style={{ color: colors.textSecondary, fontSize: 18 }}>
              Un solo plan con acceso ilimitado a todas las funciones.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {plans.map((plan, i) => (
              <div key={i} className="plan-card popular" style={{ maxWidth: 450, width: '100%' }}>
                <div className="badge-popular">ACCESO TOTAL</div>
                <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: colors.text }}>{plan.name}</h3>
                <p style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 32 }}>{plan.desc}</p>
                
                <div style={{ marginBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 'clamp(36px, 10vw, 56px)', fontWeight: 800, color: colors.text }}>$60.000</span>
                  <span style={{ fontSize: 16, color: colors.textSecondary, fontWeight: 500 }}>COP / mes</span>
                </div>

                <button
                  onClick={() => navigate('/register-vendor')}
                  className="btn-primary"
                  style={{ width: '100%', marginBottom: 40, padding: '20px' }}
                >
                  Empezar ahora mismo
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: '#475569' }}>
                      <div style={{ color: '#10b981', fontSize: 20 }}>✓</div>
                      {f.replace('✅ ', '')}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
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

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '80px 24px 120px' }}>
        <div style={{ 
          maxWidth: 1000, margin: '0 auto', 
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '48px', padding: '80px 40px', textAlign: 'center',
          color: 'white', position: 'relative', overflow: 'hidden',
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)'
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', filter: 'blur(60px)' }}></div>
          <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(236, 72, 153, 0.1)', filter: 'blur(60px)' }}></div>

          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, marginBottom: 24, position: 'relative' }}>
            Empieza a crecer hoy mismo
          </h2>
          <p style={{ fontSize: 20, marginBottom: 48, opacity: 0.8, maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.6, position: 'relative' }}>
            Únete a la nueva era de gestión de servicios. Sin tarjetas de crédito, sin complicaciones.
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: 20, justifyContent: 'center', position: 'relative' }}>
            <button onClick={() => navigate('/register-vendor')} className="btn-primary" style={{ padding: '20px 48px', fontSize: 18 }}>
              Crear mi cuenta 
            </button>
            <a
              href="https://wa.me/573125205513?text=Hola%20KDice%2C%20tengo%20preguntas%20sobre%20el%20sistema"
              target="_blank" rel="noreferrer"
              className="btn-secondary"
              style={{ padding: '20px 48px', fontSize: 18, background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              Hablar con ventas
            </a>
          </div>
        </div>
      </section>

      {/* ── DESCARGA APP ── */}
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
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/apk/kdice-reservas.apk';
                link.download = 'kdice-reservas.apk';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }} 
              style={{ 
                display: 'inline-flex', alignItems: 'center', gap: 12,
                background: '#10b981', color: 'white', 
                padding: '16px 32px', borderRadius: 12,
                textDecoration: 'none', fontWeight: 600, fontSize: 16,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                transition: 'transform 0.2s'
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

      {/* ── FOOTER ── */}
      <footer style={{ background: isDark ? colors.bgSecondary : '#ffffff', borderTop: `1px solid ${colors.border}`, padding: '60px 24px 40px' }}>
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

      {/* Modal de Privacidad */}
      {modalOpen === 'privacy' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20, overflow: 'hidden'
        }} onClick={() => setModalOpen(null)}>
          <div style={{
            background: colors.cardBg, borderRadius: 16, padding: '24px 32px 32px',
            maxWidth: 600, width: '100%', maxHeight: '90vh',
            overflowY: 'auto', position: 'relative',
            display: 'flex', flexDirection: 'column',
            border: `1px solid ${colors.border}`
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setModalOpen(null)}
              style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: colors.textSecondary, zIndex: 10 }}
            >
              ×
            </button>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: colors.text, paddingRight: 40 }}>Política de Privacidad</h2>
            <div style={{ color: colors.textSecondary, lineHeight: 1.7, fontSize: 14 }}>
              <p style={{ marginBottom: 16 }}><strong style={{ color: colors.text }}>1. Información que recopilamos</strong></p>
              <p style={{ marginBottom: 16 }}>Recopilamos información necesaria para proporcionar nuestros servicios: nombre del negocio, información de contacto, datos de empleados y clientes, y registros de citas.</p>
              
              <p style={{ marginBottom: 16 }}><strong style={{ color: colors.text }}>2. Uso de la información</strong></p>
              <p style={{ marginBottom: 16 }}>Utilizamos la información para gestionar citas, enviar recordatorios, generar reportes y mejorar nuestros servicios. No vendemos ni compartimos datos con terceros.</p>
              
              <p style={{ marginBottom: 16 }}><strong style={{ color: colors.text }}>3. Seguridad</strong></p>
              <p style={{ marginBottom: 16 }}>Implementamos medidas de seguridad para proteger sus datos. Toda la información se transmite de forma encriptada.</p>
              
              <p style={{ marginBottom: 16 }}><strong style={{ color: colors.text }}>4. Contacto</strong></p>
              <p>Si tiene preguntas sobre privacidad, contáctenos por WhatsApp.</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Términos */}
      {modalOpen === 'terms' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20, overflow: 'hidden'
        }} onClick={() => setModalOpen(null)}>
          <div style={{
            background: colors.cardBg, borderRadius: 16, padding: '24px 32px 32px',
            maxWidth: 600, width: '100%', maxHeight: '90vh',
            overflowY: 'auto', position: 'relative',
            display: 'flex', flexDirection: 'column',
            border: `1px solid ${colors.border}`
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setModalOpen(null)}
              style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: colors.textSecondary, zIndex: 10 }}
            >
              ×
            </button>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: colors.text, paddingRight: 40 }}>Términos de Servicio</h2>
            <div style={{ color: colors.textSecondary, lineHeight: 1.7, fontSize: 14 }}>
              <p style={{ marginBottom: 16 }}><strong style={{ color: colors.text }}>1. Aceptación</strong></p>
              <p style={{ marginBottom: 16 }}>Al usar KDice, usted acepta estos términos. El servicio es proporcionado "tal cual" sin garantías explícitas.</p>
              
              <p style={{ marginBottom: 16 }}><strong style={{ color: colors.text }}>2. Suscripción</strong></p>
              <p style={{ marginBottom: 16 }}>El servicio tiene un costo mensual de $60,000 COP. Puede cancelar en cualquier momento sin penalización.</p>
              
              <p style={{ marginBottom: 16 }}><strong style={{ color: colors.text }}>3. Responsabilidades</strong></p>
              <p style={{ marginBottom: 16 }}>Usted es responsable de mantener la seguridad de su cuenta. KDice no se hace responsable por pérdidas de datos debido a negligencia del usuario.</p>
              
              <p style={{ marginBottom: 16 }}><strong style={{ color: colors.text }}>4. Soporte</strong></p>
              <p>Ofrecemos soporte por WhatsApp durante horarios de oficina.</p>
            </div>
          </div>
        </div>
      )}
      {/* ── FLOATING WHATSAPP BUTTON ── */}
      <a
        href="https://wa.me/573125205513?text=Hola%20KDice%2C%20me%20interesa%20el%20sistema"
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#25d366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
          zIndex: 999,
          cursor: 'pointer',
          transition: 'transform 0.3s, box-shadow 0.3s'
        }}
        onMouseEnter={e => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.5)';
        }}
        onMouseLeave={e => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.4)';
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
}
