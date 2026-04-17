import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import EmployeeLayout from '../../components/EmployeeLayout';
import api from '../../api/client';
import { 
  Star,
  MessageSquare,
  Calendar,
  User,
  TrendingUp,
  Loader2
} from 'lucide-react';

const ITEMS_PER_PAGE = 5;

export default function EmployeeRatings() {
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/employees/me/ratings');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar calificaciones');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < rating ? '#fbbf24' : 'transparent'}
        color={i < rating ? '#fbbf24' : colors.border}
      />
    ));
  };

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString('es-CO', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    });

  // Paginación
  const totalRatings = data?.ratings?.length || 0;
  const totalPages = Math.ceil(totalRatings / ITEMS_PER_PAGE);
  const paginatedRatings = data?.ratings?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <EmployeeLayout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: colors.primary, margin: '0 auto 16px' }} />
            <p style={{ color: colors.textSecondary }}>Cargando calificaciones...</p>
          </div>
        ) : error ? (
          <div style={{
            background: colors.isDark ? '#7f1d1d' : '#fed7d7',
            color: colors.isDark ? '#fca5a5' : '#c53030',
            padding: 16,
            borderRadius: 8,
            textAlign: 'center'
          }}>
            {error}
          </div>
        ) : (
          <>
            {/* Estadísticas */}
            {data?.stats && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 16,
                marginBottom: 24
              }}>
                {/* Promedio */}
                <div style={{
                  background: colors.cardBg,
                  padding: 20,
                  borderRadius: 12,
                  boxShadow: `0 2px 8px ${colors.shadow}`,
                  border: `1px solid ${colors.border}`,
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: `${colors.primary}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px'
                  }}>
                    <TrendingUp size={24} color={colors.primary} />
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: colors.text }}>
                    {data.stats.avgRating}
                  </div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>
                    Promedio
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 8 }}>
                    {renderStars(Math.round(data.stats.avgRating))}
                  </div>
                </div>

                {/* Total */}
                <div style={{
                  background: colors.cardBg,
                  padding: 20,
                  borderRadius: 12,
                  boxShadow: `0 2px 8px ${colors.shadow}`,
                  border: `1px solid ${colors.border}`,
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: '#fbbf2415',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px'
                  }}>
                    <Star size={24} color="#fbbf24" fill="#fbbf24" />
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: colors.text }}>
                    {data.stats.total}
                  </div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>
                    Calificaciones
                  </div>
                </div>
              </div>
            )}

            {/* Distribución */}
            {data?.stats?.distribution && data.stats.total > 0 && (
              <div style={{
                background: colors.cardBg,
                padding: 20,
                borderRadius: 12,
                boxShadow: `0 2px 8px ${colors.shadow}`,
                border: `1px solid ${colors.border}`,
                marginBottom: 24
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 16 }}>
                  Distribución de Calificaciones
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = data.stats.distribution[star] || 0;
                    const percentage = data.stats.total > 0 
                      ? (count / data.stats.total) * 100 
                      : 0;
                    return (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: 60 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{star}</span>
                          <Star size={14} color="#fbbf24" fill="#fbbf24" />
                        </div>
                        <div style={{ flex: 1, height: 8, background: colors.bgSecondary, borderRadius: 4, overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${percentage}%`, 
                              height: '100%', 
                              background: star >= 4 ? '#22c55e' : star === 3 ? '#fbbf24' : '#ef4444',
                              borderRadius: 4,
                              transition: 'width 0.3s ease'
                            }} 
                          />
                        </div>
                        <span style={{ fontSize: 12, color: colors.textSecondary, width: 40, textAlign: 'right' }}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lista de calificaciones */}
            <div style={{
              background: colors.cardBg,
              borderRadius: 12,
              boxShadow: `0 2px 8px ${colors.shadow}`,
              border: `1px solid ${colors.border}`,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '20px',
                borderBottom: `1px solid ${colors.border}`
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: 0 }}>
                  Reseñas de Clientes
                </h2>
              </div>

              {!data?.ratings?.length ? (
                <div style={{ textAlign: 'center', padding: 60 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
                  <p style={{ color: colors.textSecondary, fontSize: 16 }}>
                    Aún no tienes calificaciones
                  </p>
                  <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 8 }}>
                    Los clientes pueden calificarte después de cada servicio completado
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 1 }}>
                  {paginatedRatings.map((rating, idx) => (
                    <div 
                      key={rating.id}
                      style={{
                        padding: 20,
                        background: idx % 2 === 0 ? 'transparent' : colors.bgSecondary,
                        borderBottom: `1px solid ${colors.border}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: colors.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <User size={18} color="white" />
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                              {rating.clientName || 'Cliente Anónimo'}
                            </div>
                            <div style={{ fontSize: 12, color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={12} />
                              {fmtDate(rating.date)}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {renderStars(rating.rating)}
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: 8 }}>
                        <span style={{
                          fontSize: 12,
                          color: colors.primary,
                          background: colors.primary + '15',
                          padding: '4px 8px',
                          borderRadius: 4
                        }}>
                          {rating.service}
                        </span>
                      </div>

                      {rating.comment && (
                        <div style={{ 
                          background: colors.bg,
                          padding: 12,
                          borderRadius: 8,
                          borderLeft: `3px solid ${colors.primary}`
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <MessageSquare size={16} color={colors.textSecondary} style={{ marginTop: 2, flexShrink: 0 }} />
                            <p style={{ margin: 0, fontSize: 14, color: colors.text, lineHeight: 1.5 }}>
                              {rating.comment}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Controles de paginación */}
                  {totalPages > 1 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 12,
                      padding: '16px 20px',
                      borderTop: `1px solid ${colors.border}`,
                      background: colors.bgSecondary
                    }}>
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 6,
                          border: `1px solid ${colors.border}`,
                          background: colors.cardBg,
                          color: colors.text,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          opacity: currentPage === 1 ? 0.5 : 1
                        }}
                      >
                        ← Anterior
                      </button>
                      <span style={{ fontSize: 14, color: colors.textSecondary }}>
                        Página {currentPage} de {totalPages}
                      </span>
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 6,
                          border: `1px solid ${colors.border}`,
                          background: colors.cardBg,
                          color: colors.text,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                          opacity: currentPage === totalPages ? 0.5 : 1
                        }}
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </EmployeeLayout>
  );
}
