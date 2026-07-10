import { useState } from 'react';

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
  totalDuration,
  totalPrice,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const services = business?.Services || [];

  // Calcular precio numérico para un servicio (con promo si aplica)
  const getServicePrice = (svc) => {
    if (!svc) return 0;
    if (svc.priceOptional) return 0;
    const promo = svc.Promotions && svc.Promotions.length > 0 ? svc.Promotions[0] : null;
    const basePrice = Number(svc.price) || 0;
    if (promo) {
      const discount = promo.discountType === 'percentage'
        ? basePrice * (Number(promo.discountValue) / 100)
        : Number(promo.discountValue);
      return Math.max(0, basePrice - discount);
    }
    return basePrice;
  };

  const handleSelectMainService = (svc) => {
    setSelected(s => {
      // Remover de extras si ya estaba seleccionado
      const filteredExtras = (s.extraServices || []).filter(item => item.serviceId !== svc.id);
      return {
        ...s,
        service: svc,
        extraServices: filteredExtras
      };
    });
  };

  const handleToggleExtraService = (svc) => {
    const isSelected = selected.extraServices.some(item => item.serviceId === svc.id);
    if (isSelected) {
      setSelected(s => ({
        ...s,
        extraServices: s.extraServices.filter(item => item.serviceId !== svc.id)
      }));
    } else {
      setSelected(s => ({
        ...s,
        extraServices: [
          ...s.extraServices,
          {
            serviceId: svc.id,
            name: svc.name,
            price: getServicePrice(svc),
            durationMin: svc.durationMin
          }
        ]
      }));
    }
  };

  // Helper de visualización de precios
  const getServicePriceDisplay = (svc) => {
    if (svc.priceOptional) {
      return (
        <>
          <div style={{ fontSize: 11, background: 'var(--bg-secondary, #f3f4f6)', color: 'var(--text, #4b5563)', padding: '4px 8px', borderRadius: 12, display: 'inline-block', fontWeight: 600, textAlign: 'right', lineHeight: 1.2 }}>Valor sujeto a<br />valoración profesional</div>
          {svc.price > 0 && (
            <div style={{ fontSize: 11, fontWeight: 500, color: colors.textSecondary, marginTop: 4 }}>
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

  // Filtrar servicios adicionales (que no sean el principal)
  const availableExtras = services.filter(svc => 
    svc.id !== selected.service?.id &&
    svc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(services.length / SERVICES_PER_PAGE);
  const startIndex = (servicesPage - 1) * SERVICES_PER_PAGE;
  const paginatedServices = services.slice(startIndex, startIndex + SERVICES_PER_PAGE);

  return (
    <div>
      {/* SI NO HAY SERVICIO PRINCIPAL SELECCIONADO */}
      {!selected.service ? (
        <>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 4 }}>¿Qué servicio necesitas?</h2>
          <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>Selecciona el servicio principal para tu reserva</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {paginatedServices.map(svc => (
              <div
                key={svc.id}
                className="book-svc"
                onClick={() => handleSelectMainService(svc)}
                style={{
                  background: colors.cardBg,
                  borderRadius: 14,
                  padding: '16px 20px',
                  border: `2px solid ${colors.border}`,
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
        </>
      ) : (
        /* CON SERVICIO PRINCIPAL SELECCIONADO: PERMITIR EXTRA SERVICES */
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 4 }}>Servicio Principal</h2>
          
          <div
            style={{
              background: colors.cardBg,
              borderRadius: 14,
              padding: '16px 20px',
              border: `2px solid ${primary}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: `0 2px 8px ${colors.shadow}`,
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: colors.text, marginBottom: 4 }}>{selected.service.name}</div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>⏱ {selected.service.durationMin} min</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                fontSize: selected.service.priceOptional ? 14 : 18,
                fontWeight: 800,
                color: selected.service.priceOptional ? '#92400e' : '#059669',
                textAlign: 'right'
              }}>
                {getServicePriceDisplay(selected.service)}
              </div>
              <button
                onClick={() => setSelected(s => ({ ...s, service: null, extraServices: [] }))}
                style={{
                  background: '#fee2e2',
                  color: '#ef4444',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Cambiar
              </button>
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 8 }}>
            ➕ ¿Deseas agregar más servicios a tu reserva?
          </h3>
          <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>Puedes elegir uno o más servicios adicionales</p>

          <input
            type="text"
            placeholder="Buscar otros servicios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: colors.inputBg,
              color: colors.text,
              fontSize: 14,
              marginBottom: 16,
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 80 }}>
            {availableExtras.length === 0 ? (
              <p style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', padding: '20px 0' }}>
                No hay otros servicios disponibles
              </p>
            ) : (
              availableExtras.map(svc => {
                const isSelected = selected.extraServices.some(item => item.serviceId === svc.id);
                return (
                  <div
                    key={svc.id}
                    style={{
                      background: colors.cardBg,
                      borderRadius: 14,
                      padding: '12px 18px',
                      border: `2px solid ${isSelected ? '#3b82f6' : colors.border}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: `0 1px 3px ${colors.shadow}`,
                      gap: 12,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: colors.text, marginBottom: 2 }}>{svc.name}</div>
                      <div style={{ fontSize: 12, color: colors.textSecondary }}>⏱ {svc.durationMin} min</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{
                        fontSize: svc.priceOptional ? 12 : 16,
                        fontWeight: 700,
                        color: svc.priceOptional ? '#92400e' : '#059669',
                        textAlign: 'right'
                      }}>
                        {getServicePriceDisplay(svc)}
                      </div>
                      <button
                        onClick={() => handleToggleExtraService(svc)}
                        style={{
                          background: isSelected ? '#ef4444' : primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 14px',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 700,
                          minWidth: 80,
                        }}
                      >
                        {isSelected ? 'Quitar' : 'Agregar'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Resumen de Totales y Continuar */}
          <div style={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            background: colors.cardBg,
            borderTop: `1px solid ${colors.border}`,
            padding: '16px 20px',
            margin: '0 -16px -48px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: `0 -4px 12px ${colors.shadow}`,
            zIndex: 100,
          }}>
            <div>
              <div style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 600 }}>DURACIÓN / PRECIO TOTAL</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: colors.text }}>
                ⏱ {totalDuration} min • <span style={{ color: '#059669' }}>${totalPrice.toLocaleString('es-CO')}</span>
              </div>
            </div>
            <button
              onClick={() => setStep(preselectedEmployeeId ? 2 : 1)}
              style={{
                background: primary,
                color: 'white',
                border: 'none',
                borderRadius: 10,
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 700,
                boxShadow: `0 4px 6px -1px rgba(0,0,0,0.1)`,
              }}
            >
              Continuar →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
