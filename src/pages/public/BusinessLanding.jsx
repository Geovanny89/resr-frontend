import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';

// URL base para imágenes - si es relativa, usar el dominio del backend
const API_BASE_URL = api.defaults.baseURL || '/api';
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// En desarrollo local el backend corre en el puerto 4000, en producción usamos el subdominio api-reservas
const BACKEND_URL = isLocal ? 'http://localhost:4000' : 'https://api-reservas.k-dice.com';

function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  // Asegurar que la URL comience con / si no lo tiene
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_URL}${cleanUrl}`;
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
        fontSize: 17, textDecoration: 'none', transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)', flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.25)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'; }}
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
    console.log('BusinessLanding - slug:', slug);
    api.get(`/businesses/${slug}/public`)
      .then(r => {
        console.log('BusinessLanding - API response:', r.data);
        if (!r.data || !r.data.id) {
          setError('Negocio no encontrado');
        } else {
          setBusiness(r.data);
        }
      })
      .catch(e => {
        console.error('BusinessLanding - API error:', e);
        setError(e.response?.status === 404 ? 'Negocio no encontrado' : 'Error al cargar el negocio');
      })
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

  if (!business) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#2d3748', marginBottom: 8 }}>Error al cargar</h2>
        <p style={{ color: '#718096' }}>No se pudo cargar la información del negocio.</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ marginTop: 16, padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          Reintentar
        </button>
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
    <div style={{ minHeight: '100vh', background: colors.bgTertiary, color: colors.text, fontFamily: "'Inter', system-ui, sans-serif", paddingBottom: 40 }}>
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
        
        .section-card {
          background: var(--pub-surface);
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--pub-border);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .svc-card {
          background: var(--pub-surface-2);
          border: 1px solid var(--pub-border);
          border-radius: 20px;
          padding: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .svc-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          border-color: var(--brand-primary);
        }

        .gal-item {
          aspect-ratio: 1;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .gal-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }
        .gal-item:hover::before {
          opacity: 1;
        }
        .gal-item::after {
          content: 'Ver más';
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 14px;
          font-weight: 600;
          opacity: 0;
          transition: all 0.3s ease;
          z-index: 2;
        }
        .gal-item:hover::after {
          opacity: 1;
        }
        .gal-item:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.4);
          z-index: 2;
        }
        .gal-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .gal-item:hover img {
          transform: scale(1.1);
        }

        .brand-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 18px 48px;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
          color: white;
          font-weight: 800;
          font-size: 18px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 400px;
        }
        .brand-cta:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
          filter: brightness(1.1);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }

        .hero-shell {
          position: relative;
          min-height: 450px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background-attachment: fixed;
        }
        
        .hero-glass {
          background: transparent;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          border: none;
          border-radius: 0;
          padding: 48px;
          width: 100%;
          max-width: 700px;
          box-shadow: none;
          text-align: center;
          color: white;
        }

        .team-item {
          text-align: center;
          padding: 20px;
          border-radius: 20px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .team-item:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-8px);
        }
        .team-photo {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          margin: 0 auto 16px;
          overflow: hidden;
          border: 3px solid var(--brand-primary);
          padding: 4px;
          background: white;
          transition: all 0.4s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .team-item:hover .team-photo {
          transform: scale(1.08);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }
        .team-photo img,
        .team-photo > div {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          transition: transform 0.4s ease;
        }
        .team-item:hover .team-photo img {
          transform: scale(1.1);
        }

        .brand-ring {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
          padding: 4px;
          margin: 0 auto 24px;
          box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.05);
        }
        .brand-logo {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid white;
        }

        .hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 999px;
          font-size: 14px;
          color: white;
          text-decoration: none;
          backdrop-filter: blur(4px);
          line-height: 1.5;
        }

        .section-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--pub-text);
        }

          @media(max-width:600px){
          .hero-glass { padding: 32px 20px; }
          .section-card { padding: 24px 20px; }
          .svc-card { padding: 16px !important; }
          .hero-shell { min-height: 400px; }
          .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .services-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .team-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }
          .team-grid .team-photo { width: 80px !important; height: 80px !important; }
          .hero-pill { font-size: 13px; padding: 8px 14px; }
        }
      `}</style>

      {/* Toggle de tema (público) */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1200 }}>
        <ThemeToggle />
      </div>

      {/* ── HERO ── */}
      <div
        className="hero-shell"
        style={{
          ...heroStyle,
          ['--brand-primary']: primary,
          ['--brand-secondary']: secondary,
        }}
      >
        <div className="hero-glass fade-up">
          {/* Logo */}
          <div className="brand-ring">
            {business.logoUrl ? (
              <img className="brand-logo" src={getImgUrl(business.logoUrl)} alt={business.name} />
            ) : (
              <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, background: 'white' }}>🏪</div>
            )}
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 800, marginBottom: 12, letterSpacing: '-1px' }}>
            {business.name}
          </h1>
          
          {business.tagline && (
            <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 32, fontStyle: 'italic', fontWeight: 500 }}>
              "{business.tagline}"
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
              {business.address && (
                <div className="hero-pill">📍 {business.address}</div>
              )}
              {business.phone && (
                <a href={`tel:${business.phone}`} className="hero-pill">📞 {business.phone}</a>
              )}
            </div>
            {business.businessHours && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', width: '100%' }}>
                {business.businessHours.split(/Sab|Dom/).map((part, i) => {
                  if (i === 0 && part.trim()) return <div key={i} className="hero-pill" style={{ display: 'flex' }}>🕐 {part.trim()}</div>;
                  if (i === 1) return <div key={i} className="hero-pill" style={{ display: 'flex' }}>🕐 Sab {part.trim()}</div>;
                  if (i === 2) return <div key={i} className="hero-pill" style={{ display: 'flex' }}>🕐 Dom {part.trim()}</div>;
                  return null;
                })}
              </div>
            )}
          </div>

          {/* Redes sociales */}
          {hasSocials && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <SocialLink href={business.instagram} label="Instagram" color="linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)">
                <img src="/instagram.png" alt="Instagram" style={{ width: 22, height: 22 }} />
              </SocialLink>
              <SocialLink href={business.facebook} label="Facebook" color="#1877f2">
                <img src="/facebook.png" alt="Facebook" style={{ width: 22, height: 22 }} />
              </SocialLink>
              <SocialLink href={business.tiktok} label="TikTok" color="#010101">
                <img src="/tik-tok.png" alt="TikTok" style={{ width: 22, height: 22, filter: 'invert(1)' }} />
              </SocialLink>
              <SocialLink href={business.twitter} label="Twitter/X" color="#1da1f2">
                <img src="/x.png" alt="Twitter" style={{ width: 22, height: 22 }} />
              </SocialLink>
              <SocialLink href={business.website} label="Sitio web" color="#6366f1">
                <img src="/web.png" alt="Web" style={{ width: 22, height: 22 }} />
              </SocialLink>
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{ maxWidth: 900, margin: '-40px auto 0', padding: '0 20px 100px', position: 'relative', zIndex: 10 }}>

        {/* Descripción */}
        {business.description && (
          <div className="section-card fade-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="section-title">✨ Nosotros</h2>
            <p style={{ fontSize: 16, color: colors.textSecondary, lineHeight: 1.8, margin: 0 }}>
              {business.description}
            </p>
          </div>
        )}

        {/* Galería */}
        {gallery.length > 0 && (
          <div className="section-card fade-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="section-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Experiencias reales
            </h2>
            <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
              {gallery.map((img, i) => (
                <div key={i} className="gal-item" onClick={() => setGalleryModal(i)}>
                  <img src={getImgUrl(img)} alt={`Galería ${i + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Servicios */}
        {business.Services && business.Services.length > 0 && (
          <div className="section-card fade-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="section-title">💆‍♂️ Servicios destacados</h2>
            <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
              {business.Services.filter(s => s.active !== false).map(svc => (
                <div key={svc.id} className="svc-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: colors.text }}>{svc.name}</div>
                    <div style={{ background: `${primary}15`, color: colors.text, padding: '4px 12px', borderRadius: '12px', fontSize: 12, fontWeight: 700 }}>
                      ⏱ {svc.durationMin} min
                    </div>
                  </div>
                  {svc.description && (
                    <p style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.5, margin: 0 }}>
                      {svc.description}
                    </p>
                  )}
                  <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 24, fontWeight: 900, color: colors.text }}>
                      ${Number(svc.price).toLocaleString()}
                    </span>
                    <button 
                      onClick={() => navigate(`/${slug}/book`)}
                      style={{ background: 'transparent', border: 'none', color: colors.text, fontWeight: 700, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      Reservar →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipo */}
        {business.Employees && business.Employees.length > 0 && (
          <div className="section-card fade-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="section-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Nuestro equipo
            </h2>
            <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 24 }}>
              {business.Employees.map(emp => (
                <div key={emp.id} className="team-item">
                  <div className="team-photo">
                    {emp.photoUrl ? (
                      <img src={getImgUrl(emp.photoUrl)} alt={emp.User?.name} />
                    ) : (
                      <div style={{ background: `${primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: primary }}>
                        {emp.User?.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: colors.text }}>{emp.User?.name}</div>
                  <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>Experto</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA FINAL */}
        <div className="fade-up" style={{ animationDelay: '0.5s', textAlign: 'center', marginTop: 40 }}>
          <button className="brand-cta" onClick={() => navigate(`/${slug}/book`)}>
            📅 {business.ctaText || 'Reservar mi cita ahora'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '80px 20px 60px', background: colors.cardBg, borderTop: `1px solid ${colors.border}` }}>
        {hasSocials && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
            <SocialLink href={business.instagram} label="Instagram" color="linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)">
              <img src="/instagram.png" alt="Instagram" style={{ width: 22, height: 22 }} />
            </SocialLink>
            <SocialLink href={business.facebook} label="Facebook" color="#1877f2">
              <img src="/facebook.png" alt="Facebook" style={{ width: 22, height: 22 }} />
            </SocialLink>
            <SocialLink href={business.tiktok} label="TikTok" color="#010101">
              <img src="/tik-tok.png" alt="TikTok" style={{ width: 22, height: 22, filter: 'invert(1)' }} />
            </SocialLink>
            <SocialLink href={business.twitter} label="Twitter/X" color="#1da1f2">
              <img src="/x.png" alt="Twitter" style={{ width: 22, height: 22 }} />
            </SocialLink>
            <SocialLink href={business.website} label="Sitio web" color="#6366f1">
              <img src="/web.png" alt="Web" style={{ width: 22, height: 22 }} />
            </SocialLink>
          </div>
        )}
        <p style={{ fontSize: 15, color: colors.textSecondary, marginBottom: 12, fontWeight: 600 }}>
          &copy; {new Date().getFullYear()} K-Dice 
        </p>
        <div style={{ fontSize: 13, color: colors.textTertiary }}>
          Impulsado por <a href="https://k-dice.com" style={{ color: primary, fontWeight: 800, textDecoration: 'none' }}>K-Dice </a>
        </div>
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
