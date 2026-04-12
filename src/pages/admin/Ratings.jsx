import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Star, Users, TrendingUp, MessageSquare, ChevronRight, Search, X, Calendar, ChevronLeft } from 'lucide-react';
import ResponsiveTable from '../../components/ResponsiveTable';

const Ratings = () => {
  const { business } = useAuth();
  const { colors } = useTheme();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [ratingFilter, setRatingFilter] = useState(0); // 0 = Todas, 1-5 = Filtro específico
  const [currentPage, setCurrentPage] = useState(1);
  const [modalPage, setModalPage] = useState(1);
  const itemsPerPage = 10;
  const modalItemsPerPage = 3;

  const loadData = async () => {
    if (!business?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/employees?businessId=${business.id}`);
      setEmployees(res.data || []);
    } catch (e) {
      console.error('Error loading ratings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [business?.id]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.User?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [employees, search]);

  const handleOpenModal = (emp) => {
    setSelectedEmployee(emp);
    setRatingFilter(0);
    setModalPage(1);
  };

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const stats = useMemo(() => {
    const totalReviews = employees.reduce((sum, emp) => sum + (emp.stats?.totalRatings || 0), 0);
    const avgSum = employees.reduce((sum, emp) => sum + (emp.stats?.avgRating || 0) * (emp.stats?.totalRatings || 0), 0);
    const globalAvg = totalReviews > 0 ? (avgSum / totalReviews).toFixed(1) : '0.0';
    return { totalReviews, globalAvg };
  }, [employees]);

  return (
    <AdminLayout title="Calificaciones" subtitle="Gestión de feedback y desempeño de empleados">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 30 }}>
          <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, borderLeft: `4px solid ${colors.primary}` }}>
            <div style={{ padding: 12, background: `${colors.primary}15`, borderRadius: 12, color: colors.primary }}>
              <Star size={24} fill={colors.primary} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 600 }}>Promedio Global</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: colors.text }}>{stats.globalAvg} / 5.0</div>
            </div>
          </div>
          <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, borderLeft: '4px solid #10b981' }}>
            <div style={{ padding: 12, background: '#10b98115', borderRadius: 12, color: '#10b981' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 600 }}>Total Reseñas</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: colors.text }}>{stats.totalReviews}</div>
            </div>
          </div>
        </div>

        {/* Search and Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Lista de Empleados</h3>
            <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: colors.textSecondary }} />
              <input 
                type="text" 
                placeholder="Buscar empleado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: 10,
                  border: `1px solid ${colors.border}`,
                  background: colors.bgSecondary,
                  color: colors.text,
                  fontSize: 14
                }}
              />
            </div>
          </div>

          <ResponsiveTable
            columns={[
              {
                key: 'employee',
                label: 'Empleado',
                render: (v, row) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 40, height: 40, borderRadius: '50%', 
                      background: colors.primary + '15', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: colors.primary
                    }}>
                      {row.User?.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: colors.text }}>{row.User?.name}</div>
                      <div style={{ fontSize: 12, color: colors.textSecondary }}>{row.User?.email}</div>
                    </div>
                  </div>
                )
              },
              {
                key: 'rating',
                label: 'Calificación',
                render: (v, row) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f59e0b15', color: '#f59e0b', padding: '4px 8px', borderRadius: 8 }}>
                      <Star size={14} fill="#f59e0b" />
                      <span style={{ fontWeight: 800, fontSize: 14 }}>{row.stats?.avgRating || '0.0'}</span>
                    </div>
                    <span style={{ fontSize: 12, color: colors.textSecondary }}>({row.stats?.totalRatings || 0} reseñas)</span>
                  </div>
                )
              },
              {
                key: 'distribution',
                label: 'Distribución',
                render: (v, row) => (
                  <div style={{ width: 150, display: 'flex', gap: 2 }}>
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = row.stats?.distribution?.[star] || 0;
                      const pct = row.stats?.totalRatings > 0 ? (count / row.stats.totalRatings) * 100 : 0;
                      return (
                        <div key={star} title={`${star} estrellas: ${count}`} style={{ flex: 1, height: 20, background: colors.border, borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${pct}%`, background: '#f59e0b', transition: 'height 0.5s ease' }} />
                        </div>
                      );
                    })}
                  </div>
                )
              }
            ]}
            data={paginatedEmployees}
            onRowClick={handleOpenModal}
            loading={loading}
            emptyMessage="No se encontraron empleados"
            fullWidthActions={false}
            actions={[
              {
                label: 'Ver Detalles',
                icon: <ChevronRight size={16} />,
                onClick: handleOpenModal,
                color: colors.primary
              }
            ]}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, borderTop: `1px solid ${colors.border}` }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: 8, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.bgSecondary, cursor: 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                <ChevronLeft size={18} />
              </button>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Página {currentPage} de {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: 8, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.bgSecondary, cursor: 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEmployee && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div style={{
            background: colors.cardBg, borderRadius: 20, width: '100%', maxWidth: 600,
            maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '24px 30px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `linear-gradient(to right, ${colors.primary}05, transparent)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 800 }}>
                  {selectedEmployee.User?.name?.charAt(0)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{selectedEmployee.User?.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b' }}>
                    <Star size={16} fill="#f59e0b" />
                    <span style={{ fontWeight: 800 }}>{selectedEmployee.stats?.avgRating || '0.0'}</span>
                    <span style={{ color: colors.textSecondary, fontSize: 13, fontWeight: 400 }}>({selectedEmployee.stats?.totalRatings || 0} reseñas)</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedEmployee(null)} style={{ background: colors.bgSecondary, border: 'none', borderRadius: '50%', pading: 8, cursor: 'pointer', color: colors.textSecondary }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
              <div style={{ marginBottom: 30 }}>
                <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: colors.textSecondary, fontWeight: 700, marginBottom: 16, letterSpacing: '0.05em' }}>Distribución de Estrellas</h4>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = selectedEmployee.stats?.distribution?.[star] || 0;
                  const pct = selectedEmployee.stats?.totalRatings > 0 ? (count / selectedEmployee.stats.totalRatings) * 100 : 0;
                  const isActive = ratingFilter === star;

                  return (
                    <div 
                      key={star} 
                      onClick={() => {
                        setRatingFilter(isActive ? 0 : star);
                        setModalPage(1);
                      }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 12, 
                        marginBottom: 10, 
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: 8,
                        background: isActive ? `${colors.primary}10` : 'transparent',
                        transition: 'all 0.2s',
                        border: isActive ? `1px solid ${colors.primary}30` : '1px solid transparent'
                      }}
                      onMouseOver={(e) => !isActive && (e.currentTarget.style.background = 'rgba(0,0,0,0.02)')}
                      onMouseOut={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 15, color: isActive ? colors.primary : colors.text }}>{star}</span>
                      <div style={{ flex: 1, height: 8, background: colors.bgSecondary, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: isActive ? colors.primary : '#f59e0b', borderRadius: 4, transition: 'all 0.3s' }} />
                      </div>
                      <span style={{ fontSize: 12, color: isActive ? colors.primary : colors.textSecondary, minWidth: 30, textAlign: 'right', fontWeight: isActive ? 700 : 400 }}>{count}</span>
                    </div>
                  );
                })}
                {ratingFilter !== 0 && (
                  <button 
                    onClick={() => {
                      setRatingFilter(0);
                      setModalPage(1);
                    }}
                    style={{ 
                      marginTop: 8, background: 'none', border: 'none', color: colors.primary, 
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 
                    }}
                  >
                    <X size={14} /> Quitar filtro de {ratingFilter} estrellas
                  </button>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: colors.textSecondary, fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>
                    {ratingFilter === 0 ? 'Todas las reseñas' : `Reseñas de ${ratingFilter} estrellas`}
                  </h4>
                  {ratingFilter !== 0 && (
                    <span style={{ fontSize: 11, background: colors.primary, color: 'white', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                      {selectedEmployee.stats?.reviews?.filter(r => r.rating === ratingFilter).length} resultados
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(() => {
                    const filteredReviews = ratingFilter === 0 
                      ? selectedEmployee.stats?.reviews 
                      : selectedEmployee.stats?.reviews?.filter(r => r.rating === ratingFilter);

                    const totalModalPages = Math.ceil((filteredReviews?.length || 0) / modalItemsPerPage);
                    const paginatedModalReviews = filteredReviews?.slice(
                      (modalPage - 1) * modalItemsPerPage,
                      modalPage * modalItemsPerPage
                    );

                    if (paginatedModalReviews?.length > 0) {
                      return (
                        <>
                          {paginatedModalReviews.map((rev) => (
                            <div key={rev.id} style={{ padding: 16, background: colors.bgSecondary, borderRadius: 12, border: `1px solid ${colors.border}` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <span style={{ fontWeight: 700, fontSize: 14 }}>{rev.clientName || 'Cliente'}</span>
                                <div style={{ display: 'flex', gap: 2 }}>
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} fill={i < rev.rating ? "#f59e0b" : "none"} color={i < rev.rating ? "#f59e0b" : colors.textSecondary} />
                                  ))}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.textSecondary }}>
                                <Calendar size={12} />
                                {new Date(rev.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                            </div>
                          ))}
                          
                          {/* Modal Pagination */}
                          {totalModalPages > 1 && (
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center', 
                              gap: 15, 
                              marginTop: 15,
                              padding: '10px 0'
                            }}>
                              <button 
                                onClick={() => setModalPage(p => Math.max(1, p - 1))}
                                disabled={modalPage === 1}
                                style={{ 
                                  padding: '6px 10px', borderRadius: 8, border: `1px solid ${colors.border}`, 
                                  background: colors.bgSecondary, cursor: 'pointer', opacity: modalPage === 1 ? 0.3 : 1,
                                  display: 'flex', alignItems: 'center'
                                }}
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <span style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary }}>
                                {modalPage} / {totalModalPages}
                              </span>
                              <button 
                                onClick={() => setModalPage(p => Math.min(totalModalPages, p + 1))}
                                disabled={modalPage === totalModalPages}
                                style={{ 
                                  padding: '6px 10px', borderRadius: 8, border: `1px solid ${colors.border}`, 
                                  background: colors.bgSecondary, cursor: 'pointer', opacity: modalPage === totalModalPages ? 0.3 : 1,
                                  display: 'flex', alignItems: 'center'
                                }}
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          )}
                        </>
                      );
                    } else {
                      return (
                        <div style={{ textAlign: 'center', padding: 30, color: colors.textSecondary, background: colors.bgSecondary, borderRadius: 12, border: `1px dashed ${colors.border}` }}>
                          <Star size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
                          <div style={{ fontSize: 14 }}>No hay reseñas con {ratingFilter} estrellas.</div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Ratings;
