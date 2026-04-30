import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import api from '../../../api/client';

export default function FeedbackModal({ isOpen, onClose, business, onFinish, colors }) {
  const [feedback, setFeedback] = useState({ 
    rating: 5, 
    comment: '', 
    reviewerName: business?.name || '' 
  });
  const [sending, setSending] = useState(false);

  // Sincronizar el nombre si business carga después
  useEffect(() => {
    if (business?.name && !feedback.reviewerName) {
      setFeedback(prev => ({ ...prev, reviewerName: business.name }));
    }
  }, [business, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      await api.post('/platform-reviews/submit', {
        businessId: business.id,
        ...feedback
      });
      onFinish('¡Gracias por tu testimonio! Será revisado por nuestro equipo.');
      onClose();
    } catch (e) {
      onFinish('Error al enviar testimonio', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div className="modal" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>✨</span> Tu Testimonio
          </h3>
          <button className="btn-ghost" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>¿Cómo calificarías tu experiencia?</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    size={32} 
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    fill={star <= feedback.rating ? "#f59e0b" : "none"}
                    color={star <= feedback.rating ? "#f59e0b" : "#d1d5db"}
                    onClick={() => setFeedback({ ...feedback, rating: star })}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Tu Nombre</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Ej: María García"
                value={feedback.reviewerName}
                onChange={e => setFeedback({ ...feedback, reviewerName: e.target.value })}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Tu Comentario</label>
              <textarea 
                className="input" 
                rows="4" 
                placeholder="Cuéntanos cómo K-Dice ha ayudado a tu negocio..."
                value={feedback.comment}
                onChange={e => setFeedback({ ...feedback, comment: e.target.value })}
                required
                style={{ width: '100%', resize: 'none' }}
              />
            </div>
          </div>
          <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={sending || !feedback.comment || !feedback.reviewerName}
            >
              {sending ? 'Enviando...' : 'Enviar Testimonio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
