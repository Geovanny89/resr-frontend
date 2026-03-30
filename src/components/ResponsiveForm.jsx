import { useState, useEffect } from 'react';

/**
 * Componente ResponsiveForm - Versión Completa y Ajustada
 */
export default function ResponsiveForm({
  fields = [],
  onSubmit,
  submitText = 'Guardar',
  loading = false,
  columns = 2,
  error = null,
  success = null
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Corregido: useEffect para el listener (antes estaba como useState)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      style={{
        width: '100%',
        maxWidth: columns >= 7 && !isMobile ? '500px' : '100%', // Evita que el calendario se estire en PC
        margin: '0 auto' // Lo centra si tiene un ancho máximo
      }}
    >
      {/* Alertas */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" style={{ marginBottom: 16 }}>
          {success}
        </div>
      )}

      {/* Grilla de campos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : `repeat(${columns}, 1fr)`,
          gap: 16,
          marginBottom: 24
        }}
      >
        {fields.map(field => (
          <div
            key={field.name}
            style={{
              gridColumn: field.fullWidth && !isMobile ? `1 / -1` : 'auto',
              // Mantenemos la proporción si es un calendario (7 columnas o más)
              aspectRatio: columns >= 7 ? '1 / 1' : 'auto' 
            }}
          >
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 6,
              color: 'var(--gray-700)'
            }}>
              {field.label}
              {field.required && <span style={{ color: 'var(--danger)' }}> *</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                name={field.name}
                value={field.value || ''}
                onChange={field.onChange}
                placeholder={field.placeholder}
                required={field.required}
                disabled={loading}
                rows={field.rows || 4}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'all 0.2s',
                  resize: 'vertical'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            ) : field.type === 'select' ? (
              <select
                name={field.name}
                value={field.value || ''}
                onChange={field.onChange}
                required={field.required}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'all 0.2s',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  cursor: 'pointer'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              >
                <option value="">Seleccionar...</option>
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || 'text'}
                name={field.name}
                value={field.value || ''}
                onChange={field.onChange}
                placeholder={field.placeholder}
                required={field.required}
                disabled={loading}
                style={{
                  width: '100%',
                  height: columns >= 7 ? '100%' : 'auto', // Para que el botón/input llene el cuadrado del calendario
                  padding: '10px 14px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'all 0.2s',
                  textAlign: columns >= 7 ? 'center' : 'left' // Centrado si es calendario
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            )}

            {field.hint && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {field.hint}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: isMobile ? '100%' : 'auto',
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          padding: isMobile ? '12px 24px' : '10px 24px',
          fontSize: isMobile ? 14 : 13,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => !loading && (e.target.style.background = 'var(--primary-dark)')}
        onMouseLeave={e => !loading && (e.target.style.background = 'var(--primary)')}
      >
        {loading ? '⏳ Guardando...' : submitText}
      </button>
    </form>
  );
}