import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';

const BASE_URL = (api.defaults.baseURL || '').replace('/api', '');

function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
}

function SocialLink({ href, children, label, color }) {
  if (!href) return null;
  const url = href.startsWith('http') ? href : `https://${href}`;
  return (
    <a
      href={url} target="_blank" rel="noreferrer" title={label}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 40, height: 40, borderRadius: '50%', background: color, color: 'white',
        fontSize: 17, textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)', flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'; }}
    >
      {children}
    </a>
  );
}

function GalleryModal({ images, index, onClose }) {
  const [cur, setCur] = useState(index);
  useEffect(() => {
    const h = e => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowRight')  setCur(c => Math.min(c + 1, images.length - 1));
      if (e.key === 'ArrowLeft')   setCur(c => Math.max(c - 1, 0));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [images.length, onClose]);

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}
    >
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '92vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img
          src={getImgUrl(images[cur])} alt={`Imagen ${cur + 1}`}
          style={{ maxWidth: '92vw', maxHeight: '75vh', borderRadius: 12, objectFit: 'contain' }}
        />
        {/* Controles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button
            onClick={() => setCur(c => Math.max(c - 1, 0))}
            disabled={cur === 0}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, color: 'white', fontSize: 20, cursor: cur === 0 ? 'not-allowed' : 'pointer', opacity: cur === 0 ? 0.3 : 1 }}
          >‹</button>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{cur + 1} / {images.length}</span>
          <button
            onClick={() => setCur(c => Math.min(c + 1, images.length - 1))}
            disabled={cur === images.length - 1}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, color: 'white', fontSize: 20, cursor: cur === images.length - 1 ? 'not-allowed' : 'pointer', opacity: cur === images.length - 1 ? 0.3 : 1 }}
          >›</button>
        </div>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: -44, right: 0, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: 'white', fontSize: 18, cursor: 'pointer', fontWeight: 700 }}
        >✕</button>
      </div>
    </div>
  );
}

export default function BusinessLanding() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const { isDark, colors } = useTheme();
  const [business, setBusiness]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [galleryModal, setGalleryModal] = useState(null);

  useEffect(() => {
    api.get(`/businesses/${slug}/public`)
      .then(r => setBusiness(r.data))
      .catch(() => setError('Negocio no encontrado'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
      <div style={{ textAlign: 'center', color: '#718096' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p>Cargando...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#2d3748', marginBottom: 8 }}>Negocio no encontrado</h2>
        <p style={{ color: '#718096' }}>El enlace puede ser incorrecto o el negocio ya no está disponible.</p>
      </div>
    </div>
  );

  const primary   = business.primaryColor   || '#4f46e5';
  const secondary = business.secondaryColor || '#7c3aed';
  const gradient  = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
  const heroStyle = business.bannerUrl
    ? {
        backgroundImage: `
          radial-gradient(circle at 20% 25%, rgba(255,255,255,0.12) 0%, transparent 55%),
          linear-gradient(180deg, rgba(2, 6, 23, 0.72) 0%, rgba(2, 6, 23, 0.44) 55%, rgba(2, 6, 23, 0.78) 100%),
          url(${getImgUrl(business.bannerUrl)})
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { background: gradient };

  let gallery = [];
  try { gallery = JSON.parse(business.gallery || '[]'); } catch (e) { gallery = []; }

  const hasWhatsapp  = !!business.whatsapp;
  const whatsappNum  = business.whatsapp ? business.whatsapp.replace(/\D/g, '') : '';
  const hasSocials   = !!(business.instagram || business.facebook || business.tiktok || business.twitter || business.website);

  return (
    <div style={{ minHeight: '100vh', background: colors.bgTertiary, color: colors.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        :root{
          --pub-bg: ${colors.bgTertiary};
          --pub-surface: ${colors.cardBg};
          --pub-surface-2: ${colors.bgSecondary};
          --pub-border: ${colors.border};
          --pub-text: ${colors.text};
          --pub-muted: ${colors.textTertiary};
          --pub-subtle: ${colors.textSecondary};
          --pub-shadow: ${colors.shadow};
          --brand-primary: ${primary};
          --brand-secondary: ${secondary};
        }
        .svc-card{transition:transform 0.2s,box-shadow 0.2s}
        .svc-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,0.12)!important}
        .gal-item{transition:transform 0.2s,opacity 0.2s}
        .gal-item:hover{transform:scale(1.03);opacity:0.92}
        .cta-btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,0.25)!important}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse-wa{0%,100%{box-shadow:0 4px 20px rgba(37,211,102,0.5)}50%{box-shadow:0 4px 30px rgba(37,211,102,0.8),0 0 0 8px rgba(37,211,102,0.15)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.5s ease both}
        .hero-shell{position:relative;isolation:isolate}
        .hero-shell:before{
          content:'';
          position:absolute;inset:0;
          background:
            radial-gradient(circle at 80% 30%, rgba(255,255,255,0.10) 0%, transparent 45%),
            radial-gradient(circle at 15% 70%, rgba(255,255,255,0.08) 0%, transparent 55%);
          pointer-events:none;
          z-index:0;
        }
        .hero-shell:after{
          content:'';
          position:absolute;left:0;right:0;bottom:-1px;height:64px;
          background:linear-gradient(to bottom, rgba(0,0,0,0) 0%, var(--pub-bg) 100%);
          z-index:1;
          pointer-events:none;
        }
        .hero-glass{
          background:rgba(255,255,255,0.10);
          border:1px solid rgba(255,255,255,0.18);
          border-radius:20px;
          padding:14px 14px 10px;
          backdrop-filter:blur(10px);
          -webkit-backdrop-filter:blur(10px);
          box-shadow:0 18px 45px rgba(0,0,0,0.25);
        }
        .brand-ring{
          width:104px;height:104px;border-radius:50%;
          padding:4px;
          background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
          box-shadow: 0 18px 45px rgba(0,0,0,0.35);
          display:inline-flex;align-items:center;justify-content:center;
          margin: 0 auto 12px;
        }
        .brand-logo{
          width:100%;height:100%;border-radius:50%;
          object-fit:cover;
          border: 3px solid rgba(255,255,255,0.92);
          background: rgba(255,255,255,0.12);
        }
        .hero-meta{
          display:flex;flex-wrap:wrap;justify-content:center;
          gap:10px 14px;margin:0;
        }
        .hero-pill{
          display:inline-flex;align-items:center;gap:6px;
          padding:6px 10px;border-radius:999px;
          background:rgba(2,6,23,0.28);
          border:1px solid rgba(255,255,255,0.16);
          color:rgba(255,255,255,0.92);
          font-size:12.5px;
        }
        .brand-cta{
          display:inline-flex;align-items:center;justify-content:center;gap:10px;
          padding:14px 42px;
          border-radius:14px;
          border: 1px solid rgba(255,255,255,0.25);
          background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
          color:#fff;
          font-weight:900;
          font-size:16px;
          cursor:pointer;
          box-shadow: 0 16px 40px rgba(0,0,0,0.28);
          transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
        }
        .brand-cta:hover{ transform: translateY(-2px); filter:saturate(1.05); box-shadow:0 22px 55px rgba(0,0,0,0.34); }
        .brand-cta:active{ transform: translateY(-1px) scale(0.99); }
        .brand-cta:focus-visible{ outline: 3px solid rgba(255,255,255,0.55); outline-offset: 3px; }
        .hero-social{
          display:flex;justify-content:center;gap:10px;flex-wrap:wrap;
          margin-top:10px;
        }
        .section-title{
          display:flex;align-items:center;gap:10px;
          font-size:17px;font-weight:800;color:#111827;margin:0 0 14px;
        }
        .section-subtle{
          color:#64748b;font-size:13px;margin:0 0 18px;
        }
        /* Dark mode adjustments (scoped to this page via ThemeContext colors) */
        .section-title{color:var(--pub-text)}
        .section-subtle{color:var(--pub-subtle)}
        /* Responsive overrides */
        @media(max-width:600px){
          .hero-content{padding:32px 16px 28px!important}
          .hero-title{font-size:clamp(20px,6vw,32px)!important}
          .section-card{padding:20px 16px!important}
          .emp-grid{gap:10px!important}
          .emp-card{padding:16px 10px!important;min-width:0!important}
          .cta-section{padding:28px 16px!important}
          .cta-btn{padding:13px 28px!important;font-size:15px!important}
          .brand-ring{width:96px;height:96px}
          .brand-cta{width:100%;max-width:360px}
        }
      `}</style>

      {/* Toggle de tema (público) */}
      <div style={{ position: 'fixed', top: 14, right: 14, zIndex: 1200 }}>
        <ThemeToggle />
      </div>

      {/* ── HERO ── */}
      <div
        className="hero-shell"
        style={{
          position: 'relative',
          ...heroStyle,
          minHeight: 320,
          overflow: 'hidden',
          ['--brand-primary']: primary,
          ['--brand-secondary']: secondary,
        }}
      >

        <div
          className="hero-content fade-up"
          style={{ position: 'relative', maxWidth: 860, margin: '0 auto', padding: '44px 20px 36px', textAlign: 'center', color: 'white' }}
        >
          <div className="hero-glass">
          {/* Logo */}
          {business.logoUrl ? (
            <div className="brand-ring">
              <img
                className="brand-logo"
                src={getImgUrl(business.logoUrl)}
                alt={`Logo ${business.name}`}
              />
            </div>
          ) : (
            <div className="brand-ring" aria-hidden="true">
              <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                🏪
              </div>
            </div>
          )}

          <h1 className="hero-title" style={{ fontSize: 'clamp(22px, 5vw, 38px)', fontWeight: 800, margin: '0 0 8px', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            {business.name}
          </h1>
          {business.tagline && (
            <p style={{ fontSize: 14.5, opacity: 0.92, margin: '0 0 12px', fontStyle: 'italic' }}>"{business.tagline}"</p>
          )}

          {/* Info */}
          <div className="hero-meta" style={{ marginBottom: 6 }}>
            {business.address && (
              <span className="hero-pill" style={{ opacity: 1 }}>
                📍 {business.address}
              </span>
            )}
            {business.phone && (
              <a href={`tel:${business.phone}`} className="hero-pill" style={{ textDecoration: 'none' }}>
                📞 {business.phone}
              </a>
            )}
            {business.businessHours && (
              <span className="hero-pill">
                🕐 {business.businessHours}
              </span>
            )}
          </div>

          {/* Redes sociales */}
          {hasSocials && (
            <div className="hero-social">
              <SocialLink href={business.instagram} label="Instagram" color="linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)">📷</SocialLink>
              <SocialLink href={business.facebook}  label="Facebook"  color="#1877f2">👤</SocialLink>
              <SocialLink href={business.tiktok}    label="TikTok"    color="#010101">🎵</SocialLink>
              <SocialLink href={business.twitter}   label="Twitter/X" color="#1da1f2">🐦</SocialLink>
              <SocialLink href={business.website}   label="Sitio web" color="#6366f1">🌐</SocialLink>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 16px 100px' }}>

        {/* Descripción */}
        {business.description && (
          <div
            className="section-card fade-up"
            style={{
              background: colors.cardBg,
              borderRadius: 16,
              padding: '24px 28px',
              marginBottom: 20,
              boxShadow: `0 2px 12px ${colors.shadow}`,
              border: `1px solid ${colors.borderLight || colors.border}`,
              borderLeft: `5px solid ${primary}`,
            }}
          >
            <h2 className="section-title">ℹ️ Sobre nosotros</h2>
            <p style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.8, margin: 0 }}>{business.description}</p>
          </div>
        )}

        {/* Galería */}
        {gallery.length > 0 && (
          <div className="section-card fade-up" style={{ background: colors.cardBg, borderRadius: 16, padding: '24px 28px', marginBottom: 20, boxShadow: `0 2px 12px ${colors.shadow}`, border: `1px solid ${colors.borderLight || colors.border}` }}>
            <h2 className="section-title">🖼️ Galería</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
              {gallery.map((img, i) => (
                <div
                  key={i}
                  className="gal-item"
                  onClick={() => setGalleryModal(i)}
                  style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                >
                  <img src={getImgUrl(img)} alt={`Galería ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Servicios */}
        {business.Services && business.Services.length > 0 && (
          <div className="section-card fade-up" style={{ background: colors.cardBg, borderRadius: 16, padding: '24px 28px', marginBottom: 20, boxShadow: `0 2px 12px ${colors.shadow}`, border: `1px solid ${colors.borderLight || colors.border}` }}>
            <h2 className="section-title">✨ Nuestros servicios</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {business.Services.filter(s => s.active !== false).map(svc => (
                <div
                  key={svc.id}
                  className="svc-card"
                  style={{
                    border: `1px solid ${colors.border}`,
                    borderRadius: 14,
                    padding: '16px 18px',
                    boxShadow: `0 2px 10px ${colors.shadow}`,
                    background: isDark ? colors.bgSecondary : 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)'
                  }}
                >
                  <div style={{ fontWeight: 700, color: colors.text, marginBottom: 6, fontSize: 15 }}>{svc.name}</div>
                  {svc.description && (
                    <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 12, lineHeight: 1.5 }}>{svc.description}</div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: primary }}>${Number(svc.price).toLocaleString()}</span>
                    <span style={{ fontSize: 11, color: colors.textSecondary, background: colors.bgTertiary, padding: '3px 8px', borderRadius: 20, border: `1px solid ${colors.border}` }}>
                      ⏱ {svc.durationMin} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipo */}
        {business.Employees && business.Employees.length > 0 && (
          <div className="section-card fade-up" style={{ background: colors.cardBg, borderRadius: 16, padding: '24px 28px', marginBottom: 20, boxShadow: `0 2px 12px ${colors.shadow}`, border: `1px solid ${colors.borderLight || colors.border}` }}>
            <h2 className="section-title">👥 Nuestro equipo</h2>
            <div
              className="emp-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 14 }}
            >
              {business.Employees.map(emp => (
                <div
                  key={emp.id}
                  className="emp-card"
                  style={{
                    textAlign: 'center',
                    padding: '18px 12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 16,
                    background: isDark ? colors.bgSecondary : 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)'
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: gradient, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 22, margin: '0 auto 10px',
                    color: 'white', fontWeight: 700, overflow: 'hidden',
                  }}>
                    {emp.photoUrl ? (
                      <img src={getImgUrl(emp.photoUrl)} alt={emp.User?.name || 'Empleado'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      emp.User?.name?.charAt(0).toUpperCase() || '?'
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: colors.text, wordBreak: 'break-word' }}>
                    {emp.User?.name || ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div
          className="cta-section fade-up"
          style={{
            background: gradient, borderRadius: 20, padding: '36px 28px',
            textAlign: 'center', color: 'white', position: 'relative',
            overflow: 'hidden', boxShadow: `0 8px 32px ${primary}40`,
          }}
        >
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, margin: '0 0 10px', position: 'relative' }}>
            ¿Listo para tu cita?
          </h2>
          <p style={{ fontSize: 14, opacity: 0.9, margin: '0 0 24px', position: 'relative' }}>
            Reserva en segundos, sin llamadas ni esperas
          </p>
          <button className="brand-cta" onClick={() => navigate(`/${slug}/book`)}>
            📅 {business.ctaText || 'Reservar cita ahora'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: colors.cardBg, borderTop: `1px solid ${colors.border}`, padding: '20px 16px', textAlign: 'center' }}>
        {hasSocials && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <SocialLink href={business.instagram} label="Instagram" color="linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)">📷</SocialLink>
            <SocialLink href={business.facebook}  label="Facebook"  color="#1877f2">👤</SocialLink>
            <SocialLink href={business.tiktok}    label="TikTok"    color="#010101">🎵</SocialLink>
            <SocialLink href={business.twitter}   label="Twitter/X" color="#1da1f2">🐦</SocialLink>
            <SocialLink href={business.website}   label="Sitio web" color="#6366f1">🌐</SocialLink>
          </div>
        )}
        <p style={{ fontSize: 12, color: colors.textTertiary, margin: 0 }}>
          &copy; {new Date().getFullYear()} {business.name} &middot; Powered by <strong style={{ color: primary }}>K-Dice POS</strong>
        </p>
      </footer>

      {/* Botón WhatsApp flotante */}
      {hasWhatsapp && (
        <a
          href={`https://wa.me/${whatsappNum}?text=Hola%2C%20me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20servicios`}
          target="_blank" rel="noreferrer" title="Contactar por WhatsApp"
          style={{
            position: 'fixed', bottom: 24, right: 20, zIndex: 1000,
            width: 56, height: 56, borderRadius: '50%', background: '#25d366',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(37,211,102,0.5)', textDecoration: 'none',
            animation: 'pulse-wa 2s infinite', transition: 'transform 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      )}

      {/* Modal galería */}
      {galleryModal !== null && (
        <GalleryModal images={gallery} index={galleryModal} onClose={() => setGalleryModal(null)} />
      )}
    </div>
  );
}
