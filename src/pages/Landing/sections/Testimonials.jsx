import { useEffect, useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { testimonials as staticTestimonials } from '../constants';
import api from '../../../api/client';

export function Testimonials() {
  const { isDark, colors } = useTheme();
  const [dynamicReviews, setDynamicReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/platform-reviews/public');
        if (res.data && res.data.length > 0) {
          setDynamicReviews(res.data);
        }
      } catch (e) {
        console.error('Error fetching landing reviews:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Si hay reseñas dinámicas aprobadas, las usamos. Si no, usamos las estáticas.
  const displayData = dynamicReviews.length > 0 
    ? dynamicReviews.map(r => ({
        name: r.reviewerName,
        business: r.businessName,
        text: r.comment,
        avatar: '👤', // Avatar genérico o iniciales
        rating: r.rating
      }))
    : staticTestimonials;

  return (
    <section style={{ padding: '120px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <h2 style={{ fontSize: 'clamp(32px, 5vw, 40px)', fontWeight: 800, textAlign: 'center', marginBottom: 64, color: colors.text }}>
        Negocios que han transformado su operación
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
        {displayData.map((t, i) => (
          <div key={i} className="test-card">
            <div style={{ color: '#fbbf24', fontSize: 20, marginBottom: 16 }}>
              {Array(t.rating || 5).fill('★').join('')}
            </div>
            <p style={{ fontSize: 17, color: colors.text, marginBottom: 32, lineHeight: 1.7 }}>
              "{t.text}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
              }}>{t.avatar}</div>
              <div>
                <div style={{ fontWeight: 700, color: colors.text, fontSize: 16 }}>{t.name}</div>
                <div style={{ fontSize: 14, color: colors.textSecondary }}>{t.business}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
