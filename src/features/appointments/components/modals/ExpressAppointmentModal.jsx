/**
 * Modal para crear Cita Express (sin cita previa)
 * Extraído de Appointments.jsx
 */

/**
 * Modal de cita express
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Object} props.form - Datos del formulario {clientName, clientPhone, serviceId, employeeId}
 * @param {Function} props.onFormChange - Callback al cambiar campo (field, value)
 * @param {Function} props.onSubmit - Callback al crear
 * @param {Function} props.onCancel - Callback al cancelar
 * @param {boolean} props.isCreating - Estado de carga
 * @param {Array} props.services - Lista de servicios
 * @param {Array} props.employees - Lista de empleados
 * @param {Object} props.colors - Colores del tema
 */
export function ExpressAppointmentModal({
  isOpen,
  form,
  onFormChange,
  onSubmit,
  onCancel,
  isCreating,
  services,
  employees,
  colors
}) {
  if (!isOpen) return null;

  const handleChange = (field) => (e) => {
    onFormChange(field, e.target.value);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: colors.cardBg, borderRadius: '12px', padding: '24px',
        maxWidth: '400px', width: '90%', border: `1px solid ${colors.border}`
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Cita Express (Sin cita previa)</h2>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Nombre del Cliente</label>
          <input
            type="text"
            value={form.clientName}
            onChange={handleChange('clientName')}
            placeholder="Nombre completo"
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Teléfono del Cliente</label>
          <input
            type="tel"
            value={form.clientPhone}
            onChange={handleChange('clientPhone')}
            placeholder="Ej: 3001234567"
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Servicio</label>
          <select
            value={form.serviceId}
            onChange={handleChange('serviceId')}
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
          >
            <option value="">Selecciona servicio</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.durationMin} min)</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Profesional Disponible</label>
          <select
            value={form.employeeId}
            onChange={handleChange('employeeId')}
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
          >
            <option value="">Selecciona profesional</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.User?.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={onCancel} 
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: 'none', color: colors.text }}
          >
            Cancelar
          </button>
          <button 
            onClick={onSubmit} 
            disabled={isCreating}
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#f59e0b', color: 'white', fontWeight: 700 }}
          >
            {isCreating ? 'Iniciando...' : 'Iniciar Ya'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExpressAppointmentModal;
