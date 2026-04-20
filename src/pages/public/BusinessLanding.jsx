import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  X, 
  Globe, 
  Phone, 
  MapPin, 
  Clock, 
  Calendar,
  Zap,
  Star,
  Users,
  CreditCard,
  ExternalLink,
  FolderOpen
} from 'lucide-react';
import api from '../../api/client';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';

// URL base para imágenes
const API_BASE_URL = api.defaults.baseURL || '/api';
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BACKEND_URL = isLocal ? 'http://localhost:4000' : 'https://api-reservas.k-dice.com';

function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  // Priorizar BACKEND_URL si base es relativo o local
  const base = (api.defaults.baseURL && !api.defaults.baseURL.startsWith('/'))
    ? api.defaults.baseURL.replace('/api', '')
    : BACKEND_URL;
  return `${base}${cleanUrl}`;
}

// Convierte URL de Google Maps a formato embed
function getGoogleMapsEmbedUrl(url) {
  if (!url) return null;

  // Si ya es una URL de embed, retornarla
  if (url.includes('/embed')) return url;

  // Si es una URL corta de Google Maps (maps.app.goo.gl o goo.gl/maps/...)
  // Estas URLs no funcionan en iframes, deben abrirse directamente
  if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
    return { isShortUrl: true, url };
  }

  // Si es una URL de lugar (google.com/maps/place/...)
  if (url.includes('google.com/maps/place')) {
    // Extraer coordenadas si están disponibles en la URL
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      const lat = coordMatch[1];
      const lng = coordMatch[2];
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0!2z${lat},${lng}!5e0!3m2!1ses!2sco!4v1`;
    }

    // Extraer el query parameter 'q' si existe
    try {
      const urlObj = new URL(url);
      const q = urlObj.searchParams.get('q');
      if (q) {
        return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0!2s${encodeURIComponent(q)}!5e0!3m2!1ses!2sco!4v1`;
      }
    } catch (e) {
      // URL inválida, continuar
    }

    // Extraer el nombre del lugar de la URL
    const placeMatch = url.match(/\/place\/([^/@]+)/);
    if (placeMatch) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0!2s${encodeURIComponent(placeName)}!5e0!3m2!1ses!2sco!4v1`;
    }
  }

  return url;
}

// Verifica si la URL es una URL corta que no funciona en iframe
function isShortGoogleMapsUrl(url) {
  if (!url) return false;
  return url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps');
}

function SocialLink({ href, iconUrl, label, color, invert, hoverColor }) {
  if (!href) return null;
  const url = href.startsWith('http') ? href : `https://${href}`;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={label}
      className="social-sidebar-link"
      style={{
        '--link-color': color,
        backgroundColor: isHovered && hoverColor ? hoverColor : undefined
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {iconUrl && <img src={iconUrl} alt={label} style={{ width: 20, height: 20, filter: invert ? 'invert(1)' : 'none' }} />}
    </a>
  );
}

function GalleryModal({ images, index, onClose }) {
  const [current, setCurrent] = useState(index);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrent(c => Math.min(c + 1, images.length - 1));
      if (e.key === 'ArrowLeft') setCurrent(c => Math.max(c - 1, 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="gallery-modal-content" onClick={e => e.stopPropagation()}>
        <img
          src={getImgUrl(images[current])}
          alt={`Galería ${current + 1}`}
          className="gallery-main-img"
        />
        
        <div className="gallery-controls">
          <button
            onClick={() => setCurrent(c => Math.max(c - 1, 0))}
            disabled={current === 0}
            className="gallery-nav-btn"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="gallery-counter">
            {current + 1} / {images.length}
          </span>
          <button
            onClick={() => setCurrent(c => Math.min(c + 1, images.length - 1))}
            disabled={current === images.length - 1}
            className="gallery-nav-btn"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <button onClick={onClose} className="modal-close-btn">
          <X size={24} />
        </button>
      </div>
    </div>
  );
}

function EmployeeModal({ emp, onClose, primary, colors, navigate, slug }) {
  if (!emp) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="employee-modal-content" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn-alt">
          <X size={20} />
        </button>
        
        <div className="employee-modal-header">
          {emp.photoUrl ? (
            <img src={getImgUrl(emp.photoUrl)} alt={emp.User?.name} className="employee-modal-img" />
          ) : (
            <div className="employee-modal-avatar-placeholder" style={{ backgroundColor: `${primary}20`, color: primary }}>
              {emp.User?.name?.charAt(0)}
            </div>
          )}
          <div className="employee-modal-header-overlay" />
          <div className="employee-modal-info">
            <h3 className="employee-modal-name">{emp.User?.name}</h3>
            <div className="employee-modal-badge" style={{ backgroundColor: primary }}>
              {emp.specialty || (emp.isManager ? 'Administrador' : 'Especialista')}
            </div>
          </div>
        </div>
        
        <div className="employee-modal-body">
          {emp.description && (
            <>
              <h4 className="employee-modal-section-title" style={{ color: colors.text }}>Sobre mí</h4>
              <p className="employee-modal-description" style={{ color: colors.textSecondary }}>
                {emp.description}
              </p>
            </>
          )}
          
          <button 
            className="employee-modal-cta"
            style={{ background: `linear-gradient(135deg, ${primary}, ${primary}dd)`, boxShadow: `0 10px 20px ${primary}30` }}
            onClick={() => {
              onClose();
              navigate(`/${slug}/book?employeeId=${emp.id}`);
            }}
          >
            Reservar con {emp.User?.name?.split(' ')[0] || (emp.specialty || 'especialista')}
          </button>        </div>
      </div>
    </div>
  );
}

