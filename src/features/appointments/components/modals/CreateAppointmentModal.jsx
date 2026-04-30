/**
 * Modal para crear nueva cita
 * Extraído de Appointments.jsx
 */
import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import api from '../../../../api/client';

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
  colors
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
    notes: ''
  });
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
        const allowPast = !business?.hasFieldTechnicians;
        const res = await api.get(`/appointments/availability?date=${selectedDate}&employeeId=${form.employeeId}&serviceId=${form.serviceId}&businessId=${business.id}&allowPast=${allowPast}`, { params: { noCache: true } });
        
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
  }, [selectedDate, form.employeeId, form.serviceId, business]);

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
      notes: ''
    });
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

        {/* Servicio */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>Servicio *</label>
          <select
            value={form.serviceId}
            onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
            style={{ width: '100%', padding: 10, border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, background: colors.inputBg, color: colors.text }}
          >
            <option value="">Selecciona un servicio</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>{service.name} - {fmt(service.price)}</option>
            ))}
          </select>
        </div>

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
              gap: 8, maxHeight: 180, overflowY: 'auto',
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
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>Teléfono</label>
          <input
            type="tel"
            value={form.clientPhone}
            onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
            placeholder="+57 300 000 0000"
            style={{ width: '100%', padding: 10, border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, background: colors.inputBg, color: colors.text }}
          />
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
