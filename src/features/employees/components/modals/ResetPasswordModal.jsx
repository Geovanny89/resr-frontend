import { useState, useEffect } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { CheckCircle, Copy } from 'lucide-react';

export default function ResetPasswordModal({ isOpen, employee, onClose, onConfirm, saving, successPassword }) {
  const { colors } = useTheme();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Resetear el estado cuando se abre o cierra el modal
  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setError('');
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen || !employee) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setError('');
    onConfirm(employee.id, newPassword);
  };

  const copyToClipboard = () => {
    if (successPassword) {
      navigator.clipboard.writeText(successPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {successPassword ? (
          // --- ESTADO DE ÉXITO ---
          <div style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ 
              width: 64, height: 64, borderRadius: '50%', background: '#d1fae5', 
              color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 16px' 
            }}>
              <CheckCircle size={32} />
            </div>
            
            <h3 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 700, color: colors.text }}>
              ¡Contraseña Actualizada!
            </h3>
            
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24, lineHeight: 1.5 }}>
              La contraseña de <strong>{employee.User?.name}</strong> se ha cambiado correctamente. Cópiala y envíasela para que pueda acceder.
            </p>

            <div style={{ 
              background: colors.bg, border: `1px dashed ${colors.border}`, 
              borderRadius: 8, padding: 16, marginBottom: 24,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '2px', color: colors.text }}>
                {successPassword}
              </div>
              <button
                onClick={copyToClipboard}
                style={{
                  background: copied ? '#10b981' : colors.primary,
                  color: 'white', border: 'none', borderRadius: 6,
                  padding: '6px 12px', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s'
                }}
              >
                {copied ? <><CheckCircle size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '12px', borderRadius: 8, border: 'none',
                background: colors.bgSecondary, color: colors.text,
                cursor: 'pointer', fontWeight: 600, fontSize: 15
              }}
            >
              Cerrar y volver
            </button>
          </div>
        ) : (
          // --- ESTADO DE FORMULARIO ---
          <>
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: colors.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                🔑 Cambiar Contraseña
              </h3>
              <button 
                onClick={onClose}
                style={{ background: 'transparent', border: 'none', color: colors.textSecondary, cursor: 'pointer', fontSize: 20 }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: 20, fontSize: 14, color: colors.textSecondary, lineHeight: 1.5 }}>
                Estás a punto de cambiar la contraseña de acceso para el profesional:
                <strong style={{ display: 'block', marginTop: 4, color: colors.text, fontSize: 16 }}>
                  {employee.User?.name || 'Profesional'}
                </strong>
              </div>

              {error && (
                <div style={{ padding: 12, background: '#fee2e2', color: '#dc2626', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: colors.text }}>
                    Nueva Contraseña
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingresa la nueva contraseña"
                    disabled={saving}
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: `1px solid ${colors.border}`,
                      background: colors.bg,
                      color: colors.text,
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <small style={{ color: colors.textSecondary, display: 'block', marginTop: 8, fontSize: 12, lineHeight: 1.4 }}>
                    Mínimo 6 caracteres. Te recomendamos usar una fácil de recordar para el profesional.
                  </small>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 8,
                      border: `1px solid ${colors.border}`,
                      background: colors.bgSecondary,
                      color: colors.text,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      opacity: saving ? 0.6 : 1
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !newPassword || newPassword.length < 6}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#f59e0b',
                      color: 'white',
                      cursor: (saving || !newPassword || newPassword.length < 6) ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      opacity: (saving || !newPassword || newPassword.length < 6) ? 0.6 : 1
                    }}
                  >
                    {saving ? 'Guardando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
