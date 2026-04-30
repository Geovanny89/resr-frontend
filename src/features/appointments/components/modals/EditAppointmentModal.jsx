/**
 * Modal para editar cita
 * Extraído de Appointments.jsx
 */
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../../../api/client';

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
    notes: ''
  });
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
        notes: appointment.notes || ''
      });
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
  }, [form.employeeId, form.serviceId, form.selectedDate, business]);

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

        {/* Servicio */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>Servicio</label>
          <select
            value={form.serviceId}
            onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
          >
            <option value="">Selecciona servicio</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.durationMin} min)</option>)}
          </select>
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
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: colors.text }}>Teléfono</label>
          <input
            type="tel"
            value={form.clientPhone}
            onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
          />
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
