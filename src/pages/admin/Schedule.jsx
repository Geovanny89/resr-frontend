import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import { Plus, Trash2, Calendar, Clock, ChevronDown, ChevronUp, Edit2, X, Info } from 'lucide-react';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const SCHEDULE_TYPES = [
  { value: 'work',    label: 'Jornada de trabajo',  color: '#4f46e5', bg: '#eef2ff', icon: '💼' },
  { value: 'lunch',   label: 'Almuerzo',             color: '#d97706', bg: '#fef3c7', icon: '🍽️' },
  { value: 'blocked', label: 'Bloqueado / Permiso',  color: '#ef4444', bg: '#fee2e2', icon: '🚫' },
];

export default function Schedule() {
  const { business } = useAuth();
  const [employees, setEmployees]       = useState([]);
  const [schedules, setSchedules]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [expandedEmp, setExpandedEmp]   = useState(null);
  const [expandedDay, setExpandedDay]   = useState(null);
  const [form, setForm] = useState({
    employeeId: '', dayOfWeek: '1',
    startTime: '08:00', endTime: '17:00',
    type: 'work', description: '',
  });
  const [saving, setSaving]             = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const load = async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const [empRes, schedRes] = await Promise.all([
        api.get(`/employees?businessId=${business.id}`),
        api.get(`/schedules/business/${business.id}`),
      ]);
      setEmployees(empRes.data);
      setSchedules(schedRes.data);
      if (empRes.data.length > 0 && !form.employeeId) {
        setForm(f => ({ ...f, employeeId: empRes.data[0].id }));
      }
    } catch (e) {
      console.error('Error al cargar horarios', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [business]);

  const resetForm = () => {
    setForm({
      employeeId: employees.length > 0 ? employees[0].id : '',
      dayOfWeek: '1', startTime: '08:00', endTime: '17:00',
      type: 'work', description: '',
    });
    setEditingSchedule(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSchedule) {
        await api.put(`/schedules/${editingSchedule.id}`, { ...form, businessId: business.id });
      } else {
        await api.post('/schedules', { ...form, businessId: business.id });
      }
      await load();
      resetForm();
      setShowModal(false);
    } catch (e) {
      alert(e.response?.data?.error || 'Error al guardar horario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este horario?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      await load();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al eliminar');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setForm({
      employeeId:  schedule.employeeId,
      dayOfWeek:   schedule.dayOfWeek.toString(),
      startTime:   schedule.startTime,
      endTime:     schedule.endTime,
      type:        schedule.type || 'work',
      description: schedule.description || '',
    });
    setShowModal(true);
  };

  const groupedSchedules = schedules.reduce((acc, s) => {
    const empId = s.employeeId;
    if (!acc[empId]) acc[empId] = {};
    if (!acc[empId][s.dayOfWeek]) acc[empId][s.dayOfWeek] = [];
    acc[empId][s.dayOfWeek].push(s);
    return acc;
  }, {});

  const getTypeInfo = (type) => SCHEDULE_TYPES.find(t => t.value === type) || SCHEDULE_TYPES[0];
  const expandKey   = (empId, day) => `${empId}-${day}`;

  return (
    <AdminLayout title="Horarios" subtitle="Configura la disponibilidad de tu equipo">

      {/* Cabecera de página */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Gestión de Horarios</h1>
          <p>Define jornadas, almuerzos y permisos por empleado</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus size={16} /> Agregar horario
          </button>
        </div>
      </div>

      {/* Leyenda de tipos */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {SCHEDULE_TYPES.map(t => (
          <div key={t.value} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: t.bg, borderRadius: 20, padding: '5px 12px',
            fontSize: 12, fontWeight: 600, color: t.color,
            border: `1px solid ${t.color}30`,
          }}>
            <span>{t.icon}</span> {t.label}
          </div>
        ))}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#f0fdf4', borderRadius: 20, padding: '5px 12px',
          fontSize: 12, color: '#166534', border: '1px solid #bbf7d0',
        }}>
          <Info size={12} /> Almuerzo y permisos bloquean automáticamente los horarios de cita
        </div>
      </div>

      {/* Lista de empleados */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="card-title">Horarios por Empleado</div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state" style={{ padding: 48 }}>
            <Calendar size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
            <h3>Sin empleados</h3>
            <p>Registra empleados primero para asignarles horarios.</p>
          </div>
        ) : (
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {employees.map(emp => {
              const empDays      = groupedSchedules[emp.id] || {};
              const isExpanded   = expandedEmp === emp.id;
              const totalScheds  = Object.values(empDays).flat().length;

              return (
                <div key={emp.id} style={{
                  border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden',
                  boxShadow: isExpanded ? 'var(--shadow-sm)' : 'none',
                  transition: 'box-shadow 0.2s',
                }}>
                  {/* Cabecera empleado */}
                  <div
                    style={{
                      padding: '12px 16px', background: 'var(--gray-50)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', cursor: 'pointer',
                      gap: 12,
                    }}
                    onClick={() => setExpandedEmp(isExpanded ? null : emp.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div className="avatar" style={{ width: 36, height: 36, flexShrink: 0 }}>
                        {emp.User?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {emp.User?.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {totalScheds} horario{totalScheds !== 1 ? 's' : ''} configurado{totalScheds !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setForm(f => ({ ...f, employeeId: emp.id }));
                          setEditingSchedule(null);
                          setShowModal(true);
                        }}
                        className="btn-outline btn-sm"
                        title="Agregar horario a este empleado"
                      >
                        <Plus size={13} /> Agregar
                      </button>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Días del empleado */}
                  {isExpanded && (
                    <div style={{ padding: '8px 12px 12px', background: '#fff' }}>
                      {totalScheds === 0 ? (
                        <p style={{ fontSize: 13, textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)' }}>
                          Sin horarios asignados
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {DAYS.map((dayName, dayIndex) => {
                            const daySchedules = empDays[dayIndex] || [];
                            if (daySchedules.length === 0) return null;

                            const dayKey      = expandKey(emp.id, dayIndex);
                            const isDayExpanded = expandedDay === dayKey;

                            return (
                              <div key={dayIndex} style={{
                                borderRadius: 8, overflow: 'hidden',
                                border: '1px solid var(--border)',
                              }}>
                                {/* Cabecera día */}
                                <div
                                  style={{
                                    padding: '10px 14px', background: 'var(--gray-50)',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between', cursor: 'pointer',
                                  }}
                                  onClick={() => setExpandedDay(isDayExpanded ? null : dayKey)}
                                >
                                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                                    {dayName}
                                    <span style={{
                                      marginLeft: 8, fontSize: 11, fontWeight: 400,
                                      color: 'var(--text-muted)',
                                    }}>
                                      ({daySchedules.length} bloque{daySchedules.length !== 1 ? 's' : ''})
                                    </span>
                                  </div>
                                  {isDayExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>

                                {/* Horarios del día */}
                                {isDayExpanded && (
                                  <div style={{ padding: '8px 10px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {daySchedules.map(s => {
                                      const typeInfo = getTypeInfo(s.type);
                                      return (
                                        <div key={s.id} style={{
                                          display: 'flex', alignItems: 'center',
                                          justifyContent: 'space-between',
                                          padding: '10px 12px', borderRadius: 8,
                                          background: typeInfo.bg,
                                          borderLeft: `4px solid ${typeInfo.color}`,
                                          gap: 8, flexWrap: 'wrap',
                                        }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                            <span style={{ fontSize: 18, flexShrink: 0 }}>{typeInfo.icon}</span>
                                            <div style={{ minWidth: 0 }}>
                                              <div style={{ fontWeight: 700, fontSize: 13, color: typeInfo.color }}>
                                                {typeInfo.label}
                                              </div>
                                              <div style={{
                                                color: 'var(--text-muted)', fontSize: 12,
                                                display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap',
                                              }}>
                                                <Clock size={11} />
                                                <strong>{s.startTime} – {s.endTime}</strong>
                                                {s.description && (
                                                  <span style={{ color: 'var(--text-light)' }}>· {s.description}</span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                            <button
                                              onClick={() => handleEdit(s)}
                                              className="btn-ghost btn-icon btn-sm"
                                              title="Editar"
                                              style={{ color: 'var(--primary)' }}
                                            >
                                              <Edit2 size={13} />
                                            </button>
                                            <button
                                              onClick={() => handleDelete(s.id)}
                                              className="btn-ghost btn-icon btn-sm"
                                              title="Eliminar"
                                              style={{ color: 'var(--danger)' }}
                                            >
                                              <Trash2 size={13} />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <style>{`
              @media (max-width: 480px) {
                .schedule-time-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
            <div className="modal-header">
              <div className="modal-title">
                {editingSchedule ? 'Editar horario' : 'Nuevo horario'}
              </div>
              <button className="btn-ghost btn-icon" onClick={() => { setShowModal(false); resetForm(); }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Empleado *</label>
                  <select
                    value={form.employeeId}
                    onChange={e => setForm({ ...form, employeeId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar empleado</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.User?.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Día de la semana *</label>
                  <select
                    value={form.dayOfWeek}
                    onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}
                    required
                  >
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>

                <div className="schedule-time-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Hora inicio *</label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={e => setForm({ ...form, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Hora fin *</label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={e => setForm({ ...form, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Tipo de horario *</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    required
                  >
                    {SCHEDULE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                  {form.type !== 'work' && (
                    <div className="alert alert-warning" style={{ marginTop: 8, padding: '8px 12px', fontSize: 12 }}>
                      ⚠️ Este bloque <strong>NO estará disponible</strong> para reservar citas.
                    </div>
                  )}
                  {form.type === 'work' && (
                    <div className="alert alert-success" style={{ marginTop: 8, padding: '8px 12px', fontSize: 12 }}>
                      ✅ Este bloque <strong>SÍ estará disponible</strong> para reservar citas.
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Descripción (opcional)</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Ej: Almuerzo, Permiso médico, Reunión..."
                  />
                </div>

                {/* Resumen */}
                <div style={{
                  background: 'var(--gray-50)', borderRadius: 8,
                  padding: '12px 14px', fontSize: 13,
                  borderLeft: `4px solid ${getTypeInfo(form.type).color}`,
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 6, color: getTypeInfo(form.type).color }}>
                    {getTypeInfo(form.type).icon} {getTypeInfo(form.type).label}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {DAYS[parseInt(form.dayOfWeek)]} · {form.startTime} – {form.endTime}
                  </div>
                  {form.description && (
                    <div style={{ marginTop: 4, color: 'var(--text-light)', fontStyle: 'italic' }}>
                      "{form.description}"
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setShowModal(false); resetForm(); }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editingSchedule ? 'Actualizar' : 'Crear horario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
