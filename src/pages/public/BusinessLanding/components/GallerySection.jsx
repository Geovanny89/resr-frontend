import { useState } from 'react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { getImgUrl } from '../utils';

export default function GallerySection({ gallery, business, setGalleryModal }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  if (gallery.length === 0) return null;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentSlide(prev => (prev + 1) % gallery.length);
      } else {
        setCurrentSlide(prev => (prev - 1 + gallery.length) % gallery.length);
      }
      setStartX(e.clientX);
      setIsDragging(false);
    }
  };

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    const diff = startX - e.touches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentSlide(prev => (prev + 1) % gallery.length);
      } else {
        setCurrentSlide(prev => (prev - 1 + gallery.length) % gallery.length);
      }
      setStartX(e.touches[0].clientX);
    }
  };

  return (
    <section style={{ marginBottom: 100 }}>
      <div className="section-header">
        <span className="section-label">PORTAFOLIO</span>
        <h2 className="section-title" style={{ color: business.isDark ? 'white' : '#0f172a' }}>
          Nuestros Resultados ✨
        </h2>
      </div>
      
      <div 
        className="carousel-3d-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className="carousel-3d-track">
          {gallery.map((img, i) => {
            let offset = i - currentSlide;
            const len = gallery.length;
            if (offset > len / 2) offset -= len;
            if (offset < -len / 2) offset += len;
            
            const isActive = i === currentSlide;
            const isVisible = Math.abs(offset) <= 2;
            
            if (!isVisible) return null;
            
            return (
              <div
                key={i}
                className={`carousel-3d-card ${isActive ? 'active' : ''}`}
                data-offset={offset}
                style={{ zIndex: 100 - Math.abs(offset) }}
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
        
        <button 
          className="carousel-nav-btn prev"
          style={{ color: business.isDark ? 'white' : '#0f172a' }}
          onClick={() => setCurrentSlide(prev => (prev - 1 + gallery.length) % gallery.length)}
          aria-label="Imagen anterior"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          className="carousel-nav-btn next"
          style={{ color: business.isDark ? 'white' : '#0f172a' }}
          onClick={() => setCurrentSlide(prev => (prev + 1) % gallery.length)}
          aria-label="Siguiente imagen"
        >
          <ChevronRight size={24} />
        </button>
        
        <div className="carousel-counter">
          <span className="current">{currentSlide + 1}</span>
          <span className="separator">/</span>
          <span className="total">{gallery.length}</span>
        </div>
      </div>
    </section>
  );
}
