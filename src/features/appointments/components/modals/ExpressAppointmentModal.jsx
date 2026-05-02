import { useState, useEffect } from 'react';
import api from '../../../../api/client';
import { PhoneInput } from '../PhoneInput';

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
  const [serviceSearch, setServiceSearch] = useState('');
  const [extraSearch, setExtraSearch] = useState('');
  const [showServiceList, setShowServiceList] = useState(false);
  const [showExtraList, setShowExtraList] = useState(false);

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
          <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Teléfono del Cliente 📱</label>
          <PhoneInput
            value={form.clientPhone}
            onChange={(val) => onFormChange('clientPhone', val)}
            colors={colors}
            placeholder="Número sin prefijo"
          />
          <p style={{ margin: '4px 0 0 0', fontSize: 11, color: colors.textSecondary }}>
            Incluye el prefijo de país para garantizar el envío del recordatorio por WhatsApp.
          </p>
        </div>

        {/* Servicio Principal con Buscador */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: colors.text }}>Servicio Principal</label>
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setShowServiceList(!showServiceList)}
              style={{ 
                width: '100%', padding: '10px 12px', border: `1px solid ${colors.border}`, 
                borderRadius: 8, fontSize: 14, background: colors.inputBg, color: colors.text,
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <span style={{ opacity: !form.serviceId && !serviceSearch ? 0.6 : 1 }}>
                {serviceSearch || (form.serviceId ? services.find(s => s.id === form.serviceId)?.name : 'Selecciona un servicio...')}
              </span>
              <span style={{ fontSize: 12, opacity: 0.5 }}>▼</span>
            </div>

            {showServiceList && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, 
                background: colors.cardBg, border: `1px solid ${colors.border}`,
                borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                zIndex: 110, marginTop: 4, overflow: 'hidden'
              }}>
                <div style={{ padding: '8px', borderBottom: `1px solid ${colors.border}`, background: colors.bgSecondary }}>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Buscar servicio..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    style={{ 
                      width: '100%', padding: '6px 10px', border: `1px solid ${colors.border}`, 
                      borderRadius: 4, fontSize: 13, background: colors.cardBg, color: colors.text 
                    }}
                  />
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {services
                    .filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()))
                    .map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onFormChange('serviceId', s.id);
                          setServiceSearch('');
                          setShowServiceList(false);
                        }}
                        style={{ 
                          padding: '10px 12px', cursor: 'pointer', borderBottom: `1px solid ${colors.border}`,
                          background: form.serviceId === s.id ? colors.bgSecondary : 'transparent'
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: colors.textSecondary }}>{s.durationMin} min</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            
            {/* Click outside to close */}
            {showServiceList && (
              <div 
                onClick={() => setShowServiceList(false)}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 109 }} 
              />
            )}
          </div>
        </div>

        {/* Servicios Adicionales */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: colors.text }}>
            ➕ ¿Agregar más servicios?
          </label>
          
          {/* Lista de extras seleccionados */}
          {form.extraServices?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {form.extraServices.map(s => (
                <div key={s.serviceId} style={{ 
                  background: '#dbeafe', color: '#1e40af', padding: '4px 10px', 
                  borderRadius: 16, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
                  border: '1px solid #bfdbfe'
                }}>
                  <span>{s.name}</span>
                  <span 
                    style={{ cursor: 'pointer', fontWeight: 700 }} 
                    onClick={() => onFormChange('extraServices', form.extraServices.filter(x => x.serviceId !== s.serviceId))}
                  >
                    ✕
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Buscador de extras simple para express */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Añadir otro servicio..."
              value={extraSearch}
              onFocus={() => setShowExtraList(true)}
              onChange={(e) => setExtraSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: `1px dashed ${colors.border}`, borderRadius: 8, fontSize: 13, background: colors.inputBg, color: colors.text }}
            />
            {showExtraList && extraSearch && (
              <div style={{
                position: 'absolute', bottom: '100%', left: 0, right: 0, 
                background: colors.cardBg, border: `1px solid ${colors.border}`,
                borderRadius: 8, boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.1)',
                zIndex: 110, maxHeight: 150, overflowY: 'auto'
              }}>
                {services
                  .filter(s => s.name.toLowerCase().includes(extraSearch.toLowerCase()))
                  .filter(s => s.id !== form.serviceId && !form.extraServices?.find(x => x.serviceId === s.id))
                  .map(s => (
                    <div
                      key={s.id}
                      onClick={() => {
                        const newExtras = [...(form.extraServices || []), { serviceId: s.id, name: s.name, price: s.price, durationMin: s.durationMin }];
                        onFormChange('extraServices', newExtras);
                        setExtraSearch('');
                        setShowExtraList(false);
                      }}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: `1px solid ${colors.border}` }}
                    >
                      <span style={{ fontSize: 13, color: colors.text }}>{s.name}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
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
