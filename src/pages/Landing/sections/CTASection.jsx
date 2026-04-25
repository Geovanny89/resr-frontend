import { useNavigate } from 'react-router-dom';

export function CTASection() {
  const navigate = useNavigate();

  return (
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
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ padding: '20px 48px', fontSize: 18, background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            Hablar con ventas
          </a>
        </div>
      </div>
    </section>
  );
}
