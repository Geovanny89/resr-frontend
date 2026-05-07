/**
 * Modal para crear nueva cita
 * Extraído de Appointments.jsx
 */
import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import api from '../../../../api/client';
import { PhoneInput } from '../PhoneInput';

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

export function CreateAppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  services,
  employees,
  business,
  isCreating,
  colors,
  initialData = null
}) {
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    address: '',
    additionalEmployeeIds: [],
    serviceId: '',
    employeeId: '',
    startTime: '',
    notes: '',
    extraServices: []
  });

  // Cargar datos iniciales si existen (para reagendar)
  useEffect(() => {
    if (isOpen && initialData) {
      setForm(prev => ({
        ...prev,
        clientName: initialData.clientName || '',
        clientPhone: initialData.clientPhone || '',
        clientEmail: initialData.clientEmail || '',
        address: initialData.address || '',
        serviceId: initialData.serviceId || '',
        employeeId: initialData.employeeId || '',
        extraServices: initialData.extraServices || []
      }));

      if (initialData.suggestedDate) {
        setSelectedDate(initialData.suggestedDate);
      }
    }
  }, [isOpen, initialData]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceList, setShowServiceList] = useState(false);
  const [extraServiceSearch, setExtraServiceSearch] = useState('');
  const [showExtraServiceList, setShowExtraServiceList] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [clients, setClients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);

  // Cargar clientes al abrir el modal
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  // Filtrar clientes según lo que se escribe
  const handleClientNameChange = (val) => {
    setForm({ ...form, clientName: val });
    if (val.length > 1) {
      const filtered = clients.filter(c =>
        c.name.toLowerCase().includes(val.toLowerCase()) ||
        (c.phone && c.phone.includes(val))
      ).slice(0, 5); // Mostrar máximo 5
      setFilteredClients(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectClient = (client) => {
    setForm({
      ...form,
      clientName: client.name,
      clientPhone: client.phone || '',
      clientEmail: client.email || '',
      address: client.address || form.address // Si existiera dirección guardada
    });
    setShowSuggestions(false);
  };


  // Cargar slots disponibles
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDate || !form.employeeId || !form.serviceId) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const allowPast = true; // El administrador siempre puede crear citas en el pasado
        const res = await api.get(`/appointments/availability`, {
          params: {
            date: selectedDate,
            employeeId: form.employeeId,
            serviceId: form.serviceId,
            businessId: business.id,
            allowPast: allowPast,
            noCache: true
          }
        });

        let slots = res.data.availableSlots || [];
        const seenTimes = new Set();
        slots = slots.filter(slot => {
          if (seenTimes.has(slot.time)) return false;
          seenTimes.add(slot.time);
          return true;
        });

        setAvailableSlots(slots);
      } catch (e) {
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedDate, form.employeeId, form.serviceId, form.extraServices, business]);

  // Calcular totales
  const selectedService = services.find(s => s.id === form.serviceId);
  const mainDuration = parseInt(selectedService?.durationMin || 0);
  const extrasDuration = form.extraServices.reduce((sum, s) => sum + (parseInt(s.durationMin) || 0), 0);
  const totalDuration = mainDuration + extrasDuration;

  const mainPrice = parseFloat(selectedService?.price || 0);
  const extrasPrice = form.extraServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
  const totalPrice = mainPrice + extrasPrice;

  const resetForm = () => {
    setForm({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      address: '',
      additionalEmployeeIds: [],
      serviceId: '',
      employeeId: '',
      startTime: '',
      notes: '',
      extraServices: []
    });
    setServiceSearch('');
    setExtraServiceSearch('');
    setSelectedDate('');
    setAvailableSlots([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(form, '', selectedDate);
    resetForm();
  };

  const handleAddEmployee = (empId) => {
    const newIds = form.additionalEmployeeIds.includes(empId)
      ? form.additionalEmployeeIds.filter(id => id !== empId)
      : [...form.additionalEmployeeIds, empId];
    setForm({ ...form, additionalEmployeeIds: newIds });
  };

  const handleAddExtraService = (service) => {
    if (form.extraServices.find(s => s.serviceId === service.id)) return;
    const newExtras = [...form.extraServices, {
      serviceId: service.id,
      name: service.name,
      price: service.price,
      durationMin: service.durationMin
    }];
    setForm({ ...form, extraServices: newExtras });
    setExtraServiceSearch('');
    setShowExtraServiceList(false);
  };

  const handleRemoveExtraService = (svcId) => {
    setForm({ ...form, extraServices: form.extraServices.filter(s => s.serviceId !== svcId) });
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const filteredExtraServices = services.filter(s =>
    s.id !== form.serviceId &&
    !form.extraServices.find(es => es.serviceId === s.id) &&
    s.name.toLowerCase().includes(extraServiceSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: colors.cardBg, borderRadius: 12, padding: 24,
        maxWidth: 500, width: '90%', maxHeight: '80vh', overflowY: 'auto',
        border: `1px solid ${colors.border}`
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>Crear Nueva Cita</h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: colors.textSecondary }}>
            <X size={24} />
          </button>
        </div>

        {/* BUSCADOR DE CLIENTE FRECUENTE (ARRIBA PARA MAYOR VISIBILIDAD) */}
        <div style={{ marginBottom: 24, position: 'relative', padding: '12px', background: colors.bgSecondary, borderRadius: 8, border: `1px dashed ${colors.border}` }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13, color: '#10b981' }}>🔍 ¿Cliente frecuente? Busca aquí:</label>
          <input
            type="text"
            value={form.clientName}
            onChange={(e) => handleClientNameChange(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onFocus={() => form.clientName.length > 1 && setShowSuggestions(filteredClients.length > 0)}
            placeholder="Escribe nombre o teléfono..."
            autoComplete="off"
            style={{ width: '100%', padding: '12px', border: `2px solid #10b981`, borderRadius: 8, fontSize: 15, background: colors.inputBg, color: colors.text }}
          />

          {showSuggestions && (
            <div style={{
              position: 'absolute', top: '100%', left: 12, right: 12,
              background: colors.cardBg, border: `1px solid ${colors.border}`,
              borderRadius: '0 0 8px 8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              zIndex: 100, maxHeight: 200, overflowY: 'auto'
            }}>
              {filteredClients.map((c, i) => (
                <div
                  key={i}
                  onClick={() => selectClient(c)}
                  style={{
                    padding: '12px', cursor: 'pointer', borderBottom: i < filteredClients.length - 1 ? `1px solid ${colors.border}` : 'none',
                    display: 'flex', flexDirection: 'column', gap: 2
                  }}
                  onMouseEnter={(e) => e.target.style.background = colors.bgSecondary}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>{c.name}</span>
                  {c.phone && <span style={{ fontSize: 12, color: colors.textSecondary }}>📱 {c.phone}</span>}
                </div>
              ))}
            </div>
          )}
          <p style={{ margin: '8px 0 0 0', fontSize: 11, color: colors.textSecondary }}>Al seleccionar un cliente se auto-completará el formulario.</p>
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
                  {filteredServices.length === 0 ? (
                    <div style={{ padding: '12px', textAlign: 'center', fontSize: 13, color: colors.textSecondary }}>
                      No se encontraron servicios
                    </div>
                  ) : (
                    filteredServices.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setForm({ ...form, serviceId: s.id });
                          setServiceSearch('');
                          setShowServiceList(false);
                        }}
                        style={{
                          padding: '10px 12px', cursor: 'pointer', borderBottom: `1px solid ${colors.border}`,
                          background: form.serviceId === s.id ? colors.bgSecondary : 'transparent'
                        }}
                        onMouseEnter={(e) => e.target.style.background = colors.bgSecondary}
                        onMouseLeave={(e) => e.target.style.background = form.serviceId === s.id ? colors.bgSecondary : 'transparent'}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: colors.textSecondary }}>{fmt(s.price)} • {s.durationMin} min</div>
                      </div>
                    ))
                  )}
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
          {form.extraServices.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {form.extraServices.map(s => (
                <div key={s.serviceId} style={{
                  background: '#dbeafe', color: '#1e40af', padding: '4px 10px',
                  borderRadius: 16, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
                  border: '1px solid #bfdbfe'
                }}>
                  <span>{s.name} ({fmt(s.price)})</span>
                  <X size={14} style={{ cursor: 'pointer' }} onClick={() => handleRemoveExtraService(s.serviceId)} />
                </div>
              ))}
            </div>
          )}

          {/* Buscador de extras */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Escribe para agregar otro servicio..."
              value={extraServiceSearch}
              onFocus={() => setShowExtraServiceList(true)}
              onChange={(e) => setExtraServiceSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: `1px dashed ${colors.border}`, borderRadius: 6, fontSize: 13, background: colors.inputBg, color: colors.text }}
            />
            {showExtraServiceList && extraServiceSearch && (
              <div style={{
                position: 'absolute', bottom: '100%', left: 0, right: 0,
                background: colors.cardBg, border: `1px solid ${colors.border}`,
                borderRadius: 6, boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.1)',
                zIndex: 101, maxHeight: 150, overflowY: 'auto'
              }}>
                {filteredExtraServices.map(s => (
                  <div
                    key={s.id}
                    onClick={() => handleAddExtraService(s)}
                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: `1px solid ${colors.border}` }}
                    onMouseEnter={(e) => e.target.style.background = colors.bgSecondary}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 13, color: colors.text }}>{s.name} - {fmt(s.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resumen de Totales */}
        {(form.serviceId || form.extraServices.length > 0) && (
          <div style={{
            marginBottom: 20, padding: 12, background: '#f0fdf4', borderRadius: 8,
            border: '1px solid #dcfce7', display: 'flex', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>DURACIÓN TOTAL</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#15803d' }}>{totalDuration} min</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>PRECIO TOTAL</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#15803d' }}>{fmt(totalPrice)}</div>
            </div>
          </div>
        )}

        {/* Empleado */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>Profesional *</label>
          <select
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value, additionalEmployeeIds: [] })}
            style={{ width: '100%', padding: 10, border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, background: colors.inputBg, color: colors.text }}
          >
            <option value="">Selecciona un profesional</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.User?.name || emp.name}</option>
            ))}
          </select>
        </div>

        {/* Empleados adicionales */}
        {form.employeeId && employees.filter(e => e.id !== form.employeeId).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: colors.text }}>
              🤝 Profesionales adicionales (Cita Grupal)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {employees.filter(emp => emp.id !== form.employeeId).map(emp => {
                const isSelected = form.additionalEmployeeIds.includes(emp.id);
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleAddEmployee(emp.id)}
                    style={{
                      padding: '8px 12px',
                      border: `2px solid ${isSelected ? '#10b981' : colors.border}`,
                      borderRadius: 20,
                      background: isSelected ? '#d1fae5' : colors.inputBg,
                      color: isSelected ? '#065f46' : colors.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500
                    }}
                  >
                    {isSelected ? '✓' : '+'} {emp.User?.name || emp.name}
                  </button>
                );
              })}
            </div>
            {form.additionalEmployeeIds.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#059669' }}>
                ✓ {form.additionalEmployeeIds.length} profesional(es) adicional(es)
              </div>
            )}
          </div>
        )}

        {/* Fecha */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14, color: colors.text }}>
            📅 Fecha de la cita *
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setForm({ ...form, startTime: '' });
              setAvailableSlots([]);
            }}
            style={{
              width: '100%', padding: '15px 12px', border: `2px solid ${colors.border}`,
              borderRadius: 10, fontSize: 16, background: colors.inputBg, color: colors.text
            }}
          />
        </div>

        {/* Horarios */}
        {selectedDate && form.employeeId && form.serviceId && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14, color: colors.text }}>
              ⏰ Horarios disponibles
            </label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: 8, maxHeight: 400, overflowY: 'auto',
              border: `2px solid ${colors.border}`, borderRadius: 10, padding: 16,
              background: colors.bgSecondary
            }}>
              {loadingSlots ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 20 }}>Cargando...</div>
              ) : availableSlots.length > 0 ? (
                availableSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setForm({ ...form, startTime: slot.startTime })}
                    style={{
                      padding: '14px 10px', border: `2px solid ${form.startTime === slot.startTime ? '#10b981' : colors.border}`,
                      borderRadius: 8, background: form.startTime === slot.startTime ? '#10b981' : colors.inputBg,
                      color: form.startTime === slot.startTime ? '#ffffff' : colors.text,
                      cursor: 'pointer', fontSize: 14, fontWeight: 600
                    }}
                  >
                    🕐 {slot.time}
                  </button>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 20, color: colors.textSecondary }}>
                  No hay horarios disponibles
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nombre del Cliente */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>Nombre del Cliente *</label>
          <input
            type="text"
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            placeholder="Nombre completo"
            style={{ width: '100%', padding: 10, border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, background: colors.inputBg, color: colors.text }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>Email</label>
          <input
            type="email"
            value={form.clientEmail}
            onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
            placeholder="email@ejemplo.com"
            style={{ width: '100%', padding: 10, border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, background: colors.inputBg, color: colors.text }}
          />
        </div>

        {/* Teléfono */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>Teléfono 📱</label>
          <PhoneInput
            value={form.clientPhone}
            onChange={(val) => setForm({ ...form, clientPhone: val })}
            colors={colors}
            placeholder="Número sin prefijo"
          />
          <p style={{ margin: '4px 0 0 0', fontSize: 11, color: colors.textSecondary }}>
            El prefijo de país garantiza el envío correcto de recordatorios por WhatsApp.
          </p>
        </div>

        {/* Dirección (solo para técnicos) */}
        {business?.hasFieldTechnicians && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>📍 Dirección *</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Calle 123 # 45-67, Barrio, Ciudad"
              style={{ width: '100%', padding: 10, border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, background: colors.inputBg, color: colors.text }}
            />
          </div>
        )}

        {/* Notas */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notas adicionales..."
            rows={3}
            style={{ width: '100%', padding: 10, border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, background: colors.inputBg, color: colors.text, resize: 'vertical' }}
          />
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={handleClose}
            style={{ background: colors.bgTertiary, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: 6, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            style={{
              background: isCreating ? colors.bgTertiary : '#10b981', color: isCreating ? colors.text : 'white',
              border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 14, fontWeight: 600,
              cursor: isCreating ? 'not-allowed' : 'pointer'
            }}
          >
            {isCreating ? 'Creando...' : 'Crear Cita'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateAppointmentModal;
