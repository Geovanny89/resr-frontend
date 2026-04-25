/**
 * Modal para agregar cargo adicional
 * Extraído de Appointments.jsx
 */
import { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

export function AdditionalChargeModal({
  isOpen,
  onClose,
  appointment,
  onSave,
  isSaving,
  colors
}) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (appointment) {
      setAmount(appointment.additionalAmount || '');
      setNote(appointment.additionalNote || '');
    }
  }, [appointment]);

  const handleClose = () => {
    setAmount('');
    setNote('');
    onClose();
  };

  const handleSave = async () => {
    const result = await onSave(appointment, amount, note);
    if (result?.success) {
      onClose();
    }
  };

  const basePrice = appointment?.Service?.price || 0;
  const additionalAmount = parseFloat(amount) || 0;
  const total = basePrice + additionalAmount;

  if (!isOpen || !appointment) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: colors.cardBg, borderRadius: 12, padding: 24,
        maxWidth: 400, width: '90%', border: `1px solid ${colors.border}`
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: colors.text }}>
            <DollarSign size={20} style={{ display: 'inline', marginRight: 4 }} />
            {appointment.additionalAmount ? 'Editar' : 'Agregar'} Cargo Adicional
          </h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary }}>
            <X size={24} />
          </button>
        </div>

        {/* Info de cita */}
        <div style={{ marginBottom: 12, padding: 12, background: colors.bgSecondary, borderRadius: 8 }}>
          <p style={{ margin: 0, fontSize: 13, color: colors.textSecondary }}>
            Cita: <strong style={{ color: colors.text }}>{appointment.Service?.name}</strong>
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: colors.textSecondary }}>
            Cliente: <strong style={{ color: colors.text }}>{appointment.clientName}</strong>
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: colors.textSecondary }}>
            Precio base: <strong style={{ color: colors.text }}>{fmt(basePrice)}</strong>
          </p>
        </div>

        {/* Monto adicional */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>
            Monto Adicional ($)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ej: 10000"
            style={{
              width: '100%', padding: 10, border: `1px solid ${colors.border}`,
              borderRadius: 6, fontSize: 14, background: colors.inputBg, color: colors.text
            }}
          />
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>
            Descripción (opcional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: Figura complicada, diseño extra..."
            style={{
              width: '100%', padding: 10, border: `1px solid ${colors.border}`,
              borderRadius: 6, fontSize: 14, background: colors.inputBg, color: colors.text
            }}
          />
        </div>

        {/* Total */}
        {additionalAmount > 0 && (
          <div style={{
            marginBottom: 16, padding: 12, background: '#d1fae5',
            borderRadius: 8, border: '1px solid #10b981'
          }}>
            <p style={{ margin: 0, fontSize: 13, color: '#065f46', fontWeight: 600 }}>
              Total a pagar: {fmt(total)}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: 11, color: '#065f46' }}>
              Base: {fmt(basePrice)} + Adicional: {fmt(additionalAmount)}
            </p>
          </div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={handleClose}
            style={{
              background: colors.bgTertiary, color: colors.text,
              border: `1px solid ${colors.border}`, borderRadius: 6,
              padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              background: isSaving ? colors.bgTertiary : '#f59e0b',
              color: isSaving ? colors.text : 'white',
              border: 'none', borderRadius: 6, padding: '10px 20px',
              fontSize: 14, fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer'
            }}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdditionalChargeModal;
