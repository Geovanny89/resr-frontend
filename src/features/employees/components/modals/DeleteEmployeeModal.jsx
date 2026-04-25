import { useTheme } from '../../../../context/ThemeContext';

export default function DeleteEmployeeModal({
  isOpen,
  employee,
  onClose,
  onConfirm,
  deleting
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
          maxWidth: 420,
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          textAlign: 'center'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icono */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '24px auto 16px',
            fontSize: 32
          }}
        >
          🗑️
        </div>

        {/* Título */}
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: 20,
            fontWeight: 700,
            color: colors.text
          }}
        >
          ¿Eliminar empleado?
        </h3>

        {/* Descripción */}
        <p
          style={{
            margin: '0 24px 24px',
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 1.5
          }}
        >
          ¿Estás seguro de que deseas eliminar a{' '}
          <strong>{employee.User?.name}</strong>? Esta acción no se puede deshacer.
        </p>

        {/* Botones */}
        <div
          style={{
            padding: '16px 24px 24px',
            display: 'flex',
            gap: 12,
            justifyContent: 'center'
          }}
        >
          <button
            onClick={onClose}
            disabled={deleting}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              background: colors.bg,
              color: colors.text,
              cursor: deleting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              opacity: deleting ? 0.6 : 1
            }}
          >
            No, cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#ef4444',
              color: 'white',
              cursor: deleting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: deleting ? 0.6 : 1
            }}
          >
            {deleting ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block'
                  }}
                />
                Eliminando...
              </>
            ) : (
              'Sí, eliminar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
