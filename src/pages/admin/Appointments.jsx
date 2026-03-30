import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
import ResponsiveCalendar from '../../components/ResponsiveCalendar';
import { Check, X, Mail, Plus } from 'lucide-react';

const STATUS_LABELS = {
  pending: { label: 'Pendiente', color: '#f59e0b' },
  confirmed: { label: 'Confirmada', color: '#10b981' },
  attention: { label: 'En atención', color: '#3b82f6' },
  done: { label: 'Completada', color: '#8b5cf6' },
  cancelled: { label: 'Cancelada', color: '#ef4444' }
};

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

export default function Appointments() {
  const { business } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Inicializar con la fecha actual en Colombia
    const colombiaStr = new Date().toLocaleString("en-US", {timeZone: "America/Bogota"});
    return new Date(colombiaStr);
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [createForm, setCreateForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceId: '',
    employeeId: '',
    startTime: '',
    notes: ''
  });
  const [creating, setCreating] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDateModal, setSelectedDateModal] = useState('');

  useEffect(() => {
    if (business?.id) {
      loadAppointments();
      loadServices();
      loadEmployees();
    }
  }, [business]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/appointments?businessId=${business.id}`);
      setAppointments(res.data);
    } catch (e) {
      console.error('Error al cargar citas:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const res = await api.get(`/services?businessId=${business.id}`);
      setServices(res.data);
    } catch (e) {
      console.error('Error al cargar servicios:', e);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await api.get(`/employees?businessId=${business.id}`);
      setEmployees(res.data);
    } catch (e) {
      console.error('Error al cargar empleados:', e);
    }
  };

  const loadAvailableSlots = async (date, employeeId, serviceId) => {
    console.log('Cargando disponibilidad:', { date, employeeId, serviceId });
    
    if (!date || !employeeId || !serviceId) {
      setAvailableSlots([]);
      return;
    }

    try {
      // Usar endpoint de prueba temporalmente
      const res = await api.get(`/appointments/test-availability`);
      console.log('Respuesta de disponibilidad (prueba):', res.data);
      setAvailableSlots(res.data.availableSlots || []);
    } catch (e) {
      console.error('Error al cargar disponibilidad:', e);
      // Si falla el endpoint de prueba, intentar el real
      try {
        const resReal = await api.get(`/appointments/availability?date=${date}&employeeId=${employeeId}&serviceId=${serviceId}&businessId=${business.id}`);
        console.log('Respuesta de disponibilidad (real):', resReal.data);
        setAvailableSlots(resReal.data.availableSlots || []);
      } catch (e2) {
        console.error('Error al cargar disponibilidad (real):', e2);
        setAvailableSlots([]);
      }
    }
  };

  const filteredAppointments = useMemo(() => {
    const dateStr = selectedDate.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      return aptDate === dateStr;
    });
  }, [appointments, selectedDate]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      loadAppointments();
    } catch (e) {
      console.error('Error al actualizar estado:', e);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!confirm('¿Cancelar esta cita?')) return;
    try {
      await api.patch(`/appointments/${appointmentId}/cancel`);
      loadAppointments();
    } catch (e) {
      console.error('Error al cancelar:', e);
    }
  };

  const handleSendReceipt = async (appointmentId) => {
    if (!confirm('¿Enviar comprobante de pago por correo?')) return;
    try {
      await api.post(`/appointments/${appointmentId}/send-receipt`);
      alert('✅ Comprobante de pago enviado exitosamente');
    } catch (e) {
      console.error('Error al enviar comprobante:', e);
      alert('❌ Error al enviar comprobante: ' + (e.response?.data?.error || e.message));
    }
  };

  useEffect(() => {
    if (selectedDateModal && createForm.employeeId && createForm.serviceId) {
      loadAvailableSlots(selectedDateModal, createForm.employeeId, createForm.serviceId);
    }
  }, [selectedDateModal, createForm.employeeId, createForm.serviceId]);

  const handleCreateAppointment = async () => {
    if (!createForm.clientName || !createForm.serviceId || !createForm.employeeId || !createForm.startTime) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setCreating(true);
    try {
      await api.post('/appointments', {
        businessId: business.id,
        ...createForm,
        startTime: new Date(createForm.startTime).toISOString()
      });
      
      await loadAppointments();
      resetCreateForm();
      setShowCreateModal(false);
      alert('✅ Cita creada exitosamente');
    } catch (e) {
      console.error('Error al crear cita:', e);
      alert('❌ Error al crear cita: ' + (e.response?.data?.error || e.message));
    } finally {
      setCreating(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      serviceId: '',
      employeeId: '',
      startTime: '',
      notes: ''
    });
    setSelectedDateModal('');
    setAvailableSlots([]);
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDisabledDates = () => {
    // Puedes agregar lógica para deshabilitar fechas sin citas
    return [];
  };

  return (
    <AdminLayout title="Citas" subtitle="Gestiona las citas de tus clientes">
      <style>{`
        @media (max-width: 768px) {
          .admin-appointments-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '300px 1fr',
        gap: 20,
        alignItems: 'start'
      }} className="admin-appointments-grid">
        {/* Calendario */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📅 Selecciona fecha</h3>
          <ResponsiveCalendar
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
            disabledDates={getDisabledDates()}
            minDate={new Date()}
          />
        </div>

        {/* Citas del día */}
        <div className="card">
          <div className="card-header" style={{ 
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div className="card-title">
                📋 Citas del {selectedDate.toLocaleDateString('es-CO', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <div className="card-subtitle">{filteredAppointments.length} cita{filteredAppointments.length !== 1 ? 's' : ''}</div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={16} />
              Nueva Cita
            </button>
          </div>

          <ResponsiveTable
            columns={[
              {
                key: 'client',
                label: 'Cliente',
                render: (v, row) => row.clientName || row.clientEmail || '—'
              },
              {
                key: 'time',
                label: 'Hora',
                render: (v, row) => formatTime(row.startTime)
              },
              {
                key: 'service',
                label: 'Servicio',
                render: (v, row) => row.Service?.name || '—'
              },
              {
                key: 'status',
                label: 'Estado',
                render: (v) => (
                  <span
                    style={{
                      background: STATUS_LABELS[v]?.color || '#999',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    {STATUS_LABELS[v]?.label || v}
                  </span>
                )
              }
            ]}
            data={filteredAppointments}
            actions={(row) => {
              const actions = [
                {
                  label: '✓ Confirmar',
                  onClick: () => handleStatusChange(row.id, 'confirmed'),
                  color: '#10b981',
                  show: row.status === 'pending'
                },
                {
                  label: '▶ Atención',
                  onClick: () => handleStatusChange(row.id, 'attention'),
                  color: '#3b82f6',
                  show: row.status === 'confirmed'
                },
                {
                  label: '✓ Completar',
                  onClick: () => handleStatusChange(row.id, 'done'),
                  color: '#8b5cf6',
                  show: ['confirmed', 'attention'].includes(row.status)
                },
                {
                  label: '✕ Cancelar',
                  onClick: () => handleCancel(row.id),
                  color: '#ef4444',
                  show: ['pending', 'confirmed', 'attention'].includes(row.status)
                }
              ];

              // Agregar botón de envío de comprobante solo para citas completadas
              if (row.status === 'done') {
                actions.push({
                  label: '📧 Enviar Comprobante',
                  onClick: () => handleSendReceipt(row.id),
                  color: '#0ea5e9'
                });
              }

              return actions.filter(action => action.show !== false);
            }}
            loading={loading}
            emptyMessage="No hay citas para esta fecha"
          />
        </div>
      </div>

      {/* Modal para crear nueva cita */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Crear Nueva Cita</h2>
              <button
                onClick={() => {
                  resetCreateForm();
                  setShowCreateModal(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Servicio *</label>
              <select
                value={createForm.serviceId}
                onChange={(e) => setCreateForm({...createForm, serviceId: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Selecciona un servicio</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {fmt(service.price)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Empleado *</label>
              <select
                value={createForm.employeeId}
                onChange={(e) => setCreateForm({...createForm, employeeId: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Selecciona un empleado</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.User?.name || employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                📅 Fecha de la cita *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={selectedDateModal}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    console.log('Fecha seleccionada:', newDate);
                    setSelectedDateModal(newDate);
                    setCreateForm({...createForm, startTime: ''});
                    setAvailableSlots([]);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '15px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '16px',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onFocus={(e) => {
                    console.log('Input enfocado');
                    e.target.showPicker?.();
                  }}
                />
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#6b7280',
                  fontSize: '20px'
                }}>
                  📅
                </div>
              </div>
            </div>

            {selectedDateModal && createForm.employeeId && createForm.serviceId && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  ⏰ Horarios disponibles ({availableSlots.length})
                </label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                  gap: '8px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  padding: '16px',
                  backgroundColor: '#f8fafc'
                }}>
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          console.log('Hora seleccionada:', slot);
                          setCreateForm({...createForm, startTime: `${selectedDateModal}T${slot}`});
                        }}
                        style={{
                          padding: '14px 10px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          background: createForm.startTime === `${selectedDateModal}T${slot}` ? '#10b981' : '#ffffff',
                          color: createForm.startTime === `${selectedDateModal}T${slot}` ? '#ffffff' : '#374151',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          boxShadow: createForm.startTime === `${selectedDateModal}T${slot}` 
                            ? '0 4px 6px rgba(16, 185, 129, 0.3)' 
                            : '0 2px 4px rgba(0,0,0,0.1)',
                          transform: createForm.startTime === `${selectedDateModal}T${slot}` ? 'scale(1.05)' : 'scale(1)'
                        }}
                      >
                        🕐 {slot}
                      </button>
                    ))
                  ) : (
                    <div style={{ 
                      gridColumn: '1 / -1', 
                      textAlign: 'center', 
                      color: '#6b7280',
                      padding: '30px 20px',
                      fontSize: '16px',
                      backgroundColor: '#fef3c7',
                      borderRadius: '8px',
                      border: '2px dashed #f59e0b'
                    }}>
                      {selectedDateModal && createForm.employeeId && createForm.serviceId 
                        ? '🔄 Cargando horarios...' 
                        : '📋 Selecciona todos los campos arriba'
                      }
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Cliente *</label>
              <input
                type="text"
                value={createForm.clientName}
                onChange={(e) => setCreateForm({...createForm, clientName: e.target.value})}
                placeholder="Nombre del cliente"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Email</label>
              <input
                type="email"
                value={createForm.clientEmail}
                onChange={(e) => setCreateForm({...createForm, clientEmail: e.target.value})}
                placeholder="email@ejemplo.com"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Teléfono</label>
              <input
                type="tel"
                value={createForm.clientPhone}
                onChange={(e) => setCreateForm({...createForm, clientPhone: e.target.value})}
                placeholder="+57 300 000 0000"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Notas</label>
              <textarea
                value={createForm.notes}
                onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
                placeholder="Notas adicionales..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  resetCreateForm();
                  setShowCreateModal(false);
                }}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAppointment}
                disabled={creating}
                style={{
                  background: creating ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: creating ? 'not-allowed' : 'pointer'
                }}
              >
                {creating ? 'Creando...' : 'Crear Cita'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
