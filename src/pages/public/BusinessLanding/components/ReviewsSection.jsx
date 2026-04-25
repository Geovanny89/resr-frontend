import { useState } from 'react';
import { Star, Check } from 'lucide-react';
import api from '../../../../api/client';

export default function ReviewsSection({ business, primary, secondary, slug, setBusiness, isDark }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

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
      
      const r = await api.get(`/businesses/${slug}/public`);
      setBusiness(r.data);
      
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      alert('Error al enviar la reseña. Intenta de nuevo.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const ratingLabels = {
    5: '¡Excelente! ⭐',
    4: 'Muy bueno 👍',
    3: 'Bueno 🙂',
    2: 'Regular 😕',
    1: 'Necesita mejorar 😞'
  };

  return (
    <section style={{ marginBottom: 100 }}>
      <div className="section-header">
        <span className="section-label">LO QUE DICEN NUESTROS CLIENTES</span>
        <h2 className="section-title" style={{ color: isDark ? 'white' : '#0f172a' }}>
          {business.ReviewStats?.avgRating ? (
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
          ) : (
            'Opiniones de Nuestros Clientes'
          )}
        </h2>
      </div>

      {/* Grid de reseñas */}
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
            .sort(() => Math.random() - 0.5)
            .slice(0, 5)
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
                {ratingLabels[reviewRating]}
              </p>
            </div>

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
  );
}