export default function BusinessLanding() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDark, colors } = useTheme();
  
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = '';
  const [galleryModal, setGalleryModal] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [employeeModal, setEmployeeModal] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [servicesPage, setServicesPage] = useState(0);
  const [expandedServices, setExpandedServices] = useState({});
  const [expandedMission, setExpandedMission] = useState(false);
  const [expandedVision, setExpandedVision] = useState(false);
  const [selectedServiceGroup, setSelectedServiceGroup] = useState(null);
  const [groupServicesPage, setGroupServicesPage] = useState(0);
  const servicesPerPage = 10;

  // Estado para formulario de reseñas
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  
  // Auto-abrir formulario de reseña si viene ?review=true
  useEffect(() => {
    const shouldReview = searchParams.get('review');
    if (shouldReview === 'true') {
      setShowReviewForm(true);
    }
  }, [searchParams]);

  const MAX_TEXT_LENGTH = 150; // Caracteres máximos antes de mostrar Leer más

  const toggleServiceDescription = (svcId) => {
    setExpandedServices(prev => ({
      ...prev,
      [svcId]: !prev[svcId]
    }));
  };

  // Render a service card
  const renderServiceCard = (svc) => {
    const promo = svc.Promotions && svc.Promotions.length > 0 ? svc.Promotions[0] : null;
    const basePrice = Number(svc.price);
    let finalPrice = basePrice;
    if (promo) {
      const discount = promo.discountType === 'percentage' ? basePrice * (Number(promo.discountValue) / 100) : Number(promo.discountValue);
      finalPrice = basePrice - discount;
    }

    return (
      <div key={svc.id} className="service-card">
        <div className="service-img-container">
          {svc.imageUrl ? (
            <img src={getImgUrl(svc.imageUrl)} alt={svc.name} className="service-img" />
          ) : (
            <div className="service-img" style={{ background: '#3b82f610', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: 40 }}><Zap size={48} /></div>
          )}
          {promo && <div className="service-promo-tag">-{promo.discountType === 'percentage' ? `${Math.round(promo.discountValue)}%` : 'PROMO'}</div>}
        </div>
        <div className="service-content">
          <h3 className="service-title">{svc.name}</h3>
          <p className={`service-description ${expandedServices[svc.id] ? 'expanded' : ''}`}>
            {svc.description}
          </p>
          
          {svc.description && svc.description.length > 80 && (
            <button 
              className="service-ver-mas" 
              onClick={() => toggleServiceDescription(svc.id)}
            >
              {expandedServices[svc.id] ? 'Ver menos' : 'Ver más'}
            </button>
          )}
          
          <div className="service-footer">
            <div className="service-price-row">
              <div>
                {svc.priceOptional ? (
                  <span className="service-price" style={{ fontSize: 14 }}>A cotizar</span>
                ) : (
                  <div>
                    {promo && <span className="service-old-price">${basePrice.toLocaleString()}</span>}
                    <span className="service-price">${finalPrice.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="service-meta-text">
                <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {svc.durationMin} min
              </div>
            </div>

            <button 
              className="service-reserve-btn-small" 
              onClick={() => navigate(`/${slug}/book?serviceId=${svc.id}`)}
            >
              {business.isTechnicalServices ? 'Solicitar ahora' : 'Reservar Cita'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Función para enviar reseña
  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewRating) return;
    
    setIsSubmittingReview(true);
    try {
      await api.post(`/businesses/${slug}/reviews`, {
        clientName: reviewName || 'Cliente Anónimo',
        rating: reviewRating,
        comment: reviewComment
      });
      
      setReviewSuccess(true);
      setShowReviewForm(false);
      setReviewName('');
      setReviewRating(5);
      setReviewComment('');
      
      // Recargar el negocio para mostrar la nueva reseña
      const r = await api.get(`/businesses/${slug}/public`);
      setBusiness(r.data);
      
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      alert('Error al enviar la reseña. Intenta de nuevo.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    api.get(`/businesses/${slug}/public`)
      .then(r => {
        if (!r.data || !r.data.id) {
          setError('Negocio no encontrado');
        } else {
          const data = r.data;
          if (typeof data.paymentMethods === 'string') {
            try {
              data.paymentMethods = JSON.parse(data.paymentMethods || '[]');
            } catch(e) {
              data.paymentMethods = [];
            }
          }
          setBusiness(data);
        }
      })
      .catch(e => {
        setError(e.response?.status === 404 ? 'Negocio no encontrado' : 'Error al cargar el negocio');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className={`page-loading-screen ${isDark ? 'dark' : ''}`}>
      <div className="loading-spinner-container">
        <div className="loading-spinner" />
        <p>Cargando experiencias...</p>
      </div>
    </div>
  );

  if (error || !business) return (
    <div className={`page-error-screen ${isDark ? 'dark' : ''}`}>
      <div className="error-content">
        <div className="error-icon">🔍</div>
        <h2 className="error-title">No encontrado</h2>
        <p className="error-msg">El negocio que buscas no está disponible actualmente.</p>
        <button className="error-retry-btn" onClick={() => navigate('/')}>Volver al inicio</button>
      </div>
    </div>
  );

  const primary = business.primaryColor || '#667eea';
  const secondary = business.secondaryColor || '#764ba2';
  const hasWhatsapp = !!business.whatsapp;
  const hasWhatsappCatalog = !!business.whatsappCatalog;
  const whatsappNum = business.whatsapp ? business.whatsapp.replace(/\D/g, '') : '';
  const hasSocials = !!(business.instagram || business.facebook || business.tiktok || business.twitter || business.pinterest || business.youtube || business.website || business.whatsappCatalog);

  // Parsear galería - puede venir como string JSON o como array
  let gallery = [];
  if (business.gallery) {
    if (typeof business.gallery === 'string') {
      try { gallery = JSON.parse(business.gallery); } catch (e) { gallery = []; }
    } else if (Array.isArray(business.gallery)) {
      gallery = business.gallery;
    }
  }

  // Parsear paymentMethods - puede venir como string JSON o como array
  let paymentMethods = [];
  if (business.paymentMethods) {
    if (typeof business.paymentMethods === 'string') {
      try { paymentMethods = JSON.parse(business.paymentMethods); } catch (e) { paymentMethods = []; }
    } else if (Array.isArray(business.paymentMethods)) {
      paymentMethods = business.paymentMethods;
    }
  }

  const getPaymentMethodImage = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('nequi')) return '/nequi.png';
    if (lower.includes('daviplata')) return '/daviplat.png';
    if (lower.includes('llave') || lower.includes('breb-b') ||
        lower.includes('bre-b') || lower.includes('breb')) return '/Bre-B.png';
    if (lower.includes('davivienda')) return '/davivienda.png';
    if (lower.includes('bancolombia')) return '/bancolombia.png';
    if (lower.includes('banco')) return '/banco.png';
    return null;
  };

  return (
    <div className={`landing-root ${isDark ? 'dark' : ''}`} style={{ '--brand-primary': primary, '--brand-secondary': secondary }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        :root {
          --jakarta: 'Plus Jakarta Sans', sans-serif;
          --glass-bg: rgba(255, 255, 255, 0.75);
          --glass-border: rgba(255, 255, 255, 0.4);
          --card-shadow: 0 20px 50px -12px rgba(0,0,0,0.08);
          --accent-gradient: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
          --section-spacing: 120px;
        }
        
        .landing-root.dark {
          --glass-bg: rgba(15, 23, 42, 0.8);
          --glass-border: rgba(255, 255, 255, 0.1);
          --card-shadow: 0 20px 50px -12px rgba(0,0,0,0.4);
        }

        .landing-root {
          font-family: var(--jakarta);
          min-height: 100vh;
          background: ${isDark
            ? 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #1e293b 100%)'
            : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 30%, #e2e8f0 70%, #f8fafc 100%)'
          };
          color: ${isDark ? '#f1f5f9' : '#0f172a'};
          transition: background 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          scroll-behavior: smooth;
          overflow-x: hidden;
          position: relative;
        }
        .landing-root::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${isDark
            ? 'radial-gradient(ellipse at 20% 30%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)'
            : 'radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.03) 0%, transparent 40%), radial-gradient(ellipse at 80% 60%, rgba(139, 92, 246, 0.02) 0%, transparent 40%), radial-gradient(ellipse at 50% 100%, rgba(59, 130, 246, 0.02) 0%, transparent 50%)'
          };
          pointer-events: none;
          z-index: 0;
        }

        /* SIDEBAR SOCIALS */
        .social-sidebar {
          display: none;
        }
        @media (min-width: 1280px) {
          .social-sidebar {
            display: flex;
            flex-direction: column;
            gap: 12px;
            position: fixed;
            left: 40px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 50;
          }
        }
        .social-sidebar-link {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          color: var(--link-color);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 8px 20px rgba(0,0,0,0.05);
        }
        .social-sidebar-link:hover {
          transform: scale(1.15) translateX(10px);
          background: var(--link-color);
          color: white;
          border-color: transparent;
        }

        /* HERO */
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 24px;
          overflow: hidden;
          background: ${business.bannerUrl ? `url(${getImgUrl(business.bannerUrl)}) center/cover no-repeat fixed` : 'var(--accent-gradient)'};
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: ${isDark 
            ? 'linear-gradient(180deg, rgba(2, 6, 23, 0.8) 0%, rgba(2, 6, 23, 0.4) 50%, rgba(2, 6, 23, 0.95) 100%)' 
            : 'linear-gradient(180deg, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.3) 50%, rgba(15, 23, 42, 0.8) 100%)'};
          z-index: 1;
        }
        .hero-content {
          position: relative;
          z-index: 10;
          max-width: 900px;
          text-align: center;
          color: white;
          animation: fadeUp 1s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .hero-logo-container {
          width: 140px;
          height: 140px;
          margin: 0 auto 40px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 44px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          transform: rotate(-2deg);
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .hero-logo-container:hover {
          transform: rotate(0deg) scale(1.05);
        }
        .hero-logo {
          width: 100%;
          height: 100%;
          border-radius: 36px;
          object-fit: cover;
          background: white;
        }
        .hero-title {
          font-size: clamp(48px, 10vw, 84px);
          font-weight: 900;
          letter-spacing: -4px;
          line-height: 1;
          margin-bottom: 24px;
          text-shadow: 0 10px 30px rgba(0,0,0,0.3);
          background: linear-gradient(to bottom, #ffffff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-tagline {
          font-size: clamp(18px, 4vw, 24px);
          opacity: 0.95;
          margin-bottom: 56px;
          font-weight: 500;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          letter-spacing: -0.5px;
        }
        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
        }
        .main-cta-btn {
          padding: 20px 48px;
          background: white;
          color: #020617;
          font-weight: 800;
          font-size: 18px;
          border-radius: 20px;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          box-shadow: 0 20px 40px -15px rgba(255,255,255,0.4);
          border: none;
          cursor: pointer;
        }
        .main-cta-btn:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 30px 60px -15px rgba(255,255,255,0.5);
        }
        .secondary-cta-btn {
          padding: 20px 48px;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          color: white;
          font-weight: 700;
          font-size: 18px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          cursor: pointer;
        }
        .secondary-cta-btn:hover {
          background: rgba(255,255,255,0.15);
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.4);
        }


        /* CARDS & SECTIONS */
        .content-container {
          max-width: 1200px;
          margin: -100px auto 0;
          padding: 0 24px var(--section-spacing);
          position: relative;
          z-index: 20;
        }
        .section-card {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border-radius: 40px;
          padding: 60px;
          margin-bottom: 40px;
          box-shadow: ${isDark
            ? '0 25px 60px -15px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : `0 25px 60px -15px ${primary}25, 0 8px 24px -8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)`
          };
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : `${primary}20`};
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          position: relative;
          overflow: hidden;
        }
        .section-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, ${isDark ? 'rgba(255,255,255,0.03)' : `${primary}08`}, transparent);
          transition: left 0.6s ease;
        }
        .section-card:hover::before {
          left: 100%;
        }
        .section-card:hover {
          transform: translateY(-6px);
          box-shadow: ${isDark
            ? '0 35px 70px -15px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
            : `0 35px 70px -15px ${primary}35, 0 12px 32px -10px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.95)`
          };
          border-color: ${isDark ? 'rgba(255, 255, 255, 0.2)' : `${primary}40`};
        }
        .section-header {
          margin-bottom: 48px;
          text-align: center;
        }
        .section-label {
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 4px;
          color: var(--brand-primary);
          margin-bottom: 12px;
          display: block;
        }
        .section-title {
          font-size: clamp(32px, 5vw, 44px);
          font-weight: 900;
          letter-spacing: -2px;
          line-height: 1.1;
        }

        /* MISSION & VISION MODERN */
        .mv-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
          margin-top: 60px;
          margin-bottom: 80px;
        }
        .mv-card {
          background: ${isDark
            ? `linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(30, 41, 59, 0.9) 100%)`
            : `linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, ${primary}08 50%, rgba(248, 250, 252, 0.98) 100%)`
          };
          backdrop-filter: blur(20px);
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : `${primary}25`};
          border-radius: 40px;
          padding: 48px;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          position: relative;
          overflow: hidden;
          box-shadow: ${isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : `0 25px 50px -12px ${primary}20, inset 0 1px 0 rgba(255, 255, 255, 0.8)`
          };
        }
        .mv-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, ${primary}15 0%, transparent 70%);
          pointer-events: none;
        }
        .mv-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, ${primary}, transparent);
          opacity: 0.6;
        }
        .mv-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: ${isDark
            ? '0 35px 60px -15px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
            : `0 35px 60px -15px ${primary}35, inset 0 1px 0 rgba(255, 255, 255, 0.9)`
          };
          border-color: ${isDark ? 'rgba(255, 255, 255, 0.25)' : `${primary}40`};
        }
        .mv-icon {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: linear-gradient(135deg, ${primary} 0%, ${secondary} 100%);
          color: white;
          display: flex;
          alignItems: center;
          justifyContent: center;
          margin-bottom: 28px;
          box-shadow: 0 15px 30px -10px ${primary}60;
          position: relative;
          z-index: 1;
        }
        .mv-card:nth-child(2) .mv-icon {
          background: linear-gradient(135deg, ${secondary} 0%, ${primary} 100%);
          box-shadow: 0 15px 30px -10px ${secondary}60;
        }
        .mv-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 16px;
          letter-spacing: -1px;
          color: ${isDark ? 'white' : '#0f172a'};
        }
        .mv-text {
          font-size: 16px;
          line-height: 1.7;
          opacity: 0.8;
          color: ${isDark ? 'rgba(255,255,255,0.7)' : '#334155'};
          position: relative;
          z-index: 1;
        }
        .mv-text-truncated {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .mv-read-more {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 12px;
          padding: 8px 16px;
          background: ${primary}15;
          border: 1px solid ${primary}30;
          border-radius: 20px;
          color: ${primary};
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }
        .mv-read-more:hover {
          background: ${primary};
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px ${primary}40;
        }

        /* INFO GRID */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 80px;
          align-items: stretch;
        }
        .info-card {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 32px;
          padding: 32px;
          display: flex;
          align-items: flex-start;
          gap: 24px;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          height: 100%;
        }
        .info-card:hover {
          transform: translateY(-5px);
          background: ${isDark ? 'rgba(30, 41, 59, 0.9)' : 'white'};
        }
        .info-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: var(--brand-primary);
          color: white;
          margin-top: 4px;
        }
        .info-label {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
          opacity: 0.5;
          margin-bottom: 8px;
        }
        .info-value {
          font-weight: 700;
          font-size: 15px;
          line-height: 1.5;
          color: ${isDark ? 'white' : '#0f172a'};
          white-space: pre-line;
        }

        /* MODALS */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: fadeIn 0.3s ease;
        }
        .gallery-modal-content {
          position: relative;
          max-width: 1100px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .gallery-main-img {
          max-height: 75vh;
          max-width: 100%;
          object-fit: contain;
          border-radius: 24px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
          border: 4px solid rgba(255,255,255,0.1);
        }
        .gallery-controls {
          display: flex;
          align-items: center;
          gap: 32px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          padding: 12px 24px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
        }
        .gallery-nav-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: white;
          color: #020617;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
        }
        .gallery-nav-btn:hover:not(:disabled) {
          transform: scale(1.1);
          background: var(--brand-primary);
          color: white;
        }
        .gallery-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .gallery-counter {
          font-weight: 800;
          font-size: 16px;
          min-width: 60px;
          text-align: center;
          letter-spacing: 1px;
        }
        .modal-close-btn {
          position: absolute;
          top: -60px;
          right: 0;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }
        .modal-close-btn:hover {
          background: #ef4444;
          border-color: transparent;
          transform: rotate(90deg);
        }

        .employee-modal-content {
          background: ${isDark ? '#1e293b' : 'white'};
          width: 100%;
          max-width: 480px;
          border-radius: 40px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.5);
          animation: modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
        }
        .modal-close-btn-alt {
          position: absolute;
          top: 24px;
          right: 24px;
          z-index: 50;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: rgba(0,0,0,0.2);
          backdrop-filter: blur(10px);
          color: white;
          border: none;
          display: flex; 
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .modal-close-btn-alt:hover {
          background: rgba(239, 68, 68, 0.8);
          transform: scale(1.1);
        }
        .employee-modal-header {
          height: 320px;
          position: relative;
        }
        .employee-modal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
        }
        .employee-modal-avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 80px;
          font-weight: 800;
        }
        .employee-modal-header-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, ${isDark ? '#1e293b' : 'white'} 0%, transparent 70%);
        }
        .employee-modal-info {
          position: absolute;
          bottom: 24px;
          left: 32px;
          right: 32px;
          color: ${isDark ? 'white' : '#0f172a'};
        }
        .employee-modal-name {
          font-size: 32px;
          font-weight: 900;
          margin-bottom: 8px;
          letter-spacing: -1px;
        }
        .employee-modal-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: white;
        }
        .employee-modal-body {
          padding: 40px;
        }
        .employee-modal-section-title {
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 12px;
          opacity: 0.5;
        }
        .employee-modal-description {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .employee-modal-cta {
          width: 100%;
          padding: 20px;
          border-radius: 20px;
          color: white;
          border: none;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .employee-modal-cta:hover {
          transform: translateY(-4px) scale(1.02);
        }

        /* PROMOTIONS MODERN */
        .promo-section {
          background: ${isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.5)'};
          padding: 80px 40px;
          border-radius: 50px;
          margin-bottom: 80px;
          border: 1px dashed ${isDark ? 'rgba(255,255,255,0.2)' : 'var(--brand-primary)'};
          position: relative;
        }
        .promo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
        }
        .promo-card {
          background: ${isDark ? '#1e293b' : 'white'};
          border-radius: 32px;
          padding: 32px;
          display: flex;
          align-items: center;
          gap: 24px;
          box-shadow: var(--card-shadow);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'transparent'};
        }
        .promo-card:hover {
          transform: translateY(-8px) rotate(1deg);
          border-color: var(--brand-primary);
          box-shadow: 0 30px 60px -20px rgba(0,0,0,0.2);
        }
        .promo-badge {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          animation: pulse-glow 2s infinite;
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.4);
        }
        .promo-value {
          font-size: 24px;
          font-weight: 900;
          line-height: 1;
        }
        .promo-type {
          font-size: 11px;
          font-weight: 800;
        }
        .promo-info h3 {
          color: ${isDark ? 'white' : '#0f172a'};
          font-weight: 800;
          font-size: 18px;
          margin-bottom: 4px;
        }
        .promo-info p {
          color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15, 23, 42, 0.7)'};
          font-size: 13px;
          line-height: 1.4;
        }

        /* SERVICES */
        .services-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
          align-items: stretch;
        }
        .service-card {
          background: ${isDark ? '#1e293b' : 'white'};
          border-radius: 32px;
          padding: 0;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
        }
        .service-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px -15px rgba(0,0,0,0.15);
          border-color: var(--brand-primary);
        }
        .service-img-container {
          width: 100%;
          aspect-ratio: 16 / 11;
          overflow: hidden;
          position: relative;
        }
        .service-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .service-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .service-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 12px;
          color: ${isDark ? '#ffffff' : '#0f172a'};
          line-height: 1.3;
        }
        .service-description {
          font-size: 13px;
          color: ${isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569'};
          line-height: 1.6;
          margin-bottom: 12px;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .service-description.expanded {
          -webkit-line-clamp: unset;
          display: block;
          overflow: visible;
        }
        .read-more-btn {
          background: none;
          border: none;
          color: var(--brand-primary);
          font-size: 12px;
          font-weight: 800;
          padding: 0;
          margin-bottom: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }
        .read-more-btn:hover {
          opacity: 0.8;
          text-decoration: underline;
        }
        .service-ver-mas {
          background: none;
          border: none;
          color: var(--brand-primary);
          font-size: 12px;
          font-weight: 700;
          padding: 0;
          margin: -8px 0 12px 0;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }
        .service-ver-mas:hover {
          opacity: 0.8;
          text-decoration: underline;
        }
        .service-footer {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
        }
        .service-price-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 8px;
          margin-bottom: 16px;
        }
        .service-price {
          font-size: 19px;
          font-weight: 900;
          color: var(--brand-primary);
          line-height: 1;
        }
        .service-old-price {
          font-size: 13px;
          color: ${isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'};
          text-decoration: line-through;
          margin-right: 4px;
          display: block;
          margin-bottom: 2px;
        }
        .service-meta-text {
          color: ${isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
          font-size: 11px;
          font-weight: 700;
          text-align: right;
          white-space: nowrap;
          background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
          padding: 4px 8px;
          border-radius: 8px;
        }
        .service-reserve-btn-small {
          width: 100%;
          padding: 14px;
          background: var(--brand-primary);
          color: white;
          font-weight: 800;
          font-size: 14px;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 8px 20px var(--brand-primary)40;
        }
        .service-reserve-btn-small:hover {
          background: var(--brand-primary);
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 12px 25px var(--brand-primary)60;
        }

        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 48px;
        }
        .pagination-btn {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          color: ${isDark ? 'white' : '#0f172a'};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .pagination-btn:hover:not(:disabled) {
          background: var(--brand-primary);
          color: white;
          transform: scale(1.1);
        }
        .pagination-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .pagination-info {
          font-weight: 700;
          font-size: 15px;
          opacity: 0.7;
        }

        /* TEAM */
        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 40px;
        }
        .team-member-card {
          background: var(--glass-bg);
          border-radius: 40px;
          padding: 40px 24px;
          text-align: center;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid var(--glass-border);
          cursor: pointer;
        }
        .team-member-card:hover {
          transform: translateY(-16px) scale(1.02);
          background: ${isDark ? 'rgba(30, 41, 59, 0.9)' : 'white'};
          box-shadow: 0 40px 80px -25px rgba(0,0,0,0.15);
        }
        .team-avatar-container {
          width: 140px;
          height: 140px;
          margin: 0 auto 28px;
          position: relative;
        }
        .team-avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 48px;
          object-fit: cover;
          object-position: center top;
          border: 4px solid white;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          transition: all 0.5s ease;
        }
        .team-member-card:hover .team-avatar-img {
          border-radius: 32px;
          transform: rotate(-5deg);
        }

        .team-member-name {
          color: ${isDark ? 'white' : '#0f172a'};
          font-weight: 800;
          font-size: 20px;
          margin-bottom: 8px;
        }
        .team-member-role {
          color: var(--brand-primary);
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* GALLERY - UNIFORM SQUARE STYLE */
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }

        .gallery-item {
          position: relative;
          aspect-ratio: 1 / 1;
          border-radius: 24px;
          overflow: hidden;
          cursor: pointer;
          background: ${isDark ? '#1e293b' : '#ffffff'};
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
        }
        
        .gallery-item:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px -15px rgba(0,0,0,0.25);
          border-color: var(--brand-primary);
          z-index: 10;
        }

        .gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.8s ease;
        }

        .gallery-item:hover .gallery-img {
          transform: scale(1.1);
        }

        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: var(--brand-primary);
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .gallery-item:hover .gallery-overlay {
          opacity: 0.2;
        }

        .gallery-view-icon {
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brand-primary);
          transform: scale(0.8);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .gallery-item:hover .gallery-view-icon {
          transform: scale(1);
        }

        @media (max-width: 1200px) {
          .gallery-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 1024px) {
          .gallery-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .gallery-grid { 
            grid-template-columns: repeat(2, 1fr);
            gap: 12px; 
          }
          .gallery-item { border-radius: 18px; }
        }

        /* 3D CAROUSEL - STACK/COVERFLOW EFFECT */
        .carousel-3d-container {
          position: relative;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 30px 0 60px;
          perspective: 1200px;
          overflow: hidden;
          user-select: none;
        }

        .carousel-3d-track {
          position: relative;
          width: 100%;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
        }

        .carousel-3d-card {
          position: absolute;
          width: 280px;
          height: 360px;
          border-radius: 18px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 15px 35px -8px rgba(0,0,0,0.3);
          background: ${isDark ? '#1e293b' : '#ffffff'};
          border: 2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
          /* Default for offset 0 (center) */
          transform: translateX(0) translateZ(0) rotateY(0) scale(1);
          opacity: 1;
          filter: blur(0);
        }

        /* Cards behind (-1, -2, -3...) - más cercanas y visibles */
        .carousel-3d-card[data-offset="-1"] {
          transform: translateX(-140px) translateZ(-60px) rotateY(20deg) scale(0.88);
          opacity: 0.75;
          filter: blur(0.5px);
        }
        .carousel-3d-card[data-offset="-2"] {
          transform: translateX(-260px) translateZ(-120px) rotateY(30deg) scale(0.75);
          opacity: 0.45;
          filter: blur(1px);
        }
        .carousel-3d-card[data-offset="-3"],
        .carousel-3d-card[data-offset="-4"],
        .carousel-3d-card[data-offset="-5"] {
          transform: translateX(-340px) translateZ(-160px) rotateY(40deg) scale(0.6);
          opacity: 0.2;
          filter: blur(2px);
        }

        /* Cards ahead (1, 2, 3...) - más cercanas y visibles */
        .carousel-3d-card[data-offset="1"] {
          transform: translateX(140px) translateZ(-60px) rotateY(-20deg) scale(0.88);
          opacity: 0.75;
          filter: blur(0.5px);
        }
        .carousel-3d-card[data-offset="2"] {
          transform: translateX(260px) translateZ(-120px) rotateY(-30deg) scale(0.75);
          opacity: 0.45;
          filter: blur(1px);
        }
        .carousel-3d-card[data-offset="3"],
        .carousel-3d-card[data-offset="4"],
        .carousel-3d-card[data-offset="5"] {
          transform: translateX(340px) translateZ(-160px) rotateY(-40deg) scale(0.6);
          opacity: 0.2;
          filter: blur(2px);
        }

        /* Active card (offset 0) */
        .carousel-3d-card[data-offset="0"] {
          transform: translateX(0) translateZ(0) rotateY(0) scale(1);
          opacity: 1;
          filter: blur(0);
          box-shadow: 0 30px 60px -15px rgba(0,0,0,0.4);
          z-index: 100;
        }

        .carousel-3d-card:hover {
          box-shadow: 0 40px 80px -15px rgba(0,0,0,0.4);
        }

        .carousel-3d-card[data-offset="0"]:hover {
          transform: translateX(0) translateZ(30px) rotateY(0) scale(1.03);
        }

        .carousel-3d-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }

        .carousel-3d-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5) 100%);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 25px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .carousel-3d-card[data-offset="0"]:hover .carousel-3d-overlay {
          opacity: 1;
        }

        .carousel-view-btn {
          background: white;
          color: var(--brand-primary);
          padding: 10px 20px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          font-size: 13px;
          transform: translateY(15px);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }

        .carousel-3d-card[data-offset="0"]:hover .carousel-view-btn {
          transform: translateY(0);
        }

        /* Navigation Buttons */
        .carousel-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: ${isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)'};
          border: 2px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'};
          color: var(--brand-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 200;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }

        .carousel-nav-btn:hover {
          background: var(--brand-primary);
          color: white;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 8px 25px rgba(0,0,0,0.25);
        }

        .carousel-nav-btn.prev { left: 15px; }
        .carousel-nav-btn.next { right: 15px; }

        /* Progress Dots */
        .carousel-dots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 200;
          padding: 8px 16px;
          background: ${isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.7)'};
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .carousel-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          background: ${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.25)'};
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .carousel-dot.active {
          background: var(--brand-primary);
          width: 24px;
          border-radius: 4px;
        }

        .carousel-dot:hover {
          background: ${isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)'};
        }

        /* Counter */
        .carousel-counter {
          position: absolute;
          top: 10px;
          right: 20px;
          background: ${isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)'};
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 13px;
          color: ${isDark ? '#fff' : '#1e293b'};
          backdrop-filter: blur(10px);
          z-index: 200;
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
        }

        .carousel-counter .current {
          color: var(--brand-primary);
          font-size: 16px;
        }

        .carousel-counter .separator {
          margin: 0 4px;
          opacity: 0.5;
        }

        .carousel-counter .total {
          opacity: 0.6;
        }

        /* Responsive 3D Carousel */
        @media (max-width: 768px) {
          .carousel-3d-track { height: 340px; }
          .carousel-3d-card { width: 240px; height: 300px; }
          .carousel-3d-card[data-offset="-1"] { transform: translateX(-120px) translateZ(-50px) rotateY(22deg) scale(0.86); opacity: 0.7; }
          .carousel-3d-card[data-offset="1"] { transform: translateX(120px) translateZ(-50px) rotateY(-22deg) scale(0.86); opacity: 0.7; }
          .carousel-3d-card[data-offset="-2"] { transform: translateX(-220px) translateZ(-100px) rotateY(32deg) scale(0.72); opacity: 0.4; }
          .carousel-3d-card[data-offset="2"] { transform: translateX(220px) translateZ(-100px) rotateY(-32deg) scale(0.72); opacity: 0.4; }
        }

        @media (max-width: 640px) {
          .carousel-3d-container { padding: 20px 0 50px; }
          .carousel-3d-track { height: 320px; }
          .carousel-3d-card { 
            width: 220px; 
            height: 280px; 
            border-radius: 16px;
          }
          /* Mostrar tarjetas laterales más prominentes */
          .carousel-3d-card[data-offset="-1"] { 
            transform: translateX(-100px) translateZ(-40px) rotateY(25deg) scale(0.82); 
            opacity: 0.6;
          }
          .carousel-3d-card[data-offset="1"] { 
            transform: translateX(100px) translateZ(-40px) rotateY(-25deg) scale(0.82); 
            opacity: 0.6;
          }
          .carousel-3d-card[data-offset="-2"] { 
            transform: translateX(-160px) translateZ(-80px) rotateY(40deg) scale(0.65); 
            opacity: 0.3; 
          }
          .carousel-3d-card[data-offset="2"] { 
            transform: translateX(160px) translateZ(-80px) rotateY(-40deg) scale(0.65); 
            opacity: 0.3; 
          }
          .carousel-nav-btn {
            width: 36px;
            height: 36px;
          }
          .carousel-nav-btn.prev { left: 8px; }
          .carousel-nav-btn.next { right: 8px; }
          .carousel-nav-btn svg { width: 20px; height: 20px; }
          .carousel-counter {
            top: 8px;
            right: 12px;
            font-size: 12px;
            padding: 5px 12px;
          }
        }

        /* WHATSAPP FLOAT */
        .whatsapp-float {
          position: fixed;
          bottom: 40px;
          right: 40px;
          width: 72px;
          height: 72px;
          background: #25d366;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 20px 40px rgba(37,211,102,0.4);
          z-index: 100;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .whatsapp-float:hover {
          transform: scale(1.1) rotate(10deg);
          box-shadow: 0 30px 60px rgba(37,211,102,0.5);
        }

        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 ${primary}60; }
          70% { box-shadow: 0 0 0 15px ${primary}00; }
          100% { box-shadow: 0 0 0 0 ${primary}00; }
        }

        @keyframes fadeUp { 
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(60px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 768px) {
          .landing-root { overflow-x: hidden; width: 100vw; }
          .hero-section { min-height: 80vh; padding: 60px 16px; }
          .hero-title { font-size: 42px; letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 16px; }
          .hero-tagline { font-size: 16px; margin-bottom: 32px; padding: 0 10px; }
          .hero-logo-container { width: 110px; height: 110px; margin-bottom: 24px; }
          .hero-actions { flex-direction: column; width: 100%; max-width: 280px; margin: 0 auto; gap: 12px; }
          .main-cta-btn, .secondary-cta-btn { width: 100%; padding: 16px 20px; font-size: 16px; border-radius: 16px; }
          
          .content-container { margin-top: -40px; padding: 0 16px 80px; width: 100%; box-sizing: border-box; }
          .section-card { padding: 32px 20px; border-radius: 24px; margin-bottom: 24px; width: 100%; box-sizing: border-box; }
          .section-title { font-size: 26px; letter-spacing: -1px; }
          
          .info-grid { grid-template-columns: 1fr; gap: 12px; margin-bottom: 40px; }
          .info-card { padding: 20px; border-radius: 20px; }
          
          .promo-section { padding: 40px 16px; border-radius: 32px; margin-bottom: 60px; width: 100%; box-sizing: border-box; }
          .promo-grid { gap: 16px; grid-template-columns: 1fr; }
          .promo-card { padding: 20px; gap: 16px; border-radius: 24px; width: 100%; box-sizing: border-box; }
          .promo-badge { width: 60px; height: 60px; border-radius: 16px; }
          .promo-value { font-size: 20px; }
          .promo-info h3 { font-size: 17px; }
          
          .services-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .service-card { border-radius: 24px; width: 100%; }
          .service-content { padding: 16px; }
          .service-title { font-size: 14px; }
          .service-description { font-size: 11px; margin-bottom: 12px; }
          .service-price { font-size: 15px; }
          .service-reserve-btn-small { padding: 10px; font-size: 12px; border-radius: 12px; }
          
          .team-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
          .team-member-card { padding: 24px 16px; border-radius: 24px; }
          .team-avatar-container { width: 90px; height: 90px; margin-bottom: 16px; }
          .team-member-card h3 { font-size: 16px; }
          
          .gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .gallery-item { border-radius: 20px; }
          .gallery-item:nth-child(3n) { aspect-ratio: 1/1; }
          
          .whatsapp-float { width: 60px; height: 60px; right: 20px; bottom: 20px; border-radius: 18px; }
          .whatsapp-float svg { width: 28px; height: 28px; }
          
          .employee-modal-content { max-width: 100%; border-radius: 32px 32px 0 0; position: fixed; bottom: 0; left: 0; right: 0; margin: 0; }
          .employee-modal-header { height: 260px; }
          .employee-modal-body { padding: 32px 24px; }
        }
      `}</style>

      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 100 }}>
        <ThemeToggle />
      </div>

      {/* SOCIAL SIDEBAR */}
      {hasSocials && (
        <div className="social-sidebar">
          {business.instagram && <SocialLink href={business.instagram} iconUrl="/instagram.png" label="Instagram" color="#E1306C" />}
          {business.facebook && <SocialLink href={business.facebook} iconUrl="/facebook.png" label="Facebook" color="#1877F2" />}
          {business.tiktok && <SocialLink href={business.tiktok} iconUrl="/tik-tok.png" label="TikTok" color="#000000" invert={isDark} />}
          {business.twitter && <SocialLink href={business.twitter} iconUrl="/x.png" label="X" color="#000000" invert={isDark} hoverColor="#1DA1F2" />}
          {business.pinterest && <SocialLink href={business.pinterest} iconUrl="/pinterest.png" label="Pinterest" color="#E60023" />}
          {business.youtube && <SocialLink href={business.youtube} iconUrl="/youtube.png" label="YouTube" color="#FF0000" />}
          {business.website && <SocialLink href={business.website} iconUrl="/web.png" label="Website" color={primary} />}
        </div>
      )}

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-logo-container">
            {business.logoUrl ? (
              <img src={getImgUrl(business.logoUrl)} alt={business.name} className="hero-logo" />
            ) : (
              <div className="hero-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 900, background: 'white', color: '#3b82f6' }}>
                {business.name.charAt(0)}
              </div>
            )}
          </div>
          <h1 className="hero-title">{business.name}</h1>
          {business.tagline && <p className="hero-tagline">{business.tagline}</p>}
          
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

      {/* BUSINESS DESCRIPTION */}
      {business.description && (
        <section style={{
          padding: '80px 24px 100px',
          marginBottom: '60px',
          background: isDark
            ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)'
            : `linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, ${primary}05 50%, rgba(248, 250, 252, 0.8) 100%)`,
          borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : `${primary}15`}`,
          position: 'relative',
          overflow: 'hidden',
          zIndex: 10
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '60%',
            height: '200%',
            background: `radial-gradient(ellipse, ${primary}10 0%, transparent 70%)`,
            pointerEvents: 'none'
          }} />
          <div style={{
            maxWidth: 800,
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            <span style={{
              fontSize: 14,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 4,
              color: primary,
              marginBottom: 20,
              display: 'block'
            }}>
              Sobre Nosotros
            </span>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: 800,
              marginBottom: 24,
              letterSpacing: -1,
              color: isDark ? 'white' : '#0f172a'
            }}>
              Conócenos
            </h2>
            <p style={{
              fontSize: 'clamp(16px, 2.5vw, 18px)',
              lineHeight: 1.8,
              color: isDark ? 'rgba(255, 255, 255, 0.85)' : '#475569',
              fontWeight: 400
            }}>
              {business.description}
            </p>
          </div>
        </section>
      )}

      {/* MAIN CONTENT */}
      <main className="content-container">

        {/* MISSION & VISION */}
        {business.showMissionVision && (business.mission || business.vision) && (
          <div className="mv-container">
            {business.mission && (
              <div className="mv-card">
                <div className="mv-icon"><Star size={32} color="white" /></div>
                <h2 className="mv-title" style={{ position: 'relative', zIndex: 1 }}>Nuestra Misión</h2>
                <p className={`mv-text ${!expandedMission && business.mission.length > MAX_TEXT_LENGTH ? 'mv-text-truncated' : ''}`}>
                  {business.mission}
                </p>
                {business.mission.length > MAX_TEXT_LENGTH && (
                  <button className="mv-read-more" onClick={() => setExpandedMission(!expandedMission)}>
                    {expandedMission ? 'Ver menos' : 'Leer más'}
                    <span style={{ fontSize: 10 }}>{expandedMission ? '▲' : '▼'}</span>
                  </button>
                )}
              </div>
            )}
            {business.vision && (
              <div className="mv-card">
                <div className="mv-icon"><Zap size={32} color="white" /></div>
                <h2 className="mv-title" style={{ position: 'relative', zIndex: 1 }}>Nuestra Visión</h2>
                <p className={`mv-text ${!expandedVision && business.vision.length > MAX_TEXT_LENGTH ? 'mv-text-truncated' : ''}`}>
                  {business.vision}
                </p>
                {business.vision.length > MAX_TEXT_LENGTH && (
                  <button className="mv-read-more" onClick={() => setExpandedVision(!expandedVision)}>
                    {expandedVision ? 'Ver menos' : 'Leer más'}
                    <span style={{ fontSize: 10 }}>{expandedVision ? '▲' : '▼'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* PROMOS */}
        {((business.Promotions && business.Promotions.length > 0) || (business.promotions && business.promotions.length > 0)) && (
          <section className="promo-section">
            <div className="section-header">
              <span className="section-label">OFERTAS EXCLUSIVAS</span>
              <h2 className="section-title">Promociones para ti 🔥</h2>
            </div>
            <div className="promo-grid">
              {(business.Promotions || business.promotions).map((promo, idx) => (
                <div key={idx} className="promo-card">
                  <div className="promo-badge">
                    <span className="promo-value">{promo.discountType === 'percentage' ? `${Math.round(promo.discountValue)}%` : '$'}</span>
                    <span className="promo-type">OFF</span>
                  </div>
                  <div className="promo-info">
                    <h3>{promo.name}</h3>
                    <p>
                      {promo.applyToAllServices ? 'Aplica en todos nuestros servicios' : 'Disponible en servicios seleccionados'}
                    </p>
                    {promo.endDate && (
                      <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: primary, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} /> Válido hasta: {new Date(promo.endDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SERVICES - Groups First */}
        {(business.ServiceGroups?.length > 0 || business.Services?.length > 0) && (
          <section style={{ marginBottom: 100 }}>
            <div className="section-header">
              <span className="section-label">NUESTROS SERVICIOS</span>
              <h2 className="section-title">
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

            {/* Show Groups Grid when no group selected */}
            {!selectedServiceGroup && business.ServiceGroups?.length > 0 && (
              <div className="services-grid">
                {business.ServiceGroups.map(group => (
                  <div 
                    key={group.id} 
                    className="service-card"
                    onClick={() => {
                      setSelectedServiceGroup(group);
                      setGroupServicesPage(0);
                    }}
                    style={{ cursor: 'pointer' }}
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
                      <h3 className="service-title">{group.name}</h3>
                      {group.description && (
                        <p className="service-description">
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

            {/* Show Services in selected Group with pagination */}
            {selectedServiceGroup && (
              <>
                <div className="services-grid">
                  {selectedServiceGroup.Services
                    ?.filter(s => s.active !== false)
                    .slice(groupServicesPage * servicesPerPage, (groupServicesPage + 1) * servicesPerPage)
                    .map(svc => renderServiceCard(svc))}
                </div>
                
                {/* Pagination for group services */}
                {selectedServiceGroup.Services?.filter(s => s.active !== false).length > servicesPerPage && (
                  <div className="pagination-container">
                    <button 
                      className="pagination-btn"
                      onClick={() => setGroupServicesPage(p => Math.max(0, p - 1))}
                      disabled={groupServicesPage === 0}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="pagination-info">
                      Página {groupServicesPage + 1} de {Math.ceil(selectedServiceGroup.Services.filter(s => s.active !== false).length / servicesPerPage)}
                    </span>
                    <button 
                      className="pagination-btn"
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
        )}

        {/* TEAM */}
        {business.Employees && business.Employees.length > 0 && (
          <section style={{ marginBottom: 100 }}>
            <div className="section-header">
              <span className="section-label">NUESTRO EQUIPO</span>
              <h2 className="section-title">Especialistas a tu Servicio</h2>
            </div>
            <div className="team-grid">
              {business.Employees.map(emp => (
                <div key={emp.id} className="team-member-card" onClick={() => setEmployeeModal(emp)}>
                  <div className="team-avatar-container">
                    {emp.photoUrl ? (
                      <img src={getImgUrl(emp.photoUrl)} alt={emp.User?.name} className="team-avatar-img" />
                    ) : (
                      <div className="team-avatar-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, background: '#3b82f610', color: '#3b82f6' }}>
                        {emp.User?.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="team-member-name">{emp.User?.name}</h3>
                  <p className="team-member-role">
                    {emp.specialty || (emp.isManager ? 'Director' : 'Especialista')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RESEÑAS DEL NEGOCIO */}
        <section style={{ marginBottom: 100 }}>
          <div className="section-header">
            <span className="section-label">LO QUE DICEN NUESTROS CLIENTES</span>
            <h2 className="section-title">
              {business.ReviewStats?.avgRating && (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        size={32} 
                        fill={star <= Math.round(business.ReviewStats.avgRating) ? '#fbbf24' : 'transparent'}
                        color={star <= Math.round(business.ReviewStats.avgRating) ? '#fbbf24' : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                      />
                    ))}
                  </span>
                  <span style={{ color: primary }}>{business.ReviewStats.avgRating}</span>
                  <span style={{ fontSize: 18, opacity: 0.6, fontWeight: 500 }}>({business.ReviewStats.totalReviews} reseñas)</span>
                </span>
              )}
              {!business.ReviewStats?.avgRating && 'Opiniones de Nuestros Clientes'}
            </h2>
          </div>

          {/* Grid de reseñas - 5 aleatorias, cards pequeñas */}
          {business.Reviews && business.Reviews.length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: 16,
              marginBottom: 48,
              maxWidth: 1200,
              margin: '0 auto 48px'
            }}>
              {business.Reviews
                .sort(() => Math.random() - 0.5) // Aleatorizar
                .slice(0, 5) // Solo 5 reseñas
                .map((review, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'white',
                    borderRadius: 16,
                    padding: 20,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    boxShadow: isDark ? '0 10px 20px rgba(0,0,0,0.2)' : '0 10px 20px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  {/* Estrellas */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        size={14} 
                        fill={star <= review.rating ? '#fbbf24' : 'transparent'}
                        color={star <= review.rating ? '#fbbf24' : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                      />
                    ))}
                  </div>
                  
                  {/* Comentario */}
                  <p style={{ 
                    fontSize: 14, 
                    lineHeight: 1.5, 
                    color: isDark ? 'rgba(255,255,255,0.85)' : '#475569',
                    marginBottom: 16,
                    fontStyle: 'italic',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    "{review.comment || 'Excelente servicio!'}"
                  </p>
                  
                  {/* Nombre y fecha */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
                    paddingTop: 12
                  }}>
                    <span style={{ 
                      fontWeight: 600, 
                      color: primary,
                      fontSize: 13
                    }}>
                      — {review.clientName}
                    </span>
                    <span style={{ 
                      fontSize: 11, 
                      color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8'
                    }}>
                      {new Date(review.createdAt).toLocaleDateString('es-CO', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón para mostrar formulario */}
          {!showReviewForm && (
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={() => setShowReviewForm(true)}
                style={{
                  padding: '16px 32px',
                  background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: 20,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  boxShadow: `0 10px 30px ${primary}40`,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = `0 15px 40px ${primary}60`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = `0 10px 30px ${primary}40`;
                }}
              >
                <Star size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                Dejar mi reseña
              </button>
            </div>
          )}

          {/* Mensaje de éxito */}
          {reviewSuccess && (
            <div style={{
              background: '#10b98120',
              border: '1px solid #10b981',
              borderRadius: 16,
              padding: 20,
              textAlign: 'center',
              marginBottom: 24
            }}>
              <p style={{ color: '#10b981', fontWeight: 700, fontSize: 16, margin: 0 }}>
                <Check size={24} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                ¡Gracias por tu reseña! Se publicará pronto.
              </p>
            </div>
          )}

          {/* Formulario de reseña */}
          {showReviewForm && (
            <div style={{
              background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'white',
              borderRadius: 32,
              padding: 40,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              boxShadow: isDark ? '0 30px 60px rgba(0,0,0,0.4)' : '0 30px 60px rgba(0,0,0,0.1)',
              maxWidth: 600,
              margin: '0 auto'
            }}>
              <h3 style={{ 
                fontSize: 24, 
                fontWeight: 800, 
                marginBottom: 24, 
                textAlign: 'center',
                color: isDark ? 'white' : '#0f172a'
              }}>
                ¿Cómo fue tu experiencia?
              </h3>
              
              <form onSubmit={submitReview}>
                {/* Selector de estrellas */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <p style={{ 
                    fontSize: 14, 
                    color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b', 
                    marginBottom: 12 
                  }}>
                    Selecciona tu calificación:
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 4,
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <Star 
                          size={40} 
                          fill={star <= reviewRating ? '#fbbf24' : 'transparent'}
                          color={star <= reviewRating ? '#fbbf24' : isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
                        />
                      </button>
                    ))}
                  </div>
                  <p style={{ 
                    fontSize: 14, 
                    color: primary, 
                    fontWeight: 700,
                    marginTop: 8 
                  }}>
                    {reviewRating === 5 && '¡Excelente! ⭐'}
                    {reviewRating === 4 && 'Muy bueno 👍'}
                    {reviewRating === 3 && 'Bueno 🙂'}
                    {reviewRating === 2 && 'Regular 😕'}
                    {reviewRating === 1 && 'Necesita mejorar 😞'}
                  </p>
                </div>

                {/* Nombre */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 14, 
                    fontWeight: 600, 
                    marginBottom: 8,
                    color: isDark ? 'rgba(255,255,255,0.8)' : '#334155'
                  }}>
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Ej: María Rodríguez"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      borderRadius: 12,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}`,
                      background: isDark ? 'rgba(15, 23, 42, 0.5)' : 'white',
                      color: isDark ? 'white' : '#0f172a',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = primary}
                    onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}
                  />
                </div>

                {/* Comentario */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 14, 
                    fontWeight: 600, 
                    marginBottom: 8,
                    color: isDark ? 'rgba(255,255,255,0.8)' : '#334155'
                  }}>
                    Tu comentario
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Cuéntanos tu experiencia..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      borderRadius: 12,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}`,
                      background: isDark ? 'rgba(15, 23, 42, 0.5)' : 'white',
                      color: isDark ? 'white' : '#0f172a',
                      fontSize: 15,
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'all 0.3s ease',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = primary}
                    onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}
                  />
                </div>

                {/* Botones */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    style={{
                      padding: '14px 28px',
                      background: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
                      color: isDark ? 'white' : '#64748b',
                      border: 'none',
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    style={{
                      padding: '14px 32px',
                      background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                      color: 'white',
                      border: 'none',
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: isSubmittingReview ? 'not-allowed' : 'pointer',
                      opacity: isSubmittingReview ? 0.7 : 1,
                      transition: 'all 0.3s ease',
                      boxShadow: `0 8px 20px ${primary}40`
                    }}
                  >
                    {isSubmittingReview ? 'Enviando...' : 'Publicar reseña'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>

        {/* GALLERY - 3D CAROUSEL */}
        {gallery.length > 0 && (
          <section style={{ marginBottom: 100 }}>
            <div className="section-header">
              <span className="section-label">PORTAFOLIO</span>
              <h2 className="section-title">Nuestros Resultados ✨</h2>
            </div>
            
            {/* 3D Stack Carousel */}
            <div 
              className="carousel-3d-container"
              onMouseDown={(e) => {
                setIsDragging(true);
                setStartX(e.clientX);
              }}
              onMouseMove={(e) => {
                if (!isDragging) return;
                const diff = startX - e.clientX;
                if (Math.abs(diff) > 50) {
                  if (diff > 0) {
                    // Siguiente (infinito)
                    setCurrentSlide(prev => (prev + 1) % gallery.length);
                  } else {
                    // Anterior (infinito)
                    setCurrentSlide(prev => (prev - 1 + gallery.length) % gallery.length);
                  }
                  setStartX(e.clientX);
                  setIsDragging(false);
                }
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchStart={(e) => {
                setStartX(e.touches[0].clientX);
              }}
              onTouchMove={(e) => {
                const diff = startX - e.touches[0].clientX;
                if (Math.abs(diff) > 50) {
                  if (diff > 0) {
                    // Siguiente (infinito)
                    setCurrentSlide(prev => (prev + 1) % gallery.length);
                  } else {
                    // Anterior (infinito)
                    setCurrentSlide(prev => (prev - 1 + gallery.length) % gallery.length);
                  }
                  setStartX(e.touches[0].clientX);
                }
              }}
            >
              <div className="carousel-3d-track">
                {gallery.map((img, i) => {
                  // Calcular offset con carrusel infinito
                  let offset = i - currentSlide;
                  
                  // Ajustar para carrusel infinito circular
                  const len = gallery.length;
                  if (offset > len / 2) offset -= len;
                  if (offset < -len / 2) offset += len;
                  
                  const isActive = i === currentSlide;
                  const isVisible = Math.abs(offset) <= 2; // Mostrar solo -2, -1, 0, 1, 2
                  
                  if (!isVisible) return null; // No renderizar tarjetas lejanas
                  
                  return (
                    <div
                      key={i}
                      className={`carousel-3d-card ${isActive ? 'active' : ''}`}
                      data-offset={offset}
                      style={{
                        zIndex: 100 - Math.abs(offset)
                      }}
                      onClick={() => isActive ? setGalleryModal(i) : setCurrentSlide(i)}
                    >
                      <img 
                        src={getImgUrl(img)} 
                        alt={`Galería ${i + 1}`} 
                        className="carousel-3d-img"
                        loading="lazy"
                      />
                      {isActive && (
                        <div className="carousel-3d-overlay" onClick={() => setGalleryModal(i)}>
                          <div className="carousel-view-btn">
                            <Zap size={20} />
                            <span>Ver</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Navigation Arrows */}
              <button 
                className="carousel-nav-btn prev"
                onClick={() => setCurrentSlide(prev => (prev - 1 + gallery.length) % gallery.length)}
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                className="carousel-nav-btn next"
                onClick={() => setCurrentSlide(prev => (prev + 1) % gallery.length)}
                aria-label="Siguiente imagen"
              >
                <ChevronRight size={24} />
              </button>
              
              {/* Counter */}
              <div className="carousel-counter">
                <span className="current">{currentSlide + 1}</span>
                <span className="separator">/</span>
                <span className="total">{gallery.length}</span>
              </div>
            </div>
          </section>
        )}


        {/* PAYMENT METHODS */}
        {business.showPaymentMethods && paymentMethods.length > 0 && (
          <section className="section-card" style={{ borderStyle: 'solid' }}>
            <div className="section-header">
              <span className="section-label">MÉTODOS DE PAGO</span>
              <h2 className="section-title">Facilidades para ti</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {paymentMethods.map((method, idx) => (
                <div key={idx} style={{ padding: 32, borderRadius: 24, background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.3s ease', boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)' }} className="payment-method-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
                      <img src={getPaymentMethodImage(method.name) || '/banco.png'} style={{ width: 36, height: 36, objectFit: 'contain' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 17 }}>{method.name}</div>
                      <div style={{ fontSize: 15, opacity: 0.6, fontFamily: 'monospace', letterSpacing: 1 }}>{method.number}</div>
                    </div>
                  </div>
                  <button 
                    style={{ width: 44, height: 44, borderRadius: 14, background: `${primary}15`, color: primary, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    onClick={() => {
                      navigator.clipboard.writeText(method.number);
                      setCopiedIndex(idx);
                      setTimeout(() => setCopiedIndex(null), 2000);
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {copiedIndex === idx ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* GOOGLE MAPS SECTION */}
        {business.googleMapsUrl && (
          <section className="section-card" style={{ marginTop: 40 }}>
            <div className="section-header">
              <span className="section-label">Ubicación</span>
              <h2 className="section-title">Encuéntranos aquí</h2>
            </div>

            {/* Si es URL corta (maps.app.goo.gl), mostrar botón en lugar de iframe */}
            {isShortGoogleMapsUrl(business.googleMapsUrl) ? (
              <div style={{
                padding: '60px 40px',
                textAlign: 'center',
                background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.8)',
                borderRadius: 24,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  background: 'linear-gradient(135deg, #4285f4 0%, #34a853 50%, #ea4335 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 10px 30px rgba(66, 133, 244, 0.3)'
                }}>
                  <MapPin size={36} color="white" />
                </div>
                <p style={{
                  fontSize: 16,
                  color: isDark ? 'rgba(255,255,255,0.8)' : '#475569',
                  marginBottom: 24,
                  maxWidth: 400,
                  margin: '0 auto 24px'
                }}>
                  Ver la ubicación del negocio en Google Maps
                </p>
                <a
                  href={business.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '16px 32px',
                    background: primary,
                    color: 'white',
                    borderRadius: 16,
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: 16,
                    boxShadow: `0 10px 30px ${primary}40`,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 15px 40px ${primary}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 10px 30px ${primary}40`;
                  }}
                >
                  <ExternalLink size={20} />
                  Ver en Google Maps
                </a>
                <p style={{
                  fontSize: 12,
                  color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
                  marginTop: 16
                }}>
                  (Se abrirá en una nueva pestaña)
                </p>
              </div>
            ) : (
              <div style={{ borderRadius: 24, overflow: 'hidden', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)' }}>
                <iframe
                  src={getGoogleMapsEmbedUrl(business.googleMapsUrl)}
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Ubicación de ${business.name}`}
                />
              </div>
            )}

            {business.address && (
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }}>
                <MapPin size={18} style={{ color: primary }} />
                <span style={{ fontSize: 15, fontWeight: 500 }}>{business.address}</span>
              </div>
            )}
          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer style={{ padding: '80px 24px 60px', textAlign: 'center', background: isDark ? '#020617' : 'white', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 40, letterSpacing: -1.5 }}>{business.name}</h2>

          {/* INFO DE CONTACTO EN FOOTER */}
          {(business.address || business.phone || business.businessHours) && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '32px 48px',
              marginBottom: 48,
              padding: '32px 24px',
              background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.8)',
              borderRadius: 24,
              maxWidth: 800,
              margin: '0 auto 48px'
            }}>
              {business.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: isDark ? 'rgba(255,255,255,0.9)' : '#334155' }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${primary}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: primary
                  }}>
                    <MapPin size={20} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6, marginBottom: 2 }}>Dirección</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{business.address}</div>
                  </div>
                </div>
              )}
              {business.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: isDark ? 'rgba(255,255,255,0.9)' : '#334155' }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${primary}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: primary
                  }}>
                    <Phone size={20} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6, marginBottom: 2 }}>Teléfono</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{business.phone}</div>
                  </div>
                </div>
              )}
              {business.businessHours && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  color: isDark ? 'rgba(255,255,255,0.9)' : '#334155',
                  width: '100%',
                  maxWidth: 500
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${primary}30, ${primary}10)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: primary,
                    boxShadow: `0 4px 15px ${primary}25`
                  }}>
                    <Clock size={24} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: 2,
                      opacity: 0.7,
                      marginBottom: 12,
                      color: primary
                    }}>
                      Horario de Atención
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 500,
                      lineHeight: 1.6
                    }}>
                      {(() => {
                        // Parsear horarios - soporta dos formatos:
                        // 1. Dia y horario en la misma línea: "Lunes - viernes 07:00 a.m -12:00 p.m..."
                        // 2. Dia y horario en líneas separadas
                        const lines = business.businessHours.split(/\n|\\n/);
                        const scheduleItems = [];

                        for (let i = 0; i < lines.length; i++) {
                          const line = lines[i].trim();
                          if (!line) continue;

                          // Buscar donde empiezan los números (hora)
                          const match = line.match(/^([^\d]+)(\d.*)$/);
                          if (match) {
                            // Formato: "Dia horarios" en misma línea
                            scheduleItems.push({ day: match[1].trim(), hours: match[2].trim() });
                          } else if (/\d/.test(line)) {
                            // Solo números, podría ser línea de horarios suelta
                            // Asociar con el último día si existe, o crear entrada sin día
                            if (scheduleItems.length > 0 && !scheduleItems[scheduleItems.length - 1].hours) {
                              scheduleItems[scheduleItems.length - 1].hours = line;
                            } else {
                              scheduleItems.push({ day: '', hours: line });
                            }
                          } else {
                            // Solo texto (día sin horarios)
                            scheduleItems.push({ day: line, hours: '' });
                          }
                        }

                        return scheduleItems.map((item, idx) => {
                          const { day, hours } = item;

                          // Parsear horarios - limpiar y separar mañana/tarde
                          let cleanHours = hours
                            .replace(/\s+/g, ' ')
                            .replace(/:\s+/g, ':')
                            .replace(/pp\.m/gi, 'p.m')
                            .replace(/:\s*05:\s*p\.?m/gi, '- 05:00 p.m')
                            .trim();

                          // Separar rangos de horario por patrones de AM/PM
                          // Buscar patrones como: 07:00 a.m - 12:00 p.m 02:00 p.m - 07:00 p.m
                          // O: 09:00 a.m - 12:00 m 02:00 p.m - 08:00 p.m

                          // Detectar hora de inicio de tarde (después de 12:00 m)
                          const afternoonStartMatch = cleanHours.match(/(12:\d{2}\s*m)[^\d]*\d{1,2}:\d{2}/i);

                          if (afternoonStartMatch) {
                            // Hay horario de mañana y tarde
                            const morningEndIndex = afternoonStartMatch.index + afternoonStartMatch[1].length;
                            const morningPart = cleanHours.substring(0, morningEndIndex).trim();
                            const afternoonPart = cleanHours.substring(morningEndIndex).trim()
                              .replace(/^[^\d]*/, ''); // Quitar separadores iniciales

                            // Limpiar y formatear partes
                            const morning = morningPart.replace(/\s*-\s*/g, ' - ');
                            const afternoon = afternoonPart.replace(/\s*-\s*/g, ' - ')
                              .replace(/^[^\d]*(\d)/, '$1'); // Quitar guiones o dos puntos iniciales

                            return (
                              <div key={idx} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4,
                                padding: '10px 16px',
                                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
                                borderRadius: 10,
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                                textAlign: 'left'
                              }}>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                                  <span style={{
                                    fontWeight: 700,
                                    color: primary,
                                    textTransform: 'capitalize',
                                    whiteSpace: 'nowrap',
                                    minWidth: 110
                                  }}>
                                    {day}
                                  </span>
                                  <span style={{
                                    color: isDark ? 'rgba(255,255,255,0.9)' : '#475569'
                                  }}>
                                    {morning}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                                  <span style={{ minWidth: 110 }}></span>
                                  <span style={{
                                    color: isDark ? 'rgba(255,255,255,0.9)' : '#475569'
                                  }}>
                                    {afternoon}
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          // Si no hay patrón claro de mañana/tarde, mostrar como viene
                          return (
                            <div key={idx} style={{
                              padding: '10px 16px',
                              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
                              borderRadius: 10,
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                              textAlign: 'left'
                            }}>
                              <div style={{ display: 'flex', gap: 16 }}>
                                <span style={{
                                  fontWeight: 700,
                                  color: primary,
                                  textTransform: 'capitalize',
                                  whiteSpace: 'nowrap',
                                  minWidth: 110
                                }}>
                                  {day}
                                </span>
                                <span style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#475569' }}>
                                  {cleanHours}
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
            {hasSocials && (
              <>
                {business.instagram && <SocialLink href={business.instagram} iconUrl="/instagram.png" label="Instagram" color="#E1306C" />}
                {business.facebook && <SocialLink href={business.facebook} iconUrl="/facebook.png" label="Facebook" color="#1877F2" />}
                {business.tiktok && <SocialLink href={business.tiktok} iconUrl="/tik-tok.png" label="TikTok" color="#000000" invert={isDark} />}
                {business.twitter && <SocialLink href={business.twitter} iconUrl="/x.png" label="X" color="#000000" invert={isDark} hoverColor="#1DA1F2" />}
                {business.pinterest && <SocialLink href={business.pinterest} iconUrl="/pinterest.png" label="Pinterest" color="#E60023" />}
                {business.youtube && <SocialLink href={business.youtube} iconUrl="/youtube.png" label="YouTube" color="#FF0000" />}
                {business.website && <SocialLink href={business.website} iconUrl="/web.png" label="Website" color={primary} />}
              </>
            )}
          </div>
          <div style={{ opacity: 0.4, fontSize: 14, fontWeight: 600, letterSpacing: 1 }}>
            © {new Date().getFullYear()} — IMPULSADO POR K-DICE POS v5.0
          </div>
        </div>
      </footer>

      {/* WHATSAPP FLOAT */}
      {hasWhatsapp && (
        <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noreferrer" className="whatsapp-float">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      )}

      {/* MODALS */}
      {galleryModal !== null && <GalleryModal images={gallery} index={galleryModal} onClose={() => setGalleryModal(null)} />}
      {employeeModal && (
        <EmployeeModal 
          emp={employeeModal} 
          onClose={() => setEmployeeModal(null)} 
          primary={primary} 
          colors={colors} 
          navigate={navigate}
          slug={slug}
        />
      )}
    </div>
  );
}
