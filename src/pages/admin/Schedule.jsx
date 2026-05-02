import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import { Plus, Trash2, Calendar, Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Edit2, X, Info } from 'lucide-react';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const SCHEDULE_TYPES = [
  { value: 'work',    label: 'Jornada de trabajo',  color: '#4f46e5', bg: '#eef2ff', icon: '💼' },
  { value: 'lunch',   label: 'Almuerzo',             color: '#d97706', bg: '#fef3c7', icon: '🍽️' },
  { value: 'blocked', label: 'Bloqueado / Permiso',  color: '#ef4444', bg: '#fee2e2', icon: '🚫' },
];

export default function Schedule() {
  const { business } = useAuth();
  const { colors } = useTheme();
  const [employees, setEmployees]       = useState([]);
  const [schedules, setSchedules]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [expandedEmp, setExpandedEmp]   = useState(null);
  const [expandedDay, setExpandedDay]   = useState(null);
  const [form, setForm] = useState({
    employeeId: '', 
    dayOfWeek: '1',
    selectedDays: ['1', '2', '3', '4', '5'], // Lunes a Viernes por defecto
    startTime: '08:00', endTime: '19:00',
    type: 'work', description: '',
    includeLunch: false,
    lunchStart: '12:00', lunchEnd: '13:00',
  });
  const [saving, setSaving]             = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [toast, setToast]               = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Estados para confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const itemsPerPage = 7;

  const load = async (skipCache = false) => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const [empRes, schedRes] = await Promise.all([
        api.get(`/employees?businessId=${business.id}&onlyProfessionals=true`, skipCache ? { params: { noCache: true } } : {}),
        api.get(`/schedules/business/${business.id}`, skipCache ? { params: { noCache: true } } : {}),
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

  // Recargar empleados cuando el componente se monta (para detectar nuevos empleados creados)
  useEffect(() => {
    if (business?.id) {
      load(true);
    }
  }, []);

  const resetForm = () => {
    setForm({
      employeeId: employees.length > 0 ? employees[0].id : '',
      dayOfWeek: '1',
      selectedDays: ['1', '2', '3', '4', '5'],
      startTime: '08:00', endTime: '19:00',
      type: 'work', description: '',
      includeLunch: false,
      lunchStart: '12:00', lunchEnd: '13:00',
    });
    setEditingSchedule(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSchedule) {
        const payload = {
          ...form,
          businessId: business.id,
          dayOfWeek: parseInt(form.dayOfWeek, 10)
        };
        const res = await api.put(`/schedules/${editingSchedule.id}`, payload);
        setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? res.data : s));
      } else {
        const payload = {
          employeeId: form.employeeId,
          businessId: business.id,
          days: form.selectedDays.map(d => parseInt(d, 10)),
          startTime: form.startTime,
          endTime: form.endTime,
          type: form.type,
          description: form.description,
          includeLunch: form.includeLunch,
          lunchStart: form.lunchStart,
          lunchEnd: form.lunchEnd
        };
        await api.post('/schedules/bulk', payload);
      }
      
      await load(true);
      
      const empIndex = employees.findIndex(e => e.id === form.employeeId);
      if (empIndex !== -1) {
        const targetPage = Math.floor(empIndex / itemsPerPage) + 1;
        setCurrentPage(targetPage);
        setExpandedEmp(form.employeeId);
        // Expandir el primer día seleccionado si es bulk, o el día específico si es edit
        const dayToExpand = editingSchedule ? parseInt(form.dayOfWeek, 10) : parseInt(form.selectedDays[0], 10);
        setExpandedDay(`${form.employeeId}-${dayToExpand}`);
      }
      resetForm();
      setShowModal(false);
      showToast(editingSchedule ? 'Horario actualizado' : 'Horarios creados correctamente');
    } catch (e) {
      showToast(e.response?.data?.error || 'Error al guardar horario', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    setScheduleToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!scheduleToDelete) return;
    try {
      await api.delete(`/schedules/${scheduleToDelete}`);
      showToast('Horario eliminado');
      load(true);
    } catch (e) {
      showToast('Error al eliminar', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setScheduleToDelete(null);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setForm({
      employeeId:  schedule.employeeId,
      dayOfWeek:   schedule.dayOfWeek.toString(),
      selectedDays: [schedule.dayOfWeek.toString()],
      startTime:   schedule.startTime,
      endTime:     schedule.endTime,
      type:        schedule.type || 'work',
      description: schedule.description || '',
      includeLunch: false,
      lunchStart: '12:00',
      lunchEnd: '13:00',
    });
    setShowModal(true);
  };

  const groupedSchedules = schedules.reduce((acc, s) => {
    const empId = s.employeeId;
    const dayOfWeek = parseInt(s.dayOfWeek, 10);
    if (!acc[empId]) acc[empId] = {};
    if (!acc[empId][dayOfWeek]) acc[empId][dayOfWeek] = [];
    acc[empId][dayOfWeek].push(s);
    return acc;
  }, {});

  const getTypeInfo = (type) => SCHEDULE_TYPES.find(t => t.value === type) || SCHEDULE_TYPES[0];
  const expandKey   = (empId, day) => `${empId}-${day}`;

  const paginatedEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(employees.length / itemsPerPage);

  return (
    <AdminLayout title="Horarios" subtitle="Gestiona las jornadas laborales y descansos">
      <style>{`
        .sched-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px; }
        @media (max-width: 900px) { .sched-grid { grid-template-columns: 1fr; } }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Toast sutil */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: toast.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: toast.type === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          {toast.type === 'error' ? <X size={16} /> : <Plus size={16} style={{ transform: 'rotate(45deg)' }} />}
          {toast.msg}
        </div>
      )}

      {/* Cabecera de página */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Gestión de Horarios</h1>
          <p>Define jornadas, almuerzos y permisos por profesional</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus size={16} /> Agregar horario a profesional
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
          <div className="card-title">Horarios por Profesional</div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state" style={{ padding: 48 }}>
            <Calendar size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
            <h3>Sin profesionales</h3>
            <p>Registra profesionales primero para asignarles horarios.</p>
          </div>
        ) : (
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {paginatedEmployees.map(emp => {
              const empDays      = groupedSchedules[emp.id] || {};
              const isExpanded   = expandedEmp === emp.id;
              const totalScheds  = Object.values(empDays).flat().length;

              return (
                <div key={emp.id} style={{
                  border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden',
                  boxShadow: isExpanded ? 'var(--shadow-sm)' : 'none',
                  transition: 'box-shadow 0.2s',
                }}>
                  {/* Cabecera profesional */}
                  <div
                    style={{
                      padding: '12px 16px', background: colors.bgSecondary,
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
                        <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: colors.text }}>
                          {emp.User?.name}
                        </div>
                        <div style={{ fontSize: 11, color: colors.textSecondary }}>
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
                        title="Agregar horario a este profesional"
                      >
                        <Plus size={13} /> Agregar
                      </button>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Días del empleado */}
                  {isExpanded && (
                    <div style={{ padding: '8px 12px 12px', background: colors.cardBg }}>
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
                                    padding: '10px 14px', background: colors.bgTertiary,
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between', cursor: 'pointer',
                                  }}
                                  onClick={() => setExpandedDay(isDayExpanded ? null : dayKey)}
                                >
                                  <div style={{ fontWeight: 600, fontSize: 13, color: colors.text }}>
                                    {dayName}
                                    <span style={{
                                      marginLeft: 8, fontSize: 11, fontWeight: 400,
                                      color: colors.textSecondary,
                                    }}>
                                      ({daySchedules.length} bloque{daySchedules.length !== 1 ? 's' : ''})
                                    </span>
                                  </div>
                                  {isDayExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>

                                {/* Horarios del día */}
                                {isDayExpanded && (
                                  <div style={{ padding: '8px 10px', background: colors.cardBg, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {daySchedules.map(s => {
                                      const typeInfo = getTypeInfo(s.type);
                                      return (
                                        <div key={s.id} style={{
                                          display: 'flex', alignItems: 'center',
                                          justifyContent: 'space-between',
                                          padding: '10px 12px', borderRadius: 8,
                                          background: colors.bgSecondary,
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

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 12, 
            marginTop: 10,
            padding: '16px',
            borderTop: '1px solid var(--border)'
          }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-outline btn-sm"
              style={{ padding: '6px 12px' }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-outline btn-sm"
              style={{ padding: '6px 12px' }}
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 500 }}>
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
                  <label>Profesional *</label>
                  <select
                    value={form.employeeId}
                    onChange={e => setForm({ ...form, employeeId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar profesional</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.User?.name}</option>
                    ))}
                  </select>
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
                </div>

                {!editingSchedule ? (
                  <div className="form-group">
                    <label>Días de la semana *</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {DAYS.map((d, i) => {
                        const isSelected = form.selectedDays.includes(i.toString());
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              const newDays = isSelected
                                ? form.selectedDays.filter(day => day !== i.toString())
                                : [...form.selectedDays, i.toString()];
                              setForm({ ...form, selectedDays: newDays });
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                              border: '1px solid',
                              transition: 'all 0.2s',
                              backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                              borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                              color: isSelected ? 'white' : 'var(--text)',
                              cursor: 'pointer'
                            }}
                          >
                            {d.substring(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
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
                )}

                <div className="schedule-time-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Hora inicio *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="([0-1]?[0-9]|2[0-3]):[0-5][0-9]"
                      placeholder="08:00"
                      value={form.startTime}
                      onChange={e => {
                        let val = e.target.value.replace(/[^0-9:]/g, '');
                        if (val.length === 4 && !val.includes(':')) {
                          val = val.slice(0, 2) + ':' + val.slice(2);
                        }
                        if (val.length <= 5) {
                          setForm({ ...form, startTime: val });
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Hora fin *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="([0-1]?[0-9]|2[0-3]):[0-5][0-9]"
                      placeholder="17:00"
                      value={form.endTime}
                      onChange={e => {
                        let val = e.target.value.replace(/[^0-9:]/g, '');
                        if (val.length === 4 && !val.includes(':')) {
                          val = val.slice(0, 2) + ':' + val.slice(2);
                        }
                        if (val.length <= 5) {
                          setForm({ ...form, endTime: val });
                        }
                      }}
                      required
                    />
                  </div>
                </div>

                {form.type === 'work' && !editingSchedule && (
                  <div style={{ marginBottom: 20, padding: 12, borderRadius: 8, background: colors.bgSecondary, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: form.includeLunch ? 12 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>🍽️</span>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>Incluir Almuerzo</span>
                      </div>
                      <label className="switch" style={{ position: 'relative', display: 'inline-block', width: 40, height: 20 }}>
                        <input 
                          type="checkbox" 
                          checked={form.includeLunch}
                          onChange={e => setForm({ ...form, includeLunch: e.target.checked })}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: form.includeLunch ? 'var(--primary)' : '#ccc',
                          transition: '.4s', borderRadius: 20
                        }}>
                          <span style={{
                            position: 'absolute', content: '""', height: 16, width: 16, left: form.includeLunch ? 22 : 2, bottom: 2,
                            backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                          }}></span>
                        </span>
                      </label>
                    </div>

                    {form.includeLunch && (
                      <div className="schedule-time-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 11 }}>Inicio almuerzo</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="([0-1]?[0-9]|2[0-3]):[0-5][0-9]"
                            placeholder="12:00"
                            value={form.lunchStart}
                            onChange={e => {
                              let val = e.target.value.replace(/[^0-9:]/g, '');
                              if (val.length === 4 && !val.includes(':')) {
                                val = val.slice(0, 2) + ':' + val.slice(2);
                              }
                              if (val.length <= 5) {
                                setForm({ ...form, lunchStart: val });
                              }
                            }}
                            style={{ padding: '6px 10px', fontSize: 13 }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 11 }}>Fin almuerzo</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="([0-1]?[0-9]|2[0-3]):[0-5][0-9]"
                            placeholder="13:00"
                            value={form.lunchEnd}
                            onChange={e => {
                              let val = e.target.value.replace(/[^0-9:]/g, '');
                              if (val.length === 4 && !val.includes(':')) {
                                val = val.slice(0, 2) + ':' + val.slice(2);
                              }
                              if (val.length <= 5) {
                                setForm({ ...form, lunchEnd: val });
                              }
                            }}
                            style={{ padding: '6px 10px', fontSize: 13 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                  background: colors.bgSecondary, borderRadius: 8,
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

      {/* Modal: Confirmar eliminación de horario */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>¿Eliminar horario?</h3>
              <button className="btn-ghost" onClick={() => setShowDeleteConfirm(false)}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.5 }}>
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
              <button className="btn-danger" onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
