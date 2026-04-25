import { fmt } from '../../../../shared/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export function ServicesTab({ byService, isTechnical, isMobile }) {
  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
        Servicios más populares
      </h3>
      {byService.length > 0 ? (
        <>
          {/* Gráfica de barras para servicios */}
          <div style={{ 
            padding: 16, 
            background: 'var(--surface)', 
            borderRadius: 12, 
            border: '1px solid var(--border)',
            marginBottom: 24
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
              Top Servicios por Citas
            </h4>
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byService.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10B981" name="Citas" />
                  {!isTechnical && <Bar dataKey="revenue" fill="#3B82F6" name="Ingresos" />}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica de pastel para distribución */}
          <div style={{ 
            padding: 16, 
            background: 'var(--surface)', 
            borderRadius: 12, 
            border: '1px solid var(--border)',
            marginBottom: 24
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
              Distribución de Servicios (Top 5)
            </h4>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byService.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {byService.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lista de servicios */}
          <div style={{ display: 'grid', gap: 12 }}>
            {byService.map((svc, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  background: 'var(--bg-secondary)',
                  borderRadius: 8,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{svc.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{svc.count} cita(s)</div>
                </div>
                {!isTechnical && (
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
                    {fmt(svc.revenue)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p style={{ textAlign: 'center', color: '#a0aec0' }}>Sin datos para mostrar</p>
      )}
    </div>
  );
}
