import { useState, useEffect } from 'react';
import api from '../../../../api/client';

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
 * @param {Object} props.business - Información del negocio
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
  business,
  colors
}) {
  const [clients, setClients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);

  // Cargar clientes al abrir el modal
  useEffect(() => {
    if (isOpen && business?.id) {
      const loadClients = async () => {
        try {
          const res = await api.get(`/appointments/clients?businessId=${business.id}`);
          setClients(res.data.clients || []);
        } catch (e) {
          console.error('Error cargando clientes:', e);
        }
      };
      loadClients();
    }
  }, [isOpen, business?.id]);

  if (!isOpen) return null;

  const handleClientNameChange = (val) => {
    onFormChange('clientName', val);
    if (val.length > 1) {
      const filtered = clients.filter(c => 
        c.name.toLowerCase().includes(val.toLowerCase()) || 
        (c.phone && c.phone.includes(val))
      ).slice(0, 5);
      setFilteredClients(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectClient = (client) => {
    onFormChange('clientName', client.name);
    onFormChange('clientPhone', client.phone || '');
    setShowSuggestions(false);
  };

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
        
        {/* BUSCADOR DE CLIENTE FRECUENTE */}
        <div style={{ marginBottom: 20, position: 'relative', padding: '10px', background: colors.bgSecondary, borderRadius: 8, border: `1px dashed ${colors.border}` }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 700, fontSize: 12, color: '#f59e0b' }}>🔍 ¿Cliente frecuente?</label>
          <input
            type="text"
            value={form.clientName}
            onChange={(e) => handleClientNameChange(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onFocus={() => form.clientName.length > 1 && setShowSuggestions(filteredClients.length > 0)}
            placeholder="Buscar por nombre o cel..."
            autoComplete="off"
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: `2px solid #f59e0b`, background: colors.inputBg, color: colors.text }}
          />
          
          {showSuggestions && (
            <div style={{
              position: 'absolute', top: '100%', left: 10, right: 10, 
              background: colors.cardBg, border: `1px solid ${colors.border}`,
              borderRadius: '0 0 8px 8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              zIndex: 100, maxHeight: 150, overflowY: 'auto'
            }}>
              {filteredClients.map((c, i) => (
                <div
                  key={i}
                  onClick={() => selectClient(c)}
                  style={{
                    padding: '10px', cursor: 'pointer', borderBottom: i < filteredClients.length - 1 ? `1px solid ${colors.border}` : 'none',
                    display: 'flex', flexDirection: 'column', gap: 2
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 13, color: colors.text }}>{c.name}</span>
                  {c.phone && <span style={{ fontSize: 11, color: colors.textSecondary }}>📱 {c.phone}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

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
