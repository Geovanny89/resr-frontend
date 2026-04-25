import { MapPin, ExternalLink } from 'lucide-react';
import { getGoogleMapsEmbedUrl, isShortGoogleMapsUrl } from '../utils';

export default function LocationMapSection({ business, primary, isDark }) {
  if (!business.googleMapsUrl) return null;

  const embedUrl = getGoogleMapsEmbedUrl(business.googleMapsUrl);
  const isShortUrl = isShortGoogleMapsUrl(business.googleMapsUrl);

  return (
    <section className="section-card" style={{ 
      marginTop: 40,
      background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.75)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'
    }}>
      <div className="section-header">
        <span className="section-label">Ubicación</span>
        <h2 className="section-title" style={{ color: isDark ? 'white' : '#0f172a' }}>Encuéntranos aquí</h2>
      </div>

      {isShortUrl ? (
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
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 16,
            color: isDark ? 'white' : '#0f172a'
          }}>
            Ver ubicación en Google Maps
          </p>
          <p style={{
            fontSize: 14,
            opacity: 0.7,
            marginBottom: 24,
            color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b'
          }}>
            Abre la dirección completa en la app de Google Maps
          </p>
          <a
            href={business.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
              color: 'white',
              borderRadius: 12,
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 20px rgba(66, 133, 244, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 30px rgba(66, 133, 244, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 20px rgba(66, 133, 244, 0.3)';
            }}
          >
            <MapPin size={18} />
            Abrir en Google Maps
            <ExternalLink size={16} />
          </a>
        </div>
      ) : (
        <div style={{
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 20px 50px -12px rgba(0,0,0,0.15)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`
        }}>
          <iframe
            src={embedUrl}
            width="100%"
            height="400"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación en Google Maps"
          />
        </div>
      )}
    </section>
  );
}
