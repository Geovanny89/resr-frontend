import { useState, useEffect, Fragment } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Componente ResponsiveTable
 * 
 * Convierte tablas en cards en móviles automáticamente.
 * En desktop: muestra tabla tradicional con barra de acciones inferior opcional.
 * En móvil: muestra cards expandibles
 * 
 * Props:
 * - columns: Array de { key, label, render?, width? }
 * - data: Array de objetos con datos
 * - onRowClick?: Función al hacer clic en una fila
 * - actions?: Función o Array de acciones
 * - fullWidthActions?: Boolean (En desktop, muestra acciones en una fila completa debajo de los datos)
 */
export default function ResponsiveTable({ 
  columns, 
  data = [], 
  onRowClick,
  actions = [],
  loading = false,
  emptyMessage = 'No hay datos',
  fullWidthActions = true
}) {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar si es móvil después de montar (seguro para APK)
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 768);
    };
    checkMobile();
    
    const handleResize = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 768);
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
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

  if (!Array.isArray(data) || data.length === 0) {
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
              {actions && !fullWidthActions && <th style={{ width: '100px' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const rowActions = getRowActions(row, idx);
              return (
                <Fragment key={idx}>
                  <tr 
                    onClick={() => onRowClick?.(row)} 
                    style={{ 
                      cursor: onRowClick ? 'pointer' : 'default',
                      borderBottom: fullWidthActions && rowActions?.length > 0 ? 'none' : undefined,
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (!onRowClick) e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
                    }}
                    onMouseOut={(e) => {
                      if (!onRowClick) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {columns.map(col => (
                      <td key={col.key}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                    {actions && !fullWidthActions && (
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
                  
                  {/* Barra de acciones inferior en Desktop si fullWidthActions está activado */}
                  {actions && fullWidthActions && rowActions && rowActions.length > 0 && (
                    <tr style={{ borderTop: 'none', background: 'transparent' }}>
                      <td colSpan={columns.length} style={{ padding: '0 16px 16px' }}>
                        <div style={{ 
                          display: 'flex', 
                          gap: 8, 
                          flexWrap: 'wrap', 
                          padding: '10px 14px', 
                          background: 'rgba(0,0,0,0.02)', 
                          borderRadius: '10px',
                          border: '1px solid rgba(0,0,0,0.05)',
                          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
                        }}>
                          {rowActions.map((action, i) => (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                              title={action.title || action.label}
                              style={{
                                background: action.color || 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s',
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.filter = 'brightness(1.1)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.filter = 'brightness(1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                              }}
                            >
                              {action.icon}
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
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
