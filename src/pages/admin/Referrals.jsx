import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Gift, Copy, CheckCircle, Users, Award, ExternalLink } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';

export default function Referrals() {
  const { colors, isDark } = useTheme();
  const [subInfo, setSubInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSub = async () => {
      try {
        const res = await api.get('/businesses/my/subscription-info');
        setSubInfo(res.data);
      } catch (e) {
        console.error('Error fetching referral info:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSub();
  }, []);

  const handleCopy = () => {
    if (subInfo?.referralCode) {
      navigator.clipboard.writeText(subInfo.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    const text = `¡Hola! Te recomiendo este sistema para gestionar tu negocio. Usa mi código *${subInfo.referralCode}* al registrarte y obtendré un beneficio. Regístrate aquí: ${window.location.origin}/register-vendor`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <AdminLayout title="Programa de Referidos">
        <div style={{ padding: 20, textAlign: 'center' }}>Cargando información...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Programa de Referidos" subtitle="Gana descuentos invitando a otros negocios">
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 0' }}>
        
        {/* Card Principal */}
        <div className="card" style={{ 
          padding: 0, 
          overflow: 'hidden', 
          border: 'none',
          boxShadow: `0 10px 25px ${colors.shadow}`
        }}>
          <div style={{ 
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
            padding: '40px 30px',
            color: 'white',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              width: 80, height: 80, borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Gift size={40} />
            </div>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>¡Sé nuestro Embajador!</h2>
            <p style={{ margin: '10px 0 0', opacity: 0.9, fontSize: 16 }}>
              Comparte tu código y obtén hasta un <strong>Mes Gratis</strong> por cada 5 referidos.
            </p>
          </div>

          <div style={{ padding: 30, background: isDark ? colors.bgSecondary : 'white' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
              
              {/* Código */}
              <div style={{ 
                textAlign: 'center', 
                padding: '24px 20px', 
                borderRadius: 20, 
                background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', 
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : colors.border}`,
                boxShadow: isDark ? 'none' : 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>Tu Código Único</p>
                <div style={{ 
                  fontSize: 36, fontWeight: 900, color: colors.primary, letterSpacing: 3, marginBottom: 24,
                  fontFamily: 'monospace',
                  textShadow: isDark ? `0 0 20px ${colors.primary}40` : 'none'
                }}>
                  {subInfo?.referralCode}
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={handleCopy}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
                      borderRadius: 12, fontWeight: 700, cursor: 'pointer',
                      background: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                      color: colors.text,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}`,
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.15)' : '#f1f5f9'}
                    onMouseOut={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'white'}
                  >
                    {copied ? <CheckCircle size={18} color={colors.success} /> : <Copy size={18} />}
                    {copied ? 'Copiado' : 'Copiar Código'}
                  </button>
                  <button 
                    onClick={shareWhatsApp}
                    style={{ 
                      background: '#22c55e', border: 'none', color: 'white',
                      display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
                      borderRadius: 12, fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <ExternalLink size={18} />
                    Compartir
                  </button>
                </div>
              </div>

              {/* Estadísticas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: 15, padding: '18px', borderRadius: 16, 
                  background: isDark ? 'rgba(255,255,255,0.03)' : '#f0f9ff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'transparent'}`
                }}>
                  <div style={{ background: colors.primary, color: 'white', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${colors.primary}40` }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: colors.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>Referidos este mes</p>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: colors.text }}>{subInfo?.monthlyReferrals || 0} Negocios</p>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: 15, padding: '18px', borderRadius: 16, 
                  background: isDark ? 'rgba(255,255,255,0.03)' : '#f0fdf4',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'transparent'}`
                }}>
                  <div style={{ background: '#22c55e', color: 'white', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)' }}>
                    <Award size={24} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: colors.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>Tu beneficio actual</p>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#22c55e' }}>
                      {subInfo?.referralDiscountPercentage === 1 ? '¡MES GRATIS GANADO!' : `${Math.round((subInfo?.referralDiscountPercentage || 0) * 100)}% de Descuento`}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Explicación de niveles */}
            <div style={{ marginTop: 40, paddingTop: 30, borderTop: `1px solid ${colors.border}` }}>
              <h4 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Cómo funciona el programa</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ padding: 15, borderRadius: 12, border: `1px solid ${colors.border}` }}>
                  <div style={{ color: colors.primary, fontWeight: 800, fontSize: 14, marginBottom: 5 }}>NIVEL 1</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 5 }}>20% de Descuento</div>
                  <p style={{ margin: 0, fontSize: 13, color: colors.textSecondary }}>Obtén un 20% de descuento en tu próximo pago por traer de 1 a 4 referidos exitosos.</p>
                </div>
                <div style={{ padding: 15, borderRadius: 12, border: `2px solid ${colors.success}`, background: `${colors.success}05` }}>
                  <div style={{ color: colors.success, fontWeight: 800, fontSize: 14, marginBottom: 5 }}>NIVEL MASTER</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 5 }}>Siguiente Mes Gratis</div>
                  <p style={{ margin: 0, fontSize: 13, color: colors.textSecondary }}>Si traes 5 o más referidos en el mismo ciclo, ¡tu próximo mes es totalmente gratis!</p>
                </div>
              </div>
              <p style={{ marginTop: 20, fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' }}>
                * Los referidos deben completar su primer pago para que el beneficio se aplique.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
