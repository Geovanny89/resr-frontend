import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../api/client';
import { useTheme } from '../../../context/ThemeContext';
import ThemeToggle from '../../../components/ThemeToggle';

import './BusinessLanding.css';

// Utils
import { getImgUrl, getGoogleMapsEmbedUrl, isShortGoogleMapsUrl, getPaymentMethodImage } from './utils';

// Section Components
import HeroSection from './components/HeroSection';
import MissionVisionSection from './components/MissionVisionSection';
import PromotionsSection from './components/PromotionsSection';
import ServicesSection from './components/ServicesSection';
import TeamSection from './components/TeamSection';
import ReviewsSection from './components/ReviewsSection';
import GallerySection from './components/GallerySection';
import PaymentMethodsSection from './components/PaymentMethodsSection';
import LocationMapSection from './components/LocationMapSection';
import InfoGridSection from './components/InfoGridSection';
import SocialSidebar from './components/SocialSidebar';
import FooterSection from './components/FooterSection';

// Modal Components
import GalleryModal from './components/GalleryModal';
import EmployeeModal from './components/EmployeeModal';
import KadyWidget from '../../../components/KadyChat/KadyWidget';

// Export utils for external use
export { getImgUrl, getGoogleMapsEmbedUrl, isShortGoogleMapsUrl, getPaymentMethodImage };

export default function BusinessLanding() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDark, colors } = useTheme();
  
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [galleryModal, setGalleryModal] = useState(null);
  const [employeeModal, setEmployeeModal] = useState(null);

  // Auto-open review form if ?review=true
  useEffect(() => {
    const shouldReview = searchParams.get('review');
    if (shouldReview === 'true') {
      // This will be handled by ReviewsSection component
    }
  }, [searchParams]);

  useEffect(() => {
    api.get(`/businesses/${slug}/public`)
      .then(r => {
        if (!r.data || !r.data.id) {
          setError('Negocio no encontrado');
        } else {
          const data = r.data;
          // Parse paymentMethods if it's a string
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

  // Loading state
  if (loading) {
    return (
      <div className={`landing-root ${isDark ? 'dark' : ''}`}>
        <div className="page-loading-screen">
          <div className="loading-spinner-container">
            <div className="loading-spinner" />
            <p style={{ color: isDark ? 'white' : '#0f172a' }}>Cargando experiencias...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !business) {
    return (
      <div className={`landing-root ${isDark ? 'dark' : ''}`}>
        <div className="page-error-screen">
          <div className="error-content">
            <div className="error-icon">🔍</div>
            <h2 className="error-title" style={{ color: isDark ? 'white' : '#0f172a' }}>No encontrado</h2>
            <p className="error-msg" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b' }}>
              El negocio que buscas no está disponible actualmente.
            </p>
            <button className="error-retry-btn" onClick={() => navigate('/')}>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract business properties
  const primary = business.primaryColor || '#667eea';
  const secondary = business.secondaryColor || '#764ba2';
  const hasWhatsapp = !!business.whatsapp;
  const hasSocials = !!(business.instagram || business.facebook || business.tiktok || 
    business.twitter || business.pinterest || business.youtube || business.website || business.whatsappCatalog);

  // Parse gallery
  let gallery = [];
  if (business.gallery) {
    if (typeof business.gallery === 'string') {
      try { gallery = JSON.parse(business.gallery); } catch (e) { gallery = []; }
    } else if (Array.isArray(business.gallery)) {
      gallery = business.gallery;
    }
  }

  // Parse payment methods
  let paymentMethods = [];
  if (business.paymentMethods) {
    if (typeof business.paymentMethods === 'string') {
      try { paymentMethods = JSON.parse(business.paymentMethods); } catch (e) { paymentMethods = []; }
    } else if (Array.isArray(business.paymentMethods)) {
      paymentMethods = business.paymentMethods;
    }
  }

  // Add isDark flag to business for child components
  const businessWithTheme = { ...business, isDark };

  return (
    <div 
      className={`landing-root ${isDark ? 'dark' : ''}`} 
      style={{ 
        '--brand-primary': primary, 
        '--brand-secondary': secondary,
        background: isDark
          ? 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #1e293b 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 30%, #e2e8f0 70%, #f8fafc 100%)',
        color: isDark ? '#f1f5f9' : '#0f172a'
      }}
    >
      {/* Background effects */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDark
          ? 'radial-gradient(ellipse at 20% 30%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)'
          : 'radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.03) 0%, transparent 40%), radial-gradient(ellipse at 80% 60%, rgba(139, 92, 246, 0.02) 0%, transparent 40%), radial-gradient(ellipse at 50% 100%, rgba(59, 130, 246, 0.02) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Theme Toggle */}
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 100 }}>
        <ThemeToggle />
      </div>

      {/* Social Sidebar */}
      <SocialSidebar business={business} primary={primary} isDark={isDark} />

      {/* Hero Section */}
      <HeroSection 
        business={businessWithTheme}
        slug={slug}
        navigate={navigate}
        primary={primary}
        secondary={secondary}
      />

      {/* About Section */}
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

      {/* Main Content */}
      <main className="content-container">
        {/* Mission & Vision */}
        <MissionVisionSection 
          business={businessWithTheme}
          primary={primary}
          secondary={secondary}
        />

        {/* Info Grid */}
        <InfoGridSection 
          business={businessWithTheme}
          primary={primary}
          isDark={isDark}
        />

        {/* Promotions */}
        <PromotionsSection 
          business={businessWithTheme}
          primary={primary}
        />

        {/* Services */}
        <ServicesSection 
          business={businessWithTheme}
          primary={primary}
          secondary={secondary}
          slug={slug}
          navigate={navigate}
        />

        {/* Team */}
        <TeamSection 
          business={businessWithTheme}
          primary={primary}
          setEmployeeModal={setEmployeeModal}
        />

        {/* Reviews */}
        <ReviewsSection 
          business={businessWithTheme}
          primary={primary}
          secondary={secondary}
          slug={slug}
          setBusiness={setBusiness}
          isDark={isDark}
        />

        {/* Gallery */}
        <GallerySection 
          gallery={gallery}
          business={businessWithTheme}
          setGalleryModal={setGalleryModal}
        />

        {/* Payment Methods */}
        <PaymentMethodsSection 
          business={businessWithTheme}
          primary={primary}
          paymentMethods={paymentMethods}
          isDark={isDark}
        />

        {/* Location Map */}
        <LocationMapSection 
          business={businessWithTheme}
          primary={primary}
          isDark={isDark}
        />
      </main>

      {/* Footer */}
      <FooterSection 
        business={businessWithTheme}
        primary={primary}
        isDark={isDark}
      />

      {/* Modals */}
      {galleryModal !== null && (
        <GalleryModal 
          images={gallery} 
          index={galleryModal} 
          onClose={() => setGalleryModal(null)} 
        />
      )}
      
      {employeeModal && (
        <EmployeeModal 
          emp={employeeModal} 
          onClose={() => setEmployeeModal(null)} 
          primary={primary} 
          secondary={secondary}
          navigate={navigate}
          slug={slug}
        />
      )}
      
      {/* Chatbot Kady */}
      <KadyWidget slug={slug} />
    </div>
  );
}
