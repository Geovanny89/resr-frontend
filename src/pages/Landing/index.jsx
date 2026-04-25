import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useScrollHide } from './hooks/useScrollHide';
import { useCarousel } from './hooks/useCarousel';
import { carouselImages } from './constants';

import { Navbar } from './sections/Navbar';
import { Hero } from './sections/Hero';
import { Features } from './sections/Features';
import { Pricing } from './sections/Pricing';
import { Testimonials } from './sections/Testimonials';
import { CTASection } from './sections/CTASection';
import { AppDownload } from './sections/AppDownload';
import { Footer } from './sections/Footer';
import { Modal } from './components/Modal';
import { VideoModal } from './components/VideoModal';
import { PrivacyContent } from './components/PrivacyContent';
import { TermsContent } from './components/TermsContent';
import { WhatsAppButton } from './components/WhatsAppButton';

import './styles.css';

export default function Landing() {
  const { isDark, colors } = useTheme();
  const navHidden = useScrollHide();
  const { currentSlide, nextSlide, prevSlide, goToSlide } = useCarousel(carouselImages.length);

  const [navOpen, setNavOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Set CSS variables for theming
  const cssVars = {
    '--bg-main': isDark ? colors.bg : '#ffffff',
    '--bg-light': isDark ? colors.bgSecondary : '#f8fafc',
    '--card-bg': colors.cardBg,
    '--text-main': colors.text,
    '--text-muted': colors.textSecondary,
    '--nav-bg': isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    '--border-color': isDark ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)',
  };

  return (
    <div
      className="landing-root"
      data-theme={isDark ? 'dark' : 'light'}
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: isDark ? colors.bg : '#ffffff',
        color: colors.text,
        overflowX: 'hidden',
        transition: 'background 0.3s ease, color 0.3s ease',
        ...cssVars
      }}
    >
      <Navbar
        navHidden={navHidden}
        navOpen={navOpen}
        setNavOpen={setNavOpen}
        setVideoModalOpen={setVideoModalOpen}
      />

      <Hero
        currentSlide={currentSlide}
        nextSlide={nextSlide}
        prevSlide={prevSlide}
        goToSlide={goToSlide}
        setVideoModalOpen={setVideoModalOpen}
      />

      <Features />
      <Pricing />
      <Testimonials />
      <CTASection />
      <AppDownload />
      <Footer setModalOpen={setModalOpen} />

      {/* Modals */}
      <Modal
        isOpen={modalOpen === 'privacy'}
        onClose={() => setModalOpen(null)}
        title="Política de Privacidad"
      >
        <PrivacyContent />
      </Modal>

      <Modal
        isOpen={modalOpen === 'terms'}
        onClose={() => setModalOpen(null)}
        title="Términos de Servicio"
      >
        <TermsContent />
      </Modal>

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
      />

      <WhatsAppButton />
    </div>
  );
}
