export const ExpressModal = ({ show, colors, expressForm, setExpressForm, services, business, completing, onClose, onSubmit }) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
      zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div style={{
        background: colors.cardBg, padding: 24, borderRadius: 16, 
        maxWidth: 400, width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        border: `1px solid ${colors.border}`
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 8 }}>⚡ Cita Express</h2>
        <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
          Registra un cliente que acaba de llegar para atenderlo de inmediato.
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>Nombre del Cliente</label>
          <input 
            type="text"
            value={expressForm.clientName}
            onChange={e => setExpressForm({ ...expressForm, clientName: e.target.value })}
            placeholder="Nombre completo"
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>Teléfono del Cliente</label>
          <input 
            type="tel"
            value={expressForm.clientPhone}
            onChange={e => setExpressForm({ ...expressForm, clientPhone: e.target.value })}
            placeholder="Ej: 3001234567"
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
          />
        </div>

        {business?.hasFieldTechnicians && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>
              📍 Dirección *
            </label>
            <input 
              type="text"
              value={expressForm.address}
              onChange={e => setExpressForm({ ...expressForm, address: e.target.value })}
              placeholder="Calle 123 # 45-67, Barrio, Ciudad"
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
            />
            <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
              Dirección donde se prestará el servicio
            </div>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>Servicio</label>
          <select 
            value={expressForm.serviceId}
            onChange={e => setExpressForm({ ...expressForm, serviceId: e.target.value })}
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
          >
            <option value="">Selecciona un servicio</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.durationMin} min)</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={onClose}
            style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: colors.bgSecondary, color: colors.text, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button 
            onClick={onSubmit}
            disabled={completing}
            style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: '#f59e0b', color: 'white', fontWeight: 700, cursor: 'pointer' }}
          >
            {completing ? 'Cargando...' : 'Atender Ya'}
          </button>
        </div>
      </div>
    </div>
  );
};
