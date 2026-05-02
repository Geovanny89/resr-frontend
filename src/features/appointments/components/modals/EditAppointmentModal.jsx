/**
 * Modal para editar cita
 * Extraído de Appointments.jsx
 */
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../../../api/client';
import { PhoneInput } from '../PhoneInput';

export function EditAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onSubmit,
  services,
  employees,
  business,
  isSaving,
  colors
}) {
  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    serviceId: '',
    employeeId: '',
    startTime: '',
    selectedDate: '',
    notes: '',
    extraServices: []
  });
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceList, setShowServiceList] = useState(false);
  const [extraServiceSearch, setExtraServiceSearch] = useState('');
  const [showExtraServiceList, setShowExtraServiceList] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Cargar datos de la cita
  useEffect(() => {
    if (appointment) {
      const appointmentDate = appointment.startTime 
        ? new Date(appointment.startTime).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      setForm({
        clientName: appointment.clientName || '',
        clientPhone: appointment.clientPhone || '',
        clientEmail: appointment.clientEmail || '',
        serviceId: appointment.serviceId || '',
        employeeId: appointment.employeeId || '',
        startTime: appointment.startTime ? new Date(appointment.startTime).toISOString().slice(0, 16) : '',
        selectedDate: appointmentDate,
        notes: appointment.notes || '',
        extraServices: appointment.extraServices || []
      });
      setServiceSearch('');
    }
  }, [appointment]);

  // Cargar slots disponibles
  useEffect(() => {
    const loadSlots = async () => {
      if (!form.employeeId || !form.serviceId || !form.selectedDate) {
        setAvailableSlots([]);
        return;
      }

      try {
        const allowPast = !business?.hasFieldTechnicians;
        const res = await api.get(`/appointments/availability`, {
          params: {
            date: form.selectedDate,
            employeeId: form.employeeId,
            serviceId: form.serviceId,
            businessId: business.id,
            allowPast: allowPast,
            noCache: true
          }
        });
        setAvailableSlots(res.data.availableSlots || []);
      } catch (e) {
        setAvailableSlots([]);
      }
    };

    loadSlots();
  }, [form.employeeId, form.serviceId, form.selectedDate, form.extraServices, business]);

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

  const selectedService = services.find(s => s.id === form.serviceId);
  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const filteredExtraServices = services.filter(s => 
    s.id !== form.serviceId && 
    !form.extraServices.find(es => es.serviceId === s.id) &&
    s.name.toLowerCase().includes(extraServiceSearch.toLowerCase())
  );

  const handleClose = () => {
    setAvailableSlots([]);
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(appointment, form);
  };

  if (!isOpen || !appointment) return null;

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
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: colors.text }}>
          ✏️ Editar Cita
        </h2>

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
                        <div style={{ fontSize: 12, color: colors.textSecondary }}>{s.durationMin} min</div>
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
            ➕ Servicios adicionales
          </label>
          
          {form.extraServices.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {form.extraServices.map(s => (
                <div key={s.serviceId} style={{ 
                  background: '#dbeafe', color: '#1e40af', padding: '4px 10px', 
                  borderRadius: 16, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
                  border: '1px solid #bfdbfe'
                }}>
                  <span>{s.name}</span>
                  <X size={14} style={{ cursor: 'pointer' }} onClick={() => handleRemoveExtraService(s.serviceId)} />
                </div>
              ))}
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Agregar otro servicio..."
              value={extraServiceSearch}
              onFocus={() => setShowExtraServiceList(true)}
              onChange={(e) => setExtraServiceSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: `1px dashed ${colors.border}`, borderRadius: 8, fontSize: 13, background: colors.inputBg, color: colors.text }}
            />
            {showExtraServiceList && extraServiceSearch && (
              <div style={{
                position: 'absolute', bottom: '100%', left: 0, right: 0, 
                background: colors.cardBg, border: `1px solid ${colors.border}`,
                borderRadius: 8, boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.1)',
                zIndex: 101, maxHeight: 120, overflowY: 'auto'
              }}>
                {filteredExtraServices.map(s => (
                  <div
                    key={s.id}
                    onClick={() => handleAddExtraService(s)}
                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: `1px solid ${colors.border}` }}
                    onMouseEnter={(e) => e.target.style.background = colors.bgSecondary}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 13, color: colors.text }}>{s.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Empleado */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>Empleado</label>
          <select
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
          >
            <option value="">Selecciona empleado</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.User?.name}</option>)}
          </select>
        </div>

        {/* Fecha */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>Fecha</label>
          <input
            type="date"
            value={form.selectedDate}
            onChange={(e) => {
              setForm({ ...form, selectedDate: e.target.value, startTime: '' });
              setAvailableSlots([]);
            }}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
          />
        </div>

        {/* Horarios disponibles */}
        {form.employeeId && form.serviceId && form.selectedDate && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: colors.text }}>
              Horarios disponibles
            </label>
            {availableSlots.length === 0 ? (
              <div style={{ padding: 12, background: colors.bgSecondary, borderRadius: 8, color: colors.textSecondary, fontSize: 14, textAlign: 'center' }}>
                Cargando horarios...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8, maxHeight: 150, overflowY: 'auto', border: `1px solid ${colors.border}`, borderRadius: 8, padding: 10 }}>
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => setForm({ ...form, startTime: slot.startTime })}
                    style={{
                      padding: 8, border: `2px solid ${form.startTime === slot.startTime ? '#10b981' : colors.border}`,
                      borderRadius: 6, background: form.startTime === slot.startTime ? '#10b981' : colors.inputBg,
                      color: form.startTime === slot.startTime ? 'white' : colors.text, cursor: 'pointer', fontSize: 12, fontWeight: 600
                    }}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cliente */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>Nombre Cliente</label>
          <input
            type="text"
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
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

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>Email</label>
          <input
            type="email"
            value={form.clientEmail}
            onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
          />
        </div>

        {/* Notas */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text, resize: 'vertical' }}
          />
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleClose} style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, background: 'none', color: colors.text }}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            style={{
              flex: 1, padding: 10, borderRadius: 8, border: 'none',
              background: isSaving ? colors.bgTertiary : '#10b981', color: isSaving ? colors.text : 'white',
              fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer'
            }}
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditAppointmentModal;
