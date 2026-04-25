import { SignatureCanvas } from '../../../components/SignatureCanvas';

export const SignatureModal = ({ show, colors, signatureAppointment, clientSignature, completing, onClose, onSignatureChange, onSubmit }) => {
  if (!show || !signatureAppointment) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        background: colors.cardBg, borderRadius: '16px', padding: '24px',
        maxWidth: '500px', width: '100%', maxHeight: '90vh',
        overflowY: 'auto',
        border: `1px solid ${colors.border}`
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: colors.text }}>
          ✍️ Firma del Cliente
        </h2>
        
        <div style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
          Cliente: <strong>{signatureAppointment.clientName || signatureAppointment.client}</strong> • {' '}
          Servicio: <strong>{signatureAppointment.service || signatureAppointment.Service?.name}</strong>
        </div>

        <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
          El cliente debe firmar para confirmar que el servicio fue realizado satisfactoriamente.
        </p>

        {/* Componente de Firma */}
        <SignatureCanvas
          signature={clientSignature}
          onSignatureChange={onSignatureChange}
          colors={colors}
          width={450}
          height={180}
        />

        {/* Botones */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button
            onClick={onClose}
            disabled={completing}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: 'none',
              fontWeight: 600,
              cursor: completing ? 'not-allowed' : 'pointer',
              opacity: completing ? 0.6 : 1
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={completing || !clientSignature}
            style={{
              flex: 2,
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              background: clientSignature ? '#22c55e' : '#9ca3af',
              color: 'white',
              fontWeight: 700,
              cursor: (completing || !clientSignature) ? 'not-allowed' : 'pointer',
              opacity: (completing || !clientSignature) ? 0.7 : 1
            }}
          >
            {completing ? 'Completando...' : 'Completar Servicio'}
          </button>
        </div>
      </div>
    </div>
  );
};
