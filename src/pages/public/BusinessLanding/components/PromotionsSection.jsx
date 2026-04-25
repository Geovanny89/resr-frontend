import { Calendar } from 'lucide-react';

export default function PromotionsSection({ business, primary }) {
  const promotions = business.Promotions || business.promotions || [];
  
  if (promotions.length === 0) return null;

  return (
    <section className="promo-section" style={{
      background: `linear-gradient(135deg, ${primary} 0%, ${business.secondaryColor || '#764ba2'} 100%)`
    }}>
      <div className="section-header">
        <span className="section-label" style={{ color: 'rgba(255,255,255,0.9)' }}>OFERTAS EXCLUSIVAS</span>
        <h2 className="section-title" style={{ color: 'white' }}>Promociones para ti 🔥</h2>
      </div>
      <div className="promo-grid">
        {promotions.map((promo, idx) => (
          <div key={idx} className="promo-card">
            <div className="promo-badge">
              <span className="promo-value">{promo.discountType === 'percentage' ? `${Math.round(promo.discountValue)}%` : '$'}</span>
              <span className="promo-type">OFF</span>
            </div>
            <div className="promo-info">
              <h3 style={{ color: 'white' }}>{promo.name}</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                {promo.applyToAllServices ? 'Aplica en todos nuestros servicios' : 'Disponible en servicios seleccionados'}
              </p>
              {promo.endDate && (
                <div style={{ 
                  marginTop: 12, 
                  fontSize: 12, 
                  fontWeight: 700, 
                  color: 'white',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6 
                }}>
                  <Calendar size={14} /> Válido hasta: {new Date(promo.endDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
