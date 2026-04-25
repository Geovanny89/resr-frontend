const SERVICES_PER_PAGE = 5;

export default function ServiceStep({
  business,
  selected,
  setSelected,
  setStep,
  servicesPage,
  setServicesPage,
  colors,
  primary,
  preselectedEmployeeId,
}) {
  const services = business?.Services || [];
  const totalPages = Math.ceil(services.length / SERVICES_PER_PAGE);
  const startIndex = (servicesPage - 1) * SERVICES_PER_PAGE;
  const paginatedServices = services.slice(startIndex, startIndex + SERVICES_PER_PAGE);

  const handleSelectService = (svc) => {
    setSelected(s => ({ ...s, service: svc }));
    setStep(preselectedEmployeeId ? 2 : 1);
  };

  const getServicePriceDisplay = (svc) => {
    if (svc.priceOptional) {
      return (
        <>
          <div>A cotizar</div>
          {svc.price > 0 && (
            <div style={{ fontSize: 11, fontWeight: 500, color: colors.textSecondary }}>
              Ref: ${Number(svc.price).toLocaleString('es-CO')}
            </div>
          )}
        </>
      );
    }

    const promo = svc.Promotions && svc.Promotions.length > 0 ? svc.Promotions[0] : null;
    const basePrice = Number(svc.price);

    if (promo) {
      const discount = promo.discountType === 'percentage'
        ? basePrice * (Number(promo.discountValue) / 100)
        : Number(promo.discountValue);
      const finalPrice = Math.max(0, basePrice - discount);

      return (
        <>
          <div style={{ fontSize: 12, color: '#ef4444', textDecoration: 'line-through', marginBottom: -4 }}>
            ${basePrice.toLocaleString('es-CO')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, background: '#fee2e2', color: '#b91c1c', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
              -{promo.discountType === 'percentage' ? `${promo.discountValue}%` : 'PROMO'}
            </span>
            ${finalPrice.toLocaleString('es-CO')}
          </div>
        </>
      );
    }

    return `$${basePrice.toLocaleString('es-CO')}`;
  };

  if (services.length === 0) {
    return (
      <div style={{ background: colors.cardBg, borderRadius: 14, padding: 40, textAlign: 'center', color: colors.textSecondary, boxShadow: `0 2px 8px ${colors.shadow}`, border: `1px solid ${colors.border}` }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <p style={{ fontWeight: 600, color: colors.text }}>Sin servicios disponibles</p>
        <p style={{ fontSize: 13, marginTop: 4 }}>Este negocio aún no tiene servicios configurados.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 4 }}>¿Qué servicio necesitas?</h2>
      <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>Selecciona el servicio que deseas reservar</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {paginatedServices.map(svc => (
          <div
            key={svc.id}
            className="book-svc"
            onClick={() => handleSelectService(svc)}
            style={{
              background: colors.cardBg,
              borderRadius: 14,
              padding: '16px 20px',
              border: `2px solid ${selected.service?.id === svc.id ? primary : colors.border}`,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: `0 1px 4px ${colors.shadow}`,
              transition: 'all 0.15s',
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: colors.text, marginBottom: 4 }}>{svc.name}</div>
              {svc.description && (
                <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>{svc.description}</div>
              )}
              <div style={{ fontSize: 12, color: colors.textSecondary }}>⏱ {svc.durationMin} min</div>
              {svc.isTechnicalService && (
                <div style={{ fontSize: 11, color: '#0369a1', marginTop: 4, fontWeight: 600 }}>
                  🔧 Servicio técnico
                </div>
              )}
            </div>
            <div style={{
              fontSize: svc.priceOptional ? 14 : 20,
              fontWeight: 800,
              color: svc.priceOptional ? '#92400e' : '#059669',
              flexShrink: 0,
              textAlign: 'right'
            }}>
              {getServicePriceDisplay(svc)}
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {services.length > SERVICES_PER_PAGE && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20, padding: '12px' }}>
          <button
            onClick={() => setServicesPage(p => Math.max(1, p - 1))}
            disabled={servicesPage === 1}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: 'none',
              background: servicesPage === 1 ? colors.bgSecondary : primary,
              color: servicesPage === 1 ? colors.textSecondary : 'white',
              cursor: servicesPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ‹ Anterior
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
            {servicesPage} / {totalPages}
          </span>
          <button
            onClick={() => setServicesPage(p => Math.min(totalPages, p + 1))}
            disabled={servicesPage === totalPages}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: 'none',
              background: servicesPage === totalPages ? colors.bgSecondary : primary,
              color: servicesPage === totalPages ? colors.textSecondary : 'white',
              cursor: servicesPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Siguiente ›
          </button>
        </div>
      )}
    </div>
  );
}
