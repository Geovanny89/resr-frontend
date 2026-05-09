import { formatDateES, formatSlotTime } from '../utils/dateHelpers';

function getServicePriceDisplay(service, isDepositRequired, depositAmount) {
  if (service?.priceOptional) {
    return (
      <>
        Valor sujeto a valoración profesional
        {isDepositRequired && (
          <div style={{
            marginTop: 8,
            padding: '8px 12px',
            background: '#fef3c7',
            borderRadius: 8,
            border: '1px solid #f59e0b',
            fontSize: 12,
            color: '#92400e'
          }}>
            💰 <strong>Requiere anticipo:</strong> ${depositAmount.toLocaleString('es-CO')}
          </div>
        )}
      </>
    );
  }

  const promo = service?.Promotions && service.Promotions.length > 0 ? service.Promotions[0] : null;
  const basePrice = Number(service?.price || 0);

  if (promo) {
    const discount = promo.discountType === 'percentage'
      ? basePrice * (Number(promo.discountValue) / 100)
      : Number(promo.discountValue);
    const finalPrice = Math.max(0, basePrice - discount);

    return (
      <>
        <div style={{ fontSize: 12, color: '#ef4444', textDecoration: 'line-through' }}>
          ${basePrice.toLocaleString('es-CO')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, background: '#fee2e2', color: '#b91c1c', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
            -{promo.discountType === 'percentage' ? `${promo.discountValue}%` : 'PROMO'}
          </span>
          💰 ${finalPrice.toLocaleString('es-CO')}
        </div>
        {isDepositRequired && (
          <div style={{
            marginTop: 8,
            padding: '8px 12px',
            background: '#fef3c7',
            borderRadius: 8,
            border: '1px solid #f59e0b',
            fontSize: 12,
            color: '#92400e'
          }}>
            💰 <strong>Requiere anticipo:</strong> ${depositAmount.toLocaleString('es-CO')}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      💰 ${basePrice.toLocaleString('es-CO')}
      {isDepositRequired && (
        <div style={{
          marginTop: 8,
          padding: '8px 12px',
          background: '#fef3c7',
          borderRadius: 8,
          border: '1px solid #f59e0b',
          fontSize: 12,
          color: '#92400e'
        }}>
          💰 <strong>Requiere anticipo:</strong> ${depositAmount.toLocaleString('es-CO')}
        </div>
      )}
    </>
  );
}

export default function ClientDataStep({
  business,
  selected,
  setSelected,
  setStep,
  isDepositRequired,
  depositAmount,
  submitting,
  handleSubmit,
  colors,
  gradient,
}) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 4 }}>Tus datos</h2>
      <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>
        Completa tu información para confirmar la cita
      </p>

      {/* Resumen */}
      <div style={{
        background: colors.cardBg, borderRadius: 14, padding: '16px 20px',
        marginBottom: 20, boxShadow: `0 2px 8px ${colors.shadow}`,
        borderLeft: `4px solid ${colors.primary}`,
        border: `1px solid ${colors.border}`,
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: colors.text, marginBottom: 8 }}>Resumen de tu cita</div>
        <div style={{ fontSize: 13, color: colors.text, lineHeight: 1.8 }}>
          <div>📋 <strong>{selected.service?.name}</strong></div>
          <div>👤 {selected.slot?.employeeName}</div>
          <div>📅 {formatDateES(selected.date)}</div>
          <div>🕐 {formatSlotTime(selected.slot?.startTime)} (hora Colombia)</div>
          <div style={{ fontWeight: 700, color: selected.service?.priceOptional ? '#92400e' : '#059669', marginTop: 4 }}>
            {getServicePriceDisplay(selected.service, isDepositRequired, depositAmount)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: colors.text }}>
            Nombre completo *
          </label>
          <input
            type="text"
            placeholder="Tu nombre completo"
            value={selected.clientName}
            onChange={e => setSelected(s => ({ ...s, clientName: e.target.value }))}
            required
            style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${colors.border}`, borderRadius: 10, fontSize: 14, outline: 'none', background: colors.cardBg, color: colors.text }}
          />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: colors.text }}>
            Teléfono *
          </label>
          <input
            type="tel"
            placeholder="Tu número de teléfono"
            value={selected.clientPhone}
            onChange={e => setSelected(s => ({ ...s, clientPhone: e.target.value }))}
            required
            style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${colors.border}`, borderRadius: 10, fontSize: 14, outline: 'none', background: colors.cardBg, color: colors.text }}
          />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: colors.text }}>
            Email (opcional)
          </label>
          <input
            type="email"
            placeholder="tu@email.com"
            value={selected.clientEmail}
            onChange={e => setSelected(s => ({ ...s, clientEmail: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${colors.border}`, borderRadius: 10, fontSize: 14, outline: 'none', background: colors.cardBg, color: colors.text }}
          />
        </div>

        {/* Campo de dirección solo para negocios con técnicos a domicilio */}
        {business?.hasFieldTechnicians && (
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: colors.text }}>
              📍 Dirección de servicio *
            </label>
            <input
              type="text"
              placeholder="Calle 123 # 45-67, Barrio, Ciudad"
              value={selected.address}
              onChange={e => setSelected(s => ({ ...s, address: e.target.value }))}
              required
              style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${colors.border}`, borderRadius: 10, fontSize: 14, outline: 'none', background: colors.cardBg, color: colors.text }}
            />
            <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
              Dirección completa donde el técnico prestará el servicio
            </div>
          </div>
        )}

        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: colors.text }}>
            Notas (opcional)
          </label>
          <textarea
            placeholder="Alguna indicación especial..."
            value={selected.notes}
            onChange={e => setSelected(s => ({ ...s, notes: e.target.value }))}
            rows={3}
            style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${colors.border}`, borderRadius: 10, fontSize: 14, outline: 'none', resize: 'vertical', background: colors.cardBg, color: colors.text }}
          />
        </div>
      </div>

      <div className="book-action-row" style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setStep(3)}
          style={{ background: colors.bgSecondary, color: colors.text, border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >
          ← Atrás
        </button>
        <button
          onClick={isDepositRequired ? () => setStep(5) : handleSubmit}
          disabled={submitting || !selected.clientName || !selected.clientPhone}
          style={{
            background: (!selected.clientName || !selected.clientPhone) ? colors.bgSecondary : gradient,
            color: (!selected.clientName || !selected.clientPhone) ? colors.textSecondary : 'white',
            border: 'none', borderRadius: 8, padding: '11px 24px',
            cursor: (!selected.clientName || !selected.clientPhone || submitting) ? 'not-allowed' : 'pointer',
            fontSize: 14, fontWeight: 700, flex: 1, maxWidth: 300,
          }}
        >
          {submitting ? '⏳ Reservando...' : isDepositRequired ? '💰 Continuar al anticipo →' : '✅ Confirmar cita'}
        </button>
      </div>
    </div>
  );
}
