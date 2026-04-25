import { getImgUrl } from '../utils';

export default function HeroSection({ business, slug, navigate, primary, secondary }) {
  const hasWhatsappCatalog = !!business.whatsappCatalog;
  
  return (
    <section className="hero-section" style={{
      background: business.bannerUrl 
        ? `url(${getImgUrl(business.bannerUrl)}) center/cover no-repeat fixed`
        : `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`
    }}>
      <div className="hero-overlay" style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)'
      }} />
      <div className="hero-content">
        <div className="hero-logo-container">
          {business.logoUrl ? (
            <img src={getImgUrl(business.logoUrl)} alt={business.name} className="hero-logo" />
          ) : (
            <div className="hero-logo" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: 48, 
              fontWeight: 900, 
              background: 'white', 
              color: primary 
            }}>
              {business.name.charAt(0)}
            </div>
          )}
        </div>
        <h1 className="hero-title">{business.name}</h1>
        {business.tagline && <p className="hero-tagline" style={{ color: 'rgba(255,255,255,0.95)' }}>{business.tagline}</p>}
        
        <div className="hero-actions">
          <button className="main-cta-btn" onClick={() => navigate(`/${slug}/book`)}>
            {business.isTechnicalServices ? 'Solicitar Servicio Técnico' : (business.ctaText || 'Reservar mi cita ahora')}
          </button>
          {hasWhatsappCatalog && (
            <a href={business.whatsappCatalog} target="_blank" rel="noreferrer" className="secondary-cta-btn">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{fontSize: 20}}>🛍️</span> Catálogo Digital
              </div>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
