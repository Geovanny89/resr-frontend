import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Zap, FolderOpen } from 'lucide-react';
import { getImgUrl } from '../utils';

function ServiceCard({ svc, business, primary, navigate, slug, expanded, onToggle, isPromoCard = false }) {
  const promo = svc.Promotions && svc.Promotions.length > 0 ? svc.Promotions[0] : null;
  const basePrice = Number(svc.price);
  let finalPrice = basePrice;
  if (promo) {
    const discount = promo.discountType === 'percentage'
      ? basePrice * (Number(promo.discountValue) / 100)
      : Number(promo.discountValue);
    finalPrice = basePrice - discount;
  }

  const needsExpand = svc.description && svc.description.length > 80;

  return (
    <div className="service-card" style={{
      background: business.isDark ? '#1e293b' : 'white',
      borderColor: business.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
    }}>
      {isPromoCard && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: -30,
          background: '#fbbf24',
          color: '#78350f',
          padding: '4px 30px',
          fontSize: 10,
          fontWeight: 800,
          boxShadow: '0 4px 10px rgba(251, 191, 36, 0.4)',
          zIndex: 20,
          transform: 'rotate(-45deg)'
        }}>
          DESTACADO
        </div>
      )}
      <div className="service-img-container">
        {svc.imageUrl ? (
          <img src={getImgUrl(svc.imageUrl)} alt={svc.name} className="service-img" />
        ) : (
          <div className="service-img" style={{
            background: `${primary}10`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: primary,
            fontSize: 40
          }}>
            <Zap size={48} />
          </div>
        )}
        {promo && (
          <div className="service-promo-tag" style={{ background: primary }}>
            -{promo.discountType === 'percentage' ? `${Math.round(promo.discountValue)}%` : 'PROMO'}
          </div>
        )}
      </div>
      <div className="service-content">
        <h3 className="service-title" style={{ color: business.isDark ? '#ffffff' : '#0f172a' }}>
          {svc.name}
        </h3>
        <p className={`service-description ${expanded ? 'expanded' : ''}`} style={{
          color: business.isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569'
        }}>
          {svc.description}
        </p>

        {needsExpand && (
          <button
            className="service-ver-mas"
            onClick={onToggle}
            style={{ color: primary }}
          >
            {expanded ? 'Ver menos' : 'Ver más'}
          </button>
        )}

        <div className="service-footer">
          <div className="service-price-row">
            <div>
              {svc.priceOptional ? (
                <span className="service-price" style={{ fontSize: 11, color: primary, fontWeight: 600, lineHeight: 1.2, display: 'inline-block' }}>Valor sujeto a<br />valoración profesional</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {promo && <span className="service-old-price" style={{ fontSize: 13, color: business.isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8', textDecoration: 'line-through', marginBottom: 2 }}>${basePrice.toLocaleString()}</span>}
                  <span className="service-price" style={{ color: primary, fontSize: promo ? 18 : 20 }}>${finalPrice.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="service-meta-text" style={{ flexShrink: 0, textAlign: 'right', color: business.isDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}>
              <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {svc.durationMin} min
            </div>
          </div>

          <button
            className="service-reserve-btn-small"
            style={{ background: primary }}
            onClick={() => navigate(`/${slug}/book?serviceId=${svc.id}`)}
          >
            {business.isTechnicalServices ? 'Solicitar ahora' : 'Reservar Cita'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ServicesSection({ business, primary, secondary, slug, navigate }) {
  const [selectedServiceGroup, setSelectedServiceGroup] = useState(null);
  const [groupServicesPage, setGroupServicesPage] = useState(0);
  const [expandedServices, setExpandedServices] = useState({});
  const servicesPerPage = 10;

  const toggleServiceDescription = (svcId) => {
    setExpandedServices(prev => ({
      ...prev,
      [svcId]: !prev[svcId]
    }));
  };

  const hasGroups = business.ServiceGroups?.length > 0;
  const hasServices = business.Services?.length > 0;

  if (!hasGroups && !hasServices) return null;

  // Separar combos y promos de servicios regulares
  const activeServices = business.Services?.filter(s => s.active !== false) || [];

  const specialServices = activeServices.filter(s => {
    const nameLower = s.name.toLowerCase();
    if (nameLower.includes('combo') || nameLower.includes('promo')) return true;
    // Si el servicio tiene promociones asociadas, también va a la sección destacada
    return s.Promotions && s.Promotions.length > 0;
  });

  const regularServices = activeServices.filter(s => {
    const nameLower = s.name.toLowerCase();
    if (nameLower.includes('combo') || nameLower.includes('promo')) return false;
    return !s.Promotions || s.Promotions.length === 0;
  });

  return (
    <section style={{ marginBottom: 100 }}>
      {/* Combos Destacados */}
      {!selectedServiceGroup && specialServices.length > 0 && (
        <div style={{ 
          marginBottom: 80,
          background: `linear-gradient(135deg, ${primary}15, ${secondary}25)`,
          borderRadius: '40px',
          padding: '40px',
          position: 'relative',
          border: `1px solid ${primary}30`,
          boxShadow: `0 20px 40px -15px ${primary}20`
        }}>
          <style>
            {`
              @keyframes shineText {
                0% { background-position: 200% center; }
                100% { background-position: -200% center; }
              }
              .shimmer-title-text {
                background: linear-gradient(120deg, rgba(255,255,255,0.2) 30%, #ffffff 50%, rgba(255,255,255,0.2) 70%);
                background-size: 200% auto;
                color: transparent;
                -webkit-background-clip: text;
                background-clip: text;
                animation: shineText 2.5s ease-in-out infinite;
                display: inline-block;
                text-shadow: 0 0 20px rgba(255,255,255,0.3);
              }
            `}
          </style>
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: `linear-gradient(135deg, ${primary}, ${secondary})`,
            padding: '8px 30px',
            borderRadius: '30px',
            fontSize: '16px',
            fontWeight: 900,
            letterSpacing: '2px',
            boxShadow: `0 10px 25px ${primary}50`,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'white'
          }}>
            <Zap size={20} color="#fbbf24" fill="#fbbf24" />
            <span className="shimmer-title-text">COMBOS Y PROMOCIONES</span>
            <Zap size={20} color="#fbbf24" fill="#fbbf24" />
          </div>

          <div style={{ marginTop: '20px' }}>
            <div className="services-grid">
              {specialServices.map(svc => (
                <ServiceCard
                  key={`special-${svc.id}`}
                  svc={svc}
                  business={business}
                  primary={primary}
                  navigate={navigate}
                  slug={slug}
                  expanded={expandedServices[svc.id]}
                  onToggle={() => toggleServiceDescription(svc.id)}
                  isPromoCard={true}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="section-header">
        <span className="section-label">NUESTROS SERVICIOS</span>
        <h2 className="section-title" style={{ color: business.isDark ? 'white' : '#0f172a' }}>
          {selectedServiceGroup ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setSelectedServiceGroup(null);
                  setGroupServicesPage(0);
                }}
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: primary
                }}
              >
                <ChevronLeft size={20} />
              </button>
              {selectedServiceGroup.name}
            </span>
          ) : (
            'Experiencias Diseñadas'
          )}
        </h2>
      </div>

      {/* Combos Destacados */}

      {/* Show Groups Grid when no group selected */}
      {!selectedServiceGroup && hasGroups && (
        <div className="services-grid">
          {business.ServiceGroups.map(group => (
            <div
              key={group.id}
              className="service-card"
              onClick={() => {
                setSelectedServiceGroup(group);
                setGroupServicesPage(0);
              }}
              style={{
                cursor: 'pointer',
                background: business.isDark ? '#1e293b' : 'white',
                borderColor: business.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
              }}
            >
              <div className="service-img-container">
                {group.imageUrl ? (
                  <img src={getImgUrl(group.imageUrl)} alt={group.name} className="service-img" />
                ) : (
                  <div className="service-img" style={{
                    background: `linear-gradient(135deg, ${primary}20, ${secondary}20)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: primary,
                    fontSize: 40
                  }}>
                    <FolderOpen size={48} />
                  </div>
                )}
                <div className="service-promo-tag" style={{ background: primary }}>
                  {group.Services?.length || 0} servicios
                </div>
              </div>
              <div className="service-content">
                <h3 className="service-title" style={{ color: business.isDark ? '#ffffff' : '#0f172a' }}>
                  {group.name}
                </h3>
                {group.description && (
                  <p className="service-description" style={{ color: business.isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569' }}>
                    {group.description}
                  </p>
                )}
                <div className="service-footer">
                  <span style={{ color: primary, fontSize: 14, fontWeight: 600 }}>
                    Ver servicios →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show all services when no group selected and no groups exist */}
      {!selectedServiceGroup && !hasGroups && regularServices.length > 0 && (
        <>
          <div className="services-grid">
            {regularServices
              .slice(0, 10)
              .map(svc => (
                <ServiceCard
                  key={svc.id}
                  svc={svc}
                  business={business}
                  primary={primary}
                  navigate={navigate}
                  slug={slug}
                  expanded={expandedServices[svc.id]}
                  onToggle={() => toggleServiceDescription(svc.id)}
                />
              ))}
          </div>

          {regularServices.length > 10 && (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <button
                className="main-cta-btn"
                style={{
                  background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                  color: 'white'
                }}
                onClick={() => navigate(`/${slug}/book`)}
              >
                Ver todos los servicios
              </button>
            </div>
          )}
        </>
      )}

      {/* Show Services in selected Group with pagination */}
      {selectedServiceGroup && (
        <>
          <div className="services-grid">
            {selectedServiceGroup.Services
              ?.filter(s => s.active !== false)
              .slice(groupServicesPage * servicesPerPage, (groupServicesPage + 1) * servicesPerPage)
              .map(svc => (
                <ServiceCard
                  key={svc.id}
                  svc={svc}
                  business={business}
                  primary={primary}
                  navigate={navigate}
                  slug={slug}
                  expanded={expandedServices[svc.id]}
                  onToggle={() => toggleServiceDescription(svc.id)}
                />
              ))}
          </div>

          {/* Pagination for group services */}
          {selectedServiceGroup.Services?.filter(s => s.active !== false).length > servicesPerPage && (
            <div className="pagination-container">
              <button
                className="pagination-btn"
                style={{ color: business.isDark ? 'white' : '#0f172a' }}
                onClick={() => setGroupServicesPage(p => Math.max(0, p - 1))}
                disabled={groupServicesPage === 0}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="pagination-info" style={{ color: business.isDark ? 'white' : '#0f172a' }}>
                Página {groupServicesPage + 1} de {Math.ceil(selectedServiceGroup.Services.filter(s => s.active !== false).length / servicesPerPage)}
              </span>
              <button
                className="pagination-btn"
                style={{ color: business.isDark ? 'white' : '#0f172a' }}
                onClick={() => setGroupServicesPage(p => p + 1)}
                disabled={(groupServicesPage + 1) * servicesPerPage >= selectedServiceGroup.Services.filter(s => s.active !== false).length}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
