import { Globe, Phone, MapPin } from 'lucide-react';
import { getImgUrl, isShortGoogleMapsUrl } from '../utils';

export default function InfoGridSection({ business, primary, isDark }) {
  const infoItems = [];
  
  if (business.address) {
    infoItems.push({
      icon: MapPin,
      label: 'Dirección',
      value: business.address,
      href: business.googleMapsUrl && isShortGoogleMapsUrl(business.googleMapsUrl) 
        ? business.googleMapsUrl 
        : null
    });
  }
  
  if (business.phone) {
    infoItems.push({
      icon: Phone,
      label: 'Teléfono',
      value: business.phone,
      href: `tel:${business.phone.replace(/\D/g, '')}`
    });
  }
  
  if (business.website) {
    infoItems.push({
      icon: Globe,
      label: 'Website',
      value: business.website.replace(/^https?:\/\//, ''),
      href: business.website.startsWith('http') ? business.website : `https://${business.website}`
    });
  }

  if (infoItems.length === 0) return null;

  return (
    <div className="info-grid" style={{ marginBottom: 60 }}>
      {infoItems.map((item, idx) => {
        const Icon = item.icon;
        const content = (
          <div className="info-card" style={{
            background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.75)',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'
          }}>
            <div className="info-icon" style={{ 
              background: `${primary}15`,
              color: primary 
            }}>
              <Icon size={24} />
            </div>
            <div>
              <div style={{ 
                fontSize: 12, 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: 1,
                color: primary,
                marginBottom: 4 
              }}>
                {item.label}
              </div>
              <div style={{ 
                fontWeight: 600, 
                fontSize: 14,
                color: isDark ? 'white' : '#0f172a'
              }}>
                {item.value}
              </div>
            </div>
          </div>
        );
        
        return item.href ? (
          <a key={idx} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{ textDecoration: 'none' }}>
            {content}
          </a>
        ) : (
          <div key={idx}>{content}</div>
        );
      })}
    </div>
  );
}
