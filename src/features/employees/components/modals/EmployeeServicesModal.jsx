import { useTheme } from '../../../../context/ThemeContext';

export default function EmployeeServicesModal({
  isOpen,
  employee,
  availableServices,
  selectedServices,
  loading,
  saving,
  error,
  success,
  onClose,
  onToggleService,
  onSave
}) {
  const { colors } = useTheme();

  if (!isOpen || !employee) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.cardBg,
          borderRadius: 16,
          width: '100%',
          maxWidth: 600,
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: colors.text
              }}
            >
              💼 Servicios de {employee.User?.name}
            </h3>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: 13,
                color: colors.textSecondary
              }}
            >
              Selecciona los servicios que este profesional puede realizar
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: colors.textSecondary,
              padding: '4px 8px'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px' }}>
          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 14
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: '#d1fae5',
                color: '#059669',
                padding: '12px 16px',
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 14
              }}
            >
              {success}
            </div>
          )}

          {loading ? (
            <div
              style={{
                textAlign: 'center',
                padding: 40,
                color: colors.textSecondary
              }}
            >
              Cargando servicios...
            </div>
          ) : availableServices.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 40,
                color: colors.textSecondary
              }}
            >
              No hay servicios disponibles. Crea servicios primero.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 10
              }}
            >
              {availableServices.map(service => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => onToggleService(service.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: `2px solid ${isSelected ? 'var(--primary)' : colors.border}`,
                      background: isSelected
                        ? 'rgba(79, 70, 229, 0.08)'
                        : colors.bg,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      minHeight: 44
                    }}
                  >
                    {/* Checkbox circular */}
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: `2px solid ${isSelected ? 'var(--primary)' : colors.border}`,
                        background: isSelected ? 'var(--primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        flexShrink: 0
                      }}
                    >
                      {isSelected && (
                        <span style={{ color: 'white', fontSize: 12 }}>✓</span>
                      )}
                    </div>

                    {/* Solo el nombre del servicio */}
                    <div
                      style={{
                        fontWeight: isSelected ? 600 : 500,
                        fontSize: 14,
                        color: colors.text,
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {service.name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info tip */}
          <div
            style={{
              marginTop: 20,
              padding: '12px 16px',
              background: '#f0f9ff',
              borderRadius: 8,
              borderLeft: '4px solid #0ea5e9'
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: '#0369a1' }}>
              💡 <strong>Consejo:</strong> Si no asignas ningún servicio al
              profesional, podrá realizar todos los servicios por defecto. Asigna
              servicios específicos para limitar qué puede hacer.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              background: colors.bg,
              color: colors.text,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving || loading}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              cursor: saving || loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              opacity: saving || loading ? 0.7 : 1
            }}
          >
            {saving ? 'Guardando...' : '💾 Guardar servicios'}
          </button>
        </div>
      </div>
    </div>
  );
}
