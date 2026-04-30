import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, DollarSign, Award, Activity, Target, ChevronDown, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export function EmployeesTab({ byEmployee, isMobile, isTechnical, analysisType = 'overview', employeeFilter = 'all', showAdvancedFilters = false }) {
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  // Validación segura de datos
  if (!byEmployee || !Array.isArray(byEmployee) || byEmployee.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 40, 
        background: '#F9FAFB', 
        borderRadius: 12, 
        border: '2px dashed #E5E7EB' 
      }}>
        <Users size={48} color="#9CA3AF" style={{ marginBottom: 16 }} />
        <p style={{ color: '#6B7280', fontSize: 14, fontWeight: 500, margin: 0 }}>
          Sin datos de profesionales para mostrar
        </p>
        <p style={{ color: '#9CA3AF', fontSize: 12, margin: '8px 0 0 0' }}>
          Se necesitan asignaciones de citas para generar el análisis
        </p>
      </div>
    );
  }

  // Aplicar filtros avanzados si están activos
  let filteredData = [...byEmployee];
  
  if (showAdvancedFilters && employeeFilter !== 'all') {
    // Primero calcular métricas para poder filtrar por rendimiento
    const calculatedData = byEmployee.map(emp => {
      const total = parseInt(emp.total) || 0;
      const done = parseInt(emp.done) || 0;
      const avgServicesPerDay = parseFloat(emp.avgServicesPerDay) || 0;
      const successRate = total > 0 ? (done / total) * 100 : 0;
      const efficiency = successRate > 80 ? 'Alta' : successRate > 60 ? 'Media' : 'Baja';
      const performanceScore = Math.round((done * 0.4) + (successRate * 0.3) + (avgServicesPerDay * 10 * 0.3));
      
      return {
        ...emp,
        successRate,
        avgPerDay: avgServicesPerDay,
        efficiency,
        performanceScore
      };
    });
    
    // Aplicar filtros
    switch (employeeFilter) {
      case 'top':
        filteredData = calculatedData.sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 10);
        break;
      case 'high':
        filteredData = calculatedData.filter(emp => emp.efficiency === 'Alta');
        break;
      case 'low':
        filteredData = calculatedData.filter(emp => emp.efficiency === 'Baja');
        break;
      default:
        filteredData = calculatedData;
    }
  } else {
    // Si no hay filtros avanzados, usar todos los datos
    filteredData = byEmployee;
  }

  // Calcular métricas adicionales para análisis comparativo con validaciones seguras
  const enhancedData = filteredData.map(emp => {
    // Validaciones seguras para evitar NaN
    const total = parseInt(emp.total) || 0;
    const done = parseInt(emp.done) || 0;
    const cancelled = parseInt(emp.cancelled) || 0;
    const pending = parseInt(emp.pending) || 0;
    const avgServicesPerDay = parseFloat(emp.avgServicesPerDay) || 0;
    
    const successRate = total > 0 ? (done / total) * 100 : 0;
    const avgPerDay = isNaN(avgServicesPerDay) ? 0 : avgServicesPerDay;
    const efficiency = successRate > 80 ? 'Alta' : successRate > 60 ? 'Media' : 'Baja';
    const performanceScore = Math.round((done * 0.4) + (successRate * 0.3) + (avgPerDay * 10 * 0.3));
    
    return {
      ...emp,
      total,
      done,
      cancelled,
      pending,
      successRate: isNaN(successRate) ? 0 : successRate,
      avgPerDay: isNaN(avgPerDay) ? 0 : avgPerDay,
      efficiency,
      performanceScore: isNaN(performanceScore) ? 0 : performanceScore,
      rank: 0 // Se asignará después
    };
  }).sort((a, b) => b.performanceScore - a.performanceScore)
    .map((emp, index) => ({ ...emp, rank: index + 1 }));

  // Datos para gráfica de pastel de eficiencia
  const efficiencyData = [
    { name: 'Alta Eficiencia', value: enhancedData.filter(e => e.efficiency === 'Alta').length, color: '#10B981' },
    { name: 'Media Eficiencia', value: enhancedData.filter(e => e.efficiency === 'Media').length, color: '#F59E0B' },
    { name: 'Baja Eficiencia', value: enhancedData.filter(e => e.efficiency === 'Baja').length, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // Datos para gráfica de tendencia (simulado - en producción vendría de datos históricos)
  const trendData = enhancedData.slice(0, 5).map(emp => {
    const actual = emp.done || 0;
    return {
      name: (emp.name || 'Profesional').split(' ')[0],
      actual: actual,
      anterior: Math.round(actual * (0.8 + Math.random() * 0.4)), // Simulación
      meta: Math.round(actual * (1.1 + Math.random() * 0.3)) // Simulación
    };
  });

  // Paginación
  const totalPages = Math.ceil(enhancedData.length / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedEmployees = enhancedData.slice(startIndex, startIndex + perPage);

  return (
    <div>
      {/* Header empleado al estilo TrackingTab */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>👥 Análisis de Profesionales</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* KPIs rápidos */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#10B981' }}>
                {enhancedData.filter(e => e.efficiency === 'Alta').length || 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Alto Rendimiento</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#3B82F6' }}>
                {enhancedData.length > 0 
                  ? Math.round(enhancedData.reduce((sum, e) => sum + (e.successRate || 0), 0) / enhancedData.length) || 0
                  : 0}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tasa Éxito Promedio</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>Mostrar:</label>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: 13,
              }}
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>
        </div>
      </div>

      {/* Info de paginación */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          fontSize: 13,
          color: 'var(--text-muted)',
        }}
      >
        <span>
          Mostrando {startIndex + 1}-{Math.min(startIndex + perPage, enhancedData.length)} de{' '}
          {enhancedData.length} profesionales
        </span>
        {showAdvancedFilters && (
          <span style={{ 
            padding: '4px 8px', 
            borderRadius: 12, 
            fontSize: 11, 
            background: '#e0e7ff', 
            color: '#4338ca',
            fontWeight: 600
          }}>
            🎯 {employeeFilter.toUpperCase()}
          </span>
        )}
      </div>

      {enhancedData.length > 0 ? (
        <>
          {/* Gráficas visuales */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {/* Gráfica de eficiencia */}
            <div style={{ 
              padding: 16, 
              background: 'var(--surface)', 
              borderRadius: 12, 
              border: '1px solid var(--border)' 
            }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                Distribución de Eficiencia
              </h4>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={efficiencyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {efficiencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfica de tendencia */}
            <div style={{ 
              padding: 16, 
              background: 'var(--surface)', 
              borderRadius: 12, 
              border: '1px solid var(--border)' 
            }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                Tendencia de Desempeño (Top 5)
              </h4>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="anterior" fill="#9CA3AF" name="Período Anterior" />
                    <Bar dataKey="actual" fill="#3B82F6" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Cards de empleados al estilo TrackingTab */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {paginatedEmployees.map((emp) => {
              const isExpanded = expandedId === emp.name;
              const rankColor = emp.rank === 1 ? '#FFD700' : emp.rank === 2 ? '#C0C0C0' : emp.rank === 3 ? '#CD7F32' : '#6B7280';
              const efficiencyColor = emp.efficiency === 'Alta' ? '#10B981' : emp.efficiency === 'Media' ? '#F59E0B' : '#EF4444';

              return (
                <div
                  key={emp.name}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    background: 'var(--surface)',
                  }}
                >
                  {/* Header - clickable */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : emp.name)}
                    style={{
                      padding: 16,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: isExpanded ? 'var(--bg-secondary)' : 'var(--surface)',
                      borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Rank Badge */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: rankColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {emp.rank}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{emp.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {emp.done} de {emp.total} citas completadas
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Efficiency Badge */}
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          background: efficiencyColor + '20',
                          color: efficiencyColor,
                        }}
                      >
                        {emp.efficiency}
                      </span>
                      {/* Performance Score */}
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          background: '#3B82F6',
                          color: 'white',
                        }}
                      >
                        {emp.performanceScore} pts
                      </span>
                      <div
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                        }}
                      >
                        <ChevronDown size={20} color="var(--text-muted)" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{ padding: 16 }}>
                      {/* KPIs Grid */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', 
                        gap: 12, 
                        marginBottom: 16 
                      }}>
                        <div style={{ 
                          padding: 12, 
                          background: '#F0F9FF', 
                          borderRadius: 8, 
                          border: '1px solid #BAE6FD',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: '#0369A1' }}>{emp.total}</div>
                          <div style={{ fontSize: 11, color: '#0369A1' }}>Total Citas</div>
                        </div>
                        <div style={{ 
                          padding: 12, 
                          background: '#D1FAE5', 
                          borderRadius: 8, 
                          border: '1px solid #6EE7B7',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: '#065F46' }}>{emp.done}</div>
                          <div style={{ fontSize: 11, color: '#065F46' }}>Completadas</div>
                        </div>
                        <div style={{ 
                          padding: 12, 
                          background: '#FEF3C7', 
                          borderRadius: 8, 
                          border: '1px solid #FCD34D',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: '#92400E' }}>{emp.successRate.toFixed(1)}%</div>
                          <div style={{ fontSize: 11, color: '#92400E' }}>Tasa Éxito</div>
                        </div>
                        <div style={{ 
                          padding: 12, 
                          background: '#E0E7FF', 
                          borderRadius: 8, 
                          border: '1px solid #A5B4FC',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: '#4338CA' }}>{emp.avgPerDay.toFixed(1)}</div>
                          <div style={{ fontSize: 11, color: '#4338CA' }}>Prom/Día</div>
                        </div>
                      </div>

                      {/* Status Breakdown */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', 
                        gap: 8, 
                        marginBottom: 16 
                      }}>
                        <StatusItem label="Pendientes" value={emp.pending || 0} color="#F59E0B" icon={Clock} />
                        <StatusItem label="Confirmadas" value={emp.confirmed || 0} color="#3B82F6" icon={Calendar} />
                        <StatusItem label="En Atención" value={emp.attention || 0} color="#8B5CF6" icon={Activity} />
                        <StatusItem label="Canceladas" value={emp.cancelled || 0} color="#EF4444" icon={AlertCircle} />
                      </div>

                      {/* Performance Chart */}
                      <div style={{ 
                        padding: 16, 
                        background: 'var(--bg-secondary)', 
                        borderRadius: 8,
                        marginBottom: 16
                      }}>
                        <div style={{ 
                          fontSize: 13, 
                          fontWeight: 700, 
                          color: 'var(--text)', 
                          marginBottom: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}>
                          <TrendingUp size={16} />
                          Rendimiento Detallado
                        </div>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Completadas vs Total</div>
                            <div style={{ 
                              height: 8, 
                              background: '#E5E7EB', 
                              borderRadius: 4, 
                              overflow: 'hidden' 
                            }}>
                              <div 
                                style={{ 
                                  height: '100%', 
                                  width: `${emp.successRate}%`, 
                                  background: '#10B981',
                                  borderRadius: 4 
                                }}
                              />
                            </div>
                          </div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#10B981' }}>
                            {emp.successRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* Financial Info */}
                      {emp.ingresos > 0 && (
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: 12 
                        }}>
                          <div style={{ 
                            padding: 12, 
                            background: '#F0FDF4', 
                            borderRadius: 8, 
                            border: '1px solid #86EFAC'
                          }}>
                            <div style={{ fontSize: 12, color: '#166534', marginBottom: 2 }}>💰 Ingresos Generados</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#166534' }}>
                              ${emp.ingresos.toLocaleString('es-CO')}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 16,
                marginTop: 20,
                padding: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: 8,
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: page === 1 ? 'var(--bg-secondary)' : 'var(--surface)',
                  color: page === 1 ? 'var(--text-muted)' : 'var(--text)',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ← Anterior
              </button>

              <span
                style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', minWidth: 100, textAlign: 'center' }}
              >
                Página {page} de {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: page === totalPages ? 'var(--bg-secondary)' : 'var(--surface)',
                  color: page === totalPages ? 'var(--text-muted)' : 'var(--text)',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Users size={40} color="#cbd5e1" />
          <p style={{ color: '#94a3b8', marginTop: 12 }}>No hay datos de profesionales en este período</p>
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para items de estado
function StatusItem({ label, value, color, icon: Icon }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 8, 
      padding: 8,
      background: color + '10',
      borderRadius: 6,
      border: `1px solid ${color}30`
    }}>
      <Icon size={14} color={color} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#6B7280' }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color }}>{value}</div>
      </div>
    </div>
  );
}
