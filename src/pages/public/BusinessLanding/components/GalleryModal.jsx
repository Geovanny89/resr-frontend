import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getImgUrl } from '../utils';

export default function GalleryModal({ images, index, onClose }) {
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
