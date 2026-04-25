import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { carouselImages } from '../constants';

export function Hero({ currentSlide, nextSlide, prevSlide, goToSlide, setVideoModalOpen }) {
  const navigate = useNavigate();
  const { isDark, colors } = useTheme();

  return (
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
          <button onClick={() => setVideoModalOpen(true)} className="btn-secondary" style={{ fontSize: 18, padding: '18px 40px' }}>
            🎥 Ver Demo
          </button>
        </div>

        {/* Carousel de imágenes */}
        <div className="floating-anim" style={{
          marginTop: 80,
          maxWidth: 900,
          margin: '80px auto 0',
          background: colors.cardBg,
          borderRadius: '24px 24px 0 0',
          padding: '12px',
          boxShadow: isDark ? '0 50px 100px -20px rgba(0,0,0,0.5)' : '0 50px 100px -20px rgba(0,0,0,0.15)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
          borderBottom: 'none',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', width: '100%', borderRadius: '16px 16px 0 0', overflow: 'hidden', background: isDark ? '#1a1a2e' : '#f1f5f9' }}>
            <img
              src={carouselImages[currentSlide].src}
              alt={carouselImages[currentSlide].title}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                minHeight: 400,
                objectFit: 'contain',
                objectPosition: 'center center',
                display: 'block',
                transition: 'opacity 0.5s ease-in-out'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.95))',
              padding: '60px 20px 25px',
              color: 'white',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {carouselImages[currentSlide].title}
              </h3>
              <p style={{ fontSize: 18, opacity: 0.95, fontWeight: 500, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                {carouselImages[currentSlide].desc}
              </p>
            </div>
            <CarouselControls onPrev={prevSlide} onNext={nextSlide} currentSlide={currentSlide} totalSlides={carouselImages.length} onGoTo={goToSlide} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CarouselControls({ onPrev, onNext, currentSlide, totalSlides, onGoTo }) {
  const { isDark } = useTheme();

  const arrowStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)',
    borderRadius: '50%',
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: isDark ? '#1a1a2e' : 'white',
    fontSize: 20,
    userSelect: 'none',
    backdropFilter: 'blur(4px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    border: `2px solid ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'}`,
    zIndex: 10
  };

  return (
    <>
      <div style={{ ...arrowStyle, left: 10 }} onClick={onPrev}>←</div>
      <div style={{ ...arrowStyle, right: 10 }} onClick={onNext}>→</div>
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 10,
        background: 'rgba(0,0,0,0.4)',
        padding: '6px 12px',
        borderRadius: 20,
        backdropFilter: 'blur(4px)'
      }}>
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <div
            key={idx}
            onClick={() => onGoTo(idx)}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: idx === currentSlide ? 'white' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              transform: idx === currentSlide ? 'scale(1.2)' : 'scale(1)'
            }}
          />
        ))}
      </div>
    </>
  );
}
