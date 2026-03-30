import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Componente ResponsiveTable
 * 
 * Convierte tablas en cards en móviles automáticamente.
 * En desktop: muestra tabla tradicional
 * En móvil: muestra cards expandibles
 * 
 * Props:
 * - columns: Array de { key, label, render?, width? }
 * - data: Array de objetos con datos
 * - onRowClick?: Función al hacer clic en una fila
 * - actions?: Array de { label, onClick, icon?, color? }
 */
export default function ResponsiveTable({ 
  columns, 
  data = [], 
  onRowClick,
  actions = [],
  loading = false,
  emptyMessage = 'No hay datos'
}) {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Detectar cambios de tamaño
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleRow = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
        <div style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        Cargando...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
        {emptyMessage}
      </div>
    );
  }

  // Función para obtener las acciones de una fila
  const getRowActions = (row, index) => {
    if (typeof actions === 'function') {
      return actions(row, index);
    }
    return actions;
  };

  // VISTA DESKTOP: Tabla tradicional
  if (!isMobile) {
    return (
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
              {actions && <th style={{ width: '100px' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const rowActions = getRowActions(row, idx);
              return (
                <tr key={idx} onClick={() => onRowClick?.(row)} style={{ cursor: onRowClick ? 'pointer' : 'default' }}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {rowActions && rowActions.map((action, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            style={{
                              background: action.color || 'var(--primary)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              padding: '6px 10px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            {action.icon && <span style={{ fontSize: 12 }}>{action.icon}</span>}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // VISTA MÓVIL: Cards expandibles
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map((row, idx) => {
        const rowActions = getRowActions(row, idx);
        return (
          <div
            key={idx}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Header de la Card */}
            <div
              onClick={() => toggleRow(idx)}
              style={{
                padding: '12px 16px',
                background: expandedRows.has(idx) ? 'var(--primary-bg)' : 'var(--surface)',
                borderBottom: expandedRows.has(idx) ? '1px solid var(--border)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ flex: 1 }}>
                {/* Mostrar los primeros 2 campos en el resumen */}
                {columns.slice(0, 2).map((col, i) => (
                  <div key={col.key} style={{ fontSize: i === 0 ? 14 : 12, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? 'var(--text)' : 'var(--text-muted)', marginBottom: i === 0 ? 4 : 0 }}>
                    {i === 0 && <strong>{col.render ? col.render(row[col.key], row) : row[col.key]}</strong>}
                    {i === 1 && <span>{col.label}: {col.render ? col.render(row[col.key], row) : row[col.key]}</span>}
                  </div>
                ))}
              </div>
              <ChevronDown
                size={20}
                style={{
                  color: 'var(--text-muted)',
                  transform: expandedRows.has(idx) ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s'
                }}
              />
            </div>

            {/* Contenido expandido */}
            {expandedRows.has(idx) && (
              <div style={{ padding: '12px 16px' }}>
                {/* Todos los campos */}
                {columns.map(col => (
                  <div key={col.key} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                      {col.label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </div>
                  </div>
                ))}

                {/* Acciones */}
                {actions && rowActions && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, marginTop: 12 }}>
                    {rowActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => action.onClick(row)}
                        style={{
                          background: action.color || 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4
                        }}
                      >
                        {action.icon && <span>{action.icon}</span>}
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
