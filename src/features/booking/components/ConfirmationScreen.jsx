import { formatDateES, formatSlotTime } from '../utils/dateHelpers';

export default function ConfirmationScreen({ selected, colors, gradient, onBack }) {
  return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: 20,
        padding: '40px 32px',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        boxShadow: `0 8px 32px ${colors.shadow}`,
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: colors.text, marginBottom: 8 }}>¡Cita reservada!</h2>
        <p style={{ color: colors.textSecondary, marginBottom: 24 }}>Tu cita ha sido registrada exitosamente.</p>
        <div style={{
          background: colors.bgSecondary,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 24,
          textAlign: 'left',
          fontSize: 14,
          lineHeight: 1.8,
          color: colors.text,
        }}>
          <div><strong>Servicio:</strong> {selected.service?.name}</div>
          <div><strong>Empleado:</strong> {selected.slot?.employeeName}</div>
          <div><strong>Fecha:</strong> {formatDateES(selected.date)}</div>
          <div><strong>Hora:</strong> {formatSlotTime(selected.slot?.startTime)} (hora Colombia)</div>
          <div><strong>Nombre:</strong> {selected.clientName}</div>
        </div>
        <button
          onClick={onBack}
          style={{
            background: gradient,
            color: 'white',
            border: 'none',
            borderRadius: 10,
            padding: '12px 32px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Volver a mis citas
        </button>
      </div>
    </div>
  );
}
