import { Phone, MapPin, Clock } from 'lucide-react';
import SocialLink from './SocialLink';

export default function FooterSection({ business, primary, isDark }) {
  const hasWhatsapp = !!business.whatsapp;
  const hasSocials = !!(business.instagram || business.facebook || business.tiktok || 
    business.twitter || business.pinterest || business.youtube || business.website || business.whatsappCatalog);
  const whatsappNum = business.whatsapp ? business.whatsapp.replace(/\D/g, '') : '';

  return (
    <footer style={{ padding: '80px 24px 60px', textAlign: 'center', background: isDark ? '#020617' : 'white', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 40, letterSpacing: -1.5, color: isDark ? 'white' : '#0f172a' }}>{business.name}</h2>

        {/* INFO DE CONTACTO EN FOOTER */}
        {(business.address || business.phone || business.businessHours) && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '32px 48px',
            marginBottom: 48,
            padding: '32px 24px',
            background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.8)',
            borderRadius: 24,
            maxWidth: 800,
            margin: '0 auto 48px'
          }}>
            {business.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: isDark ? 'rgba(255,255,255,0.9)' : '#334155' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `${primary}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: primary
                }}>
                  <MapPin size={20} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6, marginBottom: 2 }}>Dirección</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{business.address}</div>
                </div>
              </div>
            )}
            {business.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: isDark ? 'rgba(255,255,255,0.9)' : '#334155' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `${primary}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: primary
                }}>
                  <Phone size={20} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6, marginBottom: 2 }}>Teléfono</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{business.phone}</div>
                </div>
              </div>
            )}
            {business.businessHours && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                color: isDark ? 'rgba(255,255,255,0.9)' : '#334155',
                width: '100%',
                maxWidth: 500
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${primary}30, ${primary}10)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: primary,
                  boxShadow: `0 4px 15px ${primary}25` 
                }}>
                  <Clock size={24} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    opacity: 0.7,
                    marginBottom: 12,
                    color: primary
                  }}>
                    Horario de Atención
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: 1.6
                  }}>
                    {(() => {
                      const lines = business.businessHours.split(/\n|\\n/);
                      const scheduleItems = [];

                      for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;

                        const match = line.match(/^([^\d]+)(\d.*)$/);
                        if (match) {
                          scheduleItems.push({ day: match[1].trim(), hours: match[2].trim() });
                        } else if (/\d/.test(line)) {
                          if (scheduleItems.length > 0 && !scheduleItems[scheduleItems.length - 1].hours) {
                            scheduleItems[scheduleItems.length - 1].hours = line;
                          } else {
                            scheduleItems.push({ day: '', hours: line });
                          }
                        } else {
                          scheduleItems.push({ day: line, hours: '' });
                        }
                      }

                      return scheduleItems.map((item, idx) => {
                        const { day, hours } = item;

                        let cleanHours = hours
                          .replace(/\s+/g, ' ')
                          .replace(/:\s+/g, ':')
                          .replace(/pp\.m/gi, 'p.m')
                          .replace(/:\s*05:\s*p\.?m/gi, '- 05:00 p.m')
                          .trim();

                        const afternoonStartMatch = cleanHours.match(/(12:\d{2}\s*m)[^\d]*\d{1,2}:\d{2}/i);

                        if (afternoonStartMatch) {
                          const morningEndIndex = afternoonStartMatch.index + afternoonStartMatch[1].length;
                          const morningPart = cleanHours.substring(0, morningEndIndex).trim();
                          const afternoonPart = cleanHours.substring(morningEndIndex).trim()
                            .replace(/^[^\d]*/, '');

                          const morning = morningPart.replace(/\s*-\s*/g, ' - ');
                          const afternoon = afternoonPart.replace(/\s*-\s*/g, ' - ')
                            .replace(/^[^\d]*(\d)/, '$1');

                          return (
                            <div key={idx} style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 4,
                              padding: '10px 16px',
                              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
                              borderRadius: 10,
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                              textAlign: 'left'
                            }}>
                              <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                                <span style={{
                                  fontWeight: 700,
                                  color: primary,
                                  textTransform: 'capitalize',
                                  whiteSpace: 'nowrap',
                                  minWidth: 110
                                }}>
                                  {day}
                                </span>
                                <span style={{
                                  color: isDark ? 'rgba(255,255,255,0.9)' : '#475569'
                                }}>
                                  {morning}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                                <span style={{ minWidth: 110 }}></span>
                                <span style={{
                                  color: isDark ? 'rgba(255,255,255,0.9)' : '#475569'
                                }}>
                                  {afternoon}
                                </span>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={idx} style={{
                            padding: '10px 16px',
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
                            borderRadius: 10,
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                            textAlign: 'left'
                          }}>
                            <div style={{ display: 'flex', gap: 16 }}>
                              <span style={{
                                fontWeight: 700,
                                color: primary,
                                textTransform: 'capitalize',
                                whiteSpace: 'nowrap',
                                minWidth: 110
                              }}>
                                {day}
                              </span>
                              <span style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#475569' }}>
                                {cleanHours}
                              </span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
          {hasSocials && (
            <>
              {business.instagram && <SocialLink href={business.instagram} iconUrl="/instagram.png" label="Instagram" color="#E1306C" />}
              {business.facebook && <SocialLink href={business.facebook} iconUrl="/facebook.png" label="Facebook" color="#1877F2" />}
              {business.tiktok && <SocialLink href={business.tiktok} iconUrl="/tik-tok.png" label="TikTok" color="#000000" invert={isDark} />}
              {business.twitter && <SocialLink href={business.twitter} iconUrl="/x.png" label="X" color="#000000" invert={isDark} hoverColor="#1DA1F2" />}
              {business.pinterest && <SocialLink href={business.pinterest} iconUrl="/pinterest.png" label="Pinterest" color="#E60023" />}
              {business.youtube && <SocialLink href={business.youtube} iconUrl="/youtube.png" label="YouTube" color="#FF0000" />}
              {business.website && <SocialLink href={business.website} iconUrl="/web.png" label="Website" color={primary} />}
            </>
          )}
        </div>
        <div style={{ opacity: 0.4, fontSize: 14, fontWeight: 600, letterSpacing: 1, color: isDark ? 'white' : '#0f172a' }}>
          © {new Date().getFullYear()} — IMPULSADO POR K-DICE POS v5.0
        </div>
      </div>

      {/* WHATSAPP FLOAT */}
      {hasWhatsapp && (
        <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noreferrer" className="whatsapp-float">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      )}
    </footer>
  );
}
