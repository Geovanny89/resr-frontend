import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import { 
  Users,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Briefcase,
  Search,
  Loader2,
  Crown
} from 'lucide-react';

const ITEMS_PER_PAGE = 5;

export default function EmployeeClients() {
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [isTechnicalServices, setIsTechnicalServices] = useState(false);
  const [hasFieldTechnicians, setHasFieldTechnicians] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      // Cargar clientes y perfil del empleado (para saber si es servicio técnico)
      const [clientsRes, profileRes] = await Promise.all([
        api.get('/employees/me/clients'),
        api.get('/employees/me/info')
      ]);
      setData(clientsRes.data);
      setIsTechnicalServices(profileRes.data?.business?.isTechnicalServices || false);
      setHasFieldTechnicians(profileRes.data?.business?.hasFieldTechnicians || false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('es-CO', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    }) : 'N/A';

  const filteredClients = data?.clients?.filter(client => {
    const searchLower = search.toLowerCase();
    return (
      (client.name && client.name.toLowerCase().includes(searchLower)) ||
      (client.phone && client.phone.includes(searchLower)) ||
      (client.email && client.email.toLowerCase().includes(searchLower))
    );
  }) || [];

  // Paginación
  const totalClients = filteredClients.length;
  const totalPages = Math.ceil(totalClients / ITEMS_PER_PAGE);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const getTopBadge = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return null;
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: colors.primary, margin: '0 auto 16px' }} />
            <p style={{ color: colors.textSecondary }}>Cargando clientes...</p>
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
            {/* Buscador */}
            <div style={{
              background: colors.cardBg,
              padding: 16,
              borderRadius: 12,
              boxShadow: `0 2px 8px ${colors.shadow}`,
              border: `1px solid ${colors.border}`,
              marginBottom: 20
            }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} color={colors.textSecondary} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar cliente por nombre, teléfono o email..."
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 44px',
                    borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.bg,
                    color: colors.text,
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>
              {search && (
                <p style={{ margin: '8px 0 0 0', fontSize: 12, color: colors.textMuted }}>
                  {filteredClients.length} resultado{filteredClients.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Lista de clientes */}
            {!filteredClients.length ? (
              <div style={{
                background: colors.cardBg,
                padding: 60,
                borderRadius: 12,
                boxShadow: `0 2px 8px ${colors.shadow}`,
                border: `1px solid ${colors.border}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                <p style={{ color: colors.textSecondary, fontSize: 16 }}>
                  {search ? 'No se encontraron clientes' : 'Aún no tienes clientes registrados'}
                </p>
                {!search && (
                  <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 8 }}>
                    Los clientes aparecerán aquí después de que completes tus primeras citas
                  </p>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {paginatedClients.map((client, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: colors.cardBg,
                      borderRadius: 12,
                      boxShadow: `0 2px 8px ${colors.shadow}`,
                      border: `1px solid ${colors.border}`,
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: idx < 3 ? `linear-gradient(135deg, #fbbf24, #f59e0b)` : colors.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: idx < 3 ? 24 : 18,
                            fontWeight: 700,
                            color: 'white'
                          }}>
                            {idx < 3 ? getTopBadge(idx) : (client.name ? client.name.charAt(0).toUpperCase() : '?')}
                          </div>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 2 }}>
                              {client.name || 'Cliente Anónimo'}
                            </div>
                            {idx < 3 && !hasFieldTechnicians && (
                              <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Crown size={12} />
                                Cliente VIP
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 24, fontWeight: 800, color: colors.primary }}>
                            {client.visits}
                          </div>
                          <div style={{ fontSize: 12, color: colors.textSecondary }}>
                            visita{client.visits !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      {/* Información de contacto */}
                      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
                        {client.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: colors.text }}>
                            <Phone size={16} color={colors.textSecondary} />
                            {client.phone}
                          </div>
                        )}
                        {client.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: colors.text }}>
                            <Mail size={16} color={colors.textSecondary} />
                            {client.email}
                          </div>
                        )}
                      </div>

                      {/* Estadísticas */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: 12,
                        padding: 12,
                        background: colors.bgSecondary,
                        borderRadius: 8
                      }}>
                        {!isTechnicalServices && !hasFieldTechnicians && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <DollarSign size={16} color="#10b981" />
                            <div>
                              <div style={{ fontSize: 12, color: colors.textSecondary }}>Total gastado</div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                                ${client.totalSpent.toLocaleString('es-CO')}
                              </div>
                            </div>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Calendar size={16} color={colors.primary} />
                          <div>
                            <div style={{ fontSize: 12, color: colors.textSecondary }}>Última visita</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                              {fmtDate(client.lastVisit)}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <Briefcase size={16} color="#f59e0b" style={{ marginTop: 2 }} />
                          <div>
                            <div style={{ fontSize: 12, color: colors.textSecondary }}>Servicios</div>
                            <div style={{ fontSize: 13, color: colors.text, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {client.services.slice(0, 3).map((s, i) => (
                                <span key={i} style={{ 
                                  background: colors.bg, 
                                  padding: '2px 6px', 
                                  borderRadius: 4,
                                  fontSize: 12
                                }}>
                                  {s}
                                </span>
                              ))}
                              {client.services.length > 3 && (
                                <span style={{ fontSize: 12, color: colors.textMuted }}>
                                  +{client.services.length - 3} más
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                    marginTop: 8,
                    background: colors.cardBg,
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`
                  }}>
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 6,
                        border: `1px solid ${colors.border}`,
                        background: colors.bg,
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
                        background: colors.bg,
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
          </>
        )}
      </div>
  );
}
