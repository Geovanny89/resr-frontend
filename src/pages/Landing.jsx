import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate   = useNavigate();
  const [demoSlug] = useState('demo-kdice');
  const [navOpen, setNavOpen] = useState(false);

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
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#f8fafc' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        .land-nav-link{text-decoration:none;color:#4a5568;font-weight:500;font-size:15px;padding:6px 4px;transition:color 0.15s}
        .land-nav-link:hover{color:#667eea}
        .feat-card{background:white;border-radius:16px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,0.06);text-align:center;transition:transform 0.2s,box-shadow 0.2s}
        .feat-card:hover{transform:translateY(-6px);box-shadow:0 12px 32px rgba(0,0,0,0.12)}
        .plan-card{background:white;border-radius:16px;padding:36px 28px;box-shadow:0 2px 12px rgba(0,0,0,0.06);transition:transform 0.2s,box-shadow 0.2s;position:relative}
        .plan-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,0.1)}
        .plan-card.popular{border:2px solid #667eea;box-shadow:0 12px 32px rgba(102,126,234,0.2)}
        .test-card{background:white;border-radius:16px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
        .cta-btn-white{background:white;border:none;border-radius:8px;padding:14px 32px;font-weight:700;font-size:16px;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.2);transition:transform 0.2s}
        .cta-btn-white:hover{transform:translateY(-2px)}
        .cta-btn-outline{background:rgba(255,255,255,0.2);color:white;border:2px solid white;border-radius:8px;padding:12px 30px;font-weight:700;font-size:16px;cursor:pointer;transition:all 0.2s;text-decoration:none;display:inline-flex;align-items:center;gap:8px}
        .cta-btn-outline:hover{background:rgba(255,255,255,0.3);transform:translateY(-2px)}
        .nav-mobile{display:none}
        @media(max-width:768px){
          .nav-links-desktop{display:none!important}
          .nav-mobile{display:block;position:static!important}
          /* En móvil, el menú debe anclarse al viewport (no al botón) */
          .nav-mobile-menu{
            position:fixed;
            top:64px;
            left:0;
            right:0;
            background:white;
            border-bottom:1px solid #e2e8f0;
            padding:12px 20px;
            display:flex;
            flex-direction:column;
            gap:4px;
            box-shadow:0 8px 24px rgba(0,0,0,0.1);
            z-index:200;
            max-height:calc(100vh - 64px);
            overflow:auto;
          }
          .hero-btns{flex-direction:column!important;align-items:center!important}
          .hero-btns button,.hero-btns a{width:100%;max-width:320px;text-align:center;justify-content:center}
          .plans-grid{grid-template-columns:1fr!important}
          .plan-card.popular{transform:none!important}
          .features-h2,.pricing-h2,.test-h2,.cta-h2{font-size:clamp(22px,6vw,36px)!important}
        }
        @media(max-width:480px){
          .hero-section{padding:48px 16px!important;min-height:auto!important}
          .section-pad{padding:48px 16px!important}
          .feat-card{padding:24px 16px}
          .plan-card{padding:28px 20px}
          .test-card{padding:20px 16px}
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        padding: '0 24px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: 64,
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#667eea', flexShrink: 0 }}>📱 KDice POS</div>

        {/* Desktop links */}
        <div className="nav-links-desktop" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className="land-nav-link">{l.label}</a>
          ))}
          <button
            onClick={() => navigate('/login')}
            style={{ background: '#667eea', color: 'white', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
          >
            Iniciar Sesión
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="nav-mobile" style={{ position: 'relative' }}>
          <button
            onClick={() => setNavOpen(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, fontSize: 22, color: '#4a5568' }}
          >
            {navOpen ? '✕' : '☰'}
          </button>
          {navOpen && (
            <div className="nav-mobile-menu">
              {navLinks.map(l => (
                <a key={l.href} href={l.href} className="land-nav-link" onClick={() => setNavOpen(false)} style={{ padding: '10px 4px', borderBottom: '1px solid #f0f4f8' }}>
                  {l.label}
                </a>
              ))}
              <button
                onClick={() => { navigate('/login'); setNavOpen(false); }}
                style={{ background: '#667eea', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14, marginTop: 8 }}
              >
                Iniciar Sesión
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="hero-section"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white', padding: '80px 24px', textAlign: 'center',
          minHeight: 560, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
        }}
      >
        <h1 style={{ fontSize: 'clamp(28px, 7vw, 56px)', fontWeight: 800, marginBottom: 16, lineHeight: 1.2, maxWidth: 800 }}>
          Gestión de Citas Inteligente para tu Negocio
        </h1>
        <p style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', opacity: 0.9, marginBottom: 36, maxWidth: 600, lineHeight: 1.6 }}>
          Sistema completo con app móvil personalizada, recordatorios automáticos y reportes en tiempo real.
        </p>
        <div className="hero-btns" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/register-vendor')}
            className="cta-btn-white"
            style={{ color: '#667eea' }}
          >
            Registrar Negocio Gratis
          </button>
          <button
            onClick={() => navigate(`/${demoSlug}`)}
            className="cta-btn-outline"
          >
            Ver Demo
          </button>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="section-pad" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 className="features-h2" style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 800, textAlign: 'center', marginBottom: 56, color: '#1a202c' }}>
          ¿Por qué elegir KDice?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} className="feat-card">
              <div style={{ fontSize: 44, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: '#1a202c' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#718096', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO ── */}
      <section id="demo" style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white', padding: '72px 24px', textAlign: 'center',
      }}>
        <h2 className="pricing-h2" style={{ fontSize: 'clamp(22px, 5vw, 40px)', fontWeight: 800, marginBottom: 20 }}>Prueba la Demo</h2>
        <p style={{ fontSize: 16, marginBottom: 32, opacity: 0.9, maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.6 }}>
          Explora todas las funcionalidades sin necesidad de registrarte. Haz una reserva de prueba y ve cómo funciona.
        </p>
        <button
          onClick={() => navigate(`/${demoSlug}`)}
          className="cta-btn-white"
          style={{ color: '#f5576c' }}
        >
          Acceder a Demo →
        </button>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="section-pad" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 className="pricing-h2" style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 800, textAlign: 'center', marginBottom: 16, color: '#1a202c' }}>
          Plan Único, Todo Incluido
        </h2>
        <p style={{ textAlign: 'center', color: '#718096', marginBottom: 48, fontSize: 16 }}>
          Suscripción mensual de $60,000 COP. Sin contratos, cancela cuando quieras.
        </p>
        <div className="plans-grid" style={{ display: 'flex', justifyContent: 'center', gap: 28 }}>
          {plans.map((plan, i) => (
            <div key={i} className="plan-card popular" style={{ maxWidth: 400, width: '100%' }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: '#1a202c' }}>{plan.name}</h3>
              <p style={{ fontSize: 13, color: '#718096', marginBottom: 20 }}>{plan.desc}</p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: plan.color }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: '#718096' }}>{plan.period}</span>
              </div>
              <button
                onClick={() => navigate('/register-vendor')}
                style={{
                  background: plan.color, color: 'white', border: 'none', borderRadius: 8,
                  padding: '11px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  width: '100%', marginBottom: 24, transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.target.style.opacity = '0.88'}
                onMouseLeave={e => e.target.style.opacity = '1'}
              >
                {plan.cta}
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ padding: '10px 0', borderBottom: '1px solid #e2e8f0', fontSize: 14, color: '#4a5568' }}>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: '#f7fafc', padding: '72px 24px' }}>
        <h2 className="test-h2" style={{ fontSize: 'clamp(22px, 5vw, 40px)', fontWeight: 800, textAlign: 'center', marginBottom: 48, color: '#1a202c' }}>
          Lo que dicen nuestros clientes
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
          {testimonials.map((t, i) => (
            <div key={i} className="test-card">
              <p style={{ fontSize: 15, color: '#4a5568', marginBottom: 20, fontStyle: 'italic', lineHeight: 1.7 }}>
                {t.text}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 30 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1a202c', fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#718096' }}>{t.business}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white', padding: '72px 24px', textAlign: 'center',
      }}>
        <h2 className="cta-h2" style={{ fontSize: 'clamp(22px, 5vw, 40px)', fontWeight: 800, marginBottom: 16 }}>
          ¿Listo para transformar tu negocio?
        </h2>
        <p style={{ fontSize: 16, marginBottom: 36, opacity: 0.9, maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.6 }}>
          Únete a cientos de negocios que ya están usando KDice
        </p>
        <div className="hero-btns" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/register-vendor')}
            className="cta-btn-white"
            style={{ color: '#667eea' }}
          >
            Registrar Negocio Gratis
          </button>
          <a
            href="https://wa.me/573001234567?text=Hola%20KDice%2C%20tengo%20preguntas%20sobre%20el%20sistema"
            target="_blank" rel="noreferrer"
            className="cta-btn-outline"
          >
            💬 WhatsApp Ventas
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#1a202c', color: 'white', padding: '36px 24px', textAlign: 'center', fontSize: 14 }}>
        <p style={{ marginBottom: 14, color: '#a0aec0' }}>© {new Date().getFullYear()} KDice. Todos los derechos reservados.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          <a href="#" style={{ color: '#a0aec0', textDecoration: 'none' }}>Privacidad</a>
          <a href="#" style={{ color: '#a0aec0', textDecoration: 'none' }}>Términos</a>
          <a href="#" style={{ color: '#a0aec0', textDecoration: 'none' }}>Contacto</a>
          <a href="https://wa.me/573001234567" target="_blank" rel="noreferrer" style={{ color: '#25d366', textDecoration: 'none', fontWeight: 600 }}>WhatsApp</a>
        </div>
      </footer>
    </div>
  );
}
