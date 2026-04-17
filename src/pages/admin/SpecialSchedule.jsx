import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import { Plus, Trash2, Calendar, Clock, Edit2, X, Info, Repeat } from 'lucide-react';

const SCHEDULE_TYPES = [
  { value: 'work',    label: 'Jornada de trabajo',  color: '#4f46e5', bg: '#eef2ff', icon: '💼' },
  { value: 'lunch',   label: 'Almuerzo',             color: '#d97706', bg: '#fef3c7', icon: '🍽️' },
  { value: 'blocked', label: 'Bloqueado / Permiso',  color: '#ef4444', bg: '#fee2e2', icon: '🚫' },
  { value: 'closed',  label: 'Cerrado (No laborable)', color: '#7c3aed', bg: '#ede9fe', icon: '🏖️' },
];

// Lista de festivos comunes en Colombia (para referencia)
const COMMON_HOLIDAYS = [
  { date: '01-01', name: 'Año Nuevo' },
  { date: '01-06', name: 'Día de Reyes' },
  { date: '03-24', name: 'Día de San José' },
  { date: '04-17', name: 'Jueves Santo' },
  { date: '04-18', name: 'Viernes Santo' },
  { date: '05-01', name: 'Día del Trabajo' },
  { date: '06-02', name: 'Ascensión del Señor' },
  { date: '06-23', name: 'Corpus Christi' },
  { date: '06-30', name: 'Sagrado Corazón' },
  { date: '07-20', name: 'Día de la Independencia' },
  { date: '08-07', name: 'Batalla de Boyacá' },
  { date: '08-15', name: 'Asunción de la Virgen' },
  { date: '10-12', name: 'Día de la Raza' },
  { date: '11-01', name: 'Día de Todos los Santos' },
  { date: '11-11', name: 'Independencia de Cartagena' },
  { date: '12-08', name: 'Inmaculada Concepción' },
  { date: '12-25', name: 'Navidad' },
];

export default function SpecialSchedule() {
  const { business } = useAuth();
  const { colors } = useTheme();
  const [employees, setEmployees]       = useState([]);
  const [schedules, setSchedules]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [form, setForm] = useState({
    employeeId: '',
    specificDate: '',
    startTime: '08:00',
    endTime: '17:00',
    type: 'work',
    description: '',
    isRecurringYearly: false,
  });
  const [saving, setSaving]             = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [toast, setToast]               = useState(null);
  const [filterMonth, setFilterMonth]   = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const itemsPerPage = 5;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const [empRes, schedRes] = await Promise.all([
        api.get(`/employees?businessId=${business.id}`),
        api.get(`/special-schedules/business/${business.id}`),
      ]);
      setEmployees(empRes.data || []);
      setSchedules(schedRes.data || []);
    } catch (e) {
      console.error('[SpecialSchedule] Error al cargar:', e);
      showToast('Error al cargar datos: ' + (e.response?.data?.error || e.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [business]);

  const resetForm = () => {
    setForm({
      employeeId: '',
      specificDate: '',
      startTime: '08:00',
      endTime: '17:00',
      type: 'work',
      description: '',
      isRecurringYearly: false,
    });
    setEditingSchedule(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        businessId: business.id,
        employeeId: form.employeeId || null, // null = aplica a todos
      };

      if (editingSchedule) {
        await api.put(`/special-schedules/${editingSchedule.id}`, data);
      } else {
        await api.post('/special-schedules', data);
      }
      await load();
      resetForm();
      setShowModal(false);
      showToast(editingSchedule ? 'Horario especial actualizado' : 'Horario especial creado');
    } catch (e) {
      showToast(e.response?.data?.error || 'Error al guardar horario especial', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este horario especial?')) return;
    try {
      await api.delete(`/special-schedules/${id}`);
      await load();
      showToast('Horario especial eliminado');
    } catch (e) {
      showToast(e.response?.data?.error || 'Error al eliminar', 'error');
    }
  };

  const startEdit = (sched) => {
    setEditingSchedule(sched);
    setForm({
      employeeId: sched.employeeId || '',
      specificDate: sched.specificDate,
      startTime: sched.startTime,
      endTime: sched.endTime,
      type: sched.type,
      description: sched.description || '',
      isRecurringYearly: sched.isRecurringYearly,
    });
    setShowModal(true);
  };

  const getTypeInfo = (type) => SCHEDULE_TYPES.find(t => t.value === type) || SCHEDULE_TYPES[0];

  const getEmployeeName = (employeeId) => {
    if (!employeeId) return '🏢 Todos los empleados';
    const emp = employees.find(e => e.id === employeeId);
    return emp ? `👤 ${emp.User?.name || 'Empleado'}` : '👤 Empleado';
  };

  // Agrupar horarios por fecha
  const groupedSchedules = schedules.reduce((acc, sched) => {
    const key = sched.specificDate;
    if (!acc[key]) acc[key] = [];
    acc[key].push(sched);
    return acc;
  }, {});

  // Ordenar fechas
  const sortedDates = Object.keys(groupedSchedules).sort();

  // Filtrar por mes si hay filtro
  const filteredDates = filterMonth 
    ? sortedDates.filter(date => date.startsWith(filterMonth))
    : sortedDates;

  // Paginación
  const totalPages = Math.ceil(filteredDates.length / itemsPerPage);
  const paginatedDates = filteredDates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const applyHoliday = (monthDay, name) => {
    const currentYear = new Date().getFullYear();
    setForm(f => ({
      ...f,
      specificDate: `${currentYear}-${monthDay}`,
      description: name,
      type: 'closed',
      isRecurringYearly: true,
    }));
  };

  // Crear todos los festivos de Colombia de una vez
  const createAllHolidays = async () => {
    if (!confirm('¿Crear automáticamente todos los festivos de Colombia para este año?\n\nSe marcarán como días cerrados y se configurarán para repetir cada año.')) {
      return;
    }

    const currentYear = new Date().getFullYear();
    let created = 0;
    let skipped = 0;

    // Verificar cuáles ya existen
    const existingDates = new Set(schedules.map(s => s.specificDate));

    for (const holiday of COMMON_HOLIDAYS) {
      const fullDate = `${currentYear}-${holiday.date}`;
      
      // Si ya existe un horario para esta fecha, saltar
      if (existingDates.has(fullDate)) {
        skipped++;
        continue;
      }

      try {
        await api.post('/special-schedules', {
          businessId: business.id,
          employeeId: null, // Aplica a todos
          specificDate: fullDate,
          startTime: '00:00',
          endTime: '23:59',
          type: 'closed',
          description: holiday.name,
          isRecurringYearly: true,
        });
        created++;
      } catch (e) {
        console.error(`Error creando festivo ${holiday.name}:`, e);
      }
    }

    await load();
    showToast(`✅ ${created} festivos creados${skipped > 0 ? `, ${skipped} omitidos (ya existían)` : ''}`);
  };

  const isClosed = (type) => type === 'closed';

  return (
    <AdminLayout>
      <div style={{ padding: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>📅 Horarios Especiales y Festivos</h1>
            <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
              Gestiona horarios para días festivos, fechas especiales o excepciones. 
              <strong> Reemplaza los horarios regulares</strong> para las fechas configuradas.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => { resetForm(); setShowModal(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={18} /> Nuevo horario especial
          </button>
        </div>

        {/* Info alert */}
        <div style={{ 
          background: 'var(--info-bg, #dbeafe)', 
          border: '1px solid var(--info-border, #3b82f6)', 
          borderRadius: 8, 
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          fontSize: 14,
          color: 'var(--info-text, var(--text))'
        }}>
          <Info size={20} color="var(--info-icon, #3b82f6)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>¿Cómo funcionan los horarios especiales?</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: 20, color: 'var(--text-secondary, inherit)' }}>
              <li>Para una fecha específica, el sistema usará estos horarios en lugar de los regulares</li>
              <li>Puedes marcar un día como <strong>"Cerrado"</strong> para que no aparezcan horarios disponibles</li>
              <li>Activa <strong>"Repetir anualmente"</strong> para festivos que ocurren todos los años (ej: Navidad)</li>
              <li>Si no seleccionas empleado, aplica a <strong>todos los empleados</strong> del negocio</li>
            </ul>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <select 
            value={filterMonth} 
            onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color)' }}
          >
            <option value="">📅 Todos los meses</option>
            <option value="2026-01">Enero 2026</option>
            <option value="2026-02">Febrero 2026</option>
            <option value="2026-03">Marzo 2026</option>
            <option value="2026-04">Abril 2026</option>
            <option value="2026-05">Mayo 2026</option>
            <option value="2026-06">Junio 2026</option>
            <option value="2026-07">Julio 2026</option>
            <option value="2026-08">Agosto 2026</option>
            <option value="2026-09">Septiembre 2026</option>
            <option value="2026-10">Octubre 2026</option>
            <option value="2026-11">Noviembre 2026</option>
            <option value="2026-12">Diciembre 2026</option>
          </select>
          
          <div style={{ width: 1, height: 24, background: 'var(--border-color)' }} />
          
          <button
            onClick={createAllHolidays}
            style={{ 
              padding: '8px 16px', 
              borderRadius: 6, 
              border: 'none',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer'
            }}
          >
            <Calendar size={16} />
            🎉 Crear todos los festivos 2026
          </button>
        </div>

        {/* Lista de horarios agrupados por fecha */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Cargando...</div>
        ) : filteredDates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <Calendar size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p>No hay horarios especiales configurados</p>
            <p style={{ fontSize: 14 }}>Usa el botón "Nuevo horario especial" para crear uno</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {paginatedDates.map(date => {
              const dateSchedules = groupedSchedules[date];
              const isRecurring = dateSchedules.some(s => s.isRecurringYearly);
              // Fix: Add timezone offset to prevent date shifting
              const dateObj = new Date(date + 'T00:00:00-05:00');
              const formattedDate = dateObj.toLocaleDateString('es-CO', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                timeZone: 'America/Bogota'
              });

              return (
                <div 
                  key={date} 
                  style={{ 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 12, 
                    overflow: 'hidden',
                    background: 'var(--bg-card)'
                  }}
                >
                  {/* Header de fecha */}
                  <div style={{ 
                    padding: '16px 20px', 
                    background: isRecurring ? 'var(--bg-accent)' : 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Calendar size={20} color={isRecurring ? 'var(--accent-purple, #7c3aed)' : 'var(--text-muted, #6b7280)'} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 16, textTransform: 'capitalize', color: 'var(--text)' }}>
                          {formattedDate}
                        </div>
                        {isRecurring && (
                          <div style={{ fontSize: 12, color: 'var(--accent-purple, #7c3aed)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Repeat size={12} /> Se repite cada año
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {dateSchedules.length} horario(s)
                    </div>
                  </div>

                  {/* Lista de horarios */}
                  <div style={{ padding: 12 }}>
                    {dateSchedules.map(sched => {
                      const typeInfo = getTypeInfo(sched.type);
                      const isClosedSchedule = isClosed(sched.type);

                      return (
                        <div
                          key={sched.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            marginBottom: 8,
                            borderRadius: 8,
                            background: 'var(--bg-card)',
                            border: `2px solid ${typeInfo.color}`,
                            boxShadow: `0 2px 4px ${typeInfo.color}20`,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 20 }}>{typeInfo.icon}</span>
                            <div>
                              <div style={{ fontWeight: 600, color: typeInfo.color, fontSize: 14, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                {typeInfo.label}
                                {isClosedSchedule && ' (No laborable)'}
                              </div>
                              {!isClosedSchedule && (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                                  <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                                  {sched.startTime} - {sched.endTime}
                                </div>
                              )}
                              <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>
                                {getEmployeeName(sched.employeeId)}
                              </div>
                              {sched.description && (
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic' }}>
                                  "{sched.description}"
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => startEdit(sched)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 6,
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-card)',
                                color: 'var(--text)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Editar"
                            >
                              <Edit2 size={16} color={typeInfo.color} />
                            </button>
                            <button
                              onClick={() => handleDelete(sched.id)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 6,
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-card)',
                                color: 'var(--text)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Eliminar"
                            >
                              <Trash2 size={16} color="#ef4444" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Paginación */}
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: 12, 
                marginTop: 20,
                padding: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: 8
              }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid var(--border-color)',
                    background: currentPage === 1 ? 'var(--bg-disabled)' : 'var(--bg-card)',
                    color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ← Anterior
                </button>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid var(--border-color)',
                    background: currentPage === totalPages ? 'var(--bg-disabled)' : 'var(--bg-card)',
                    color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
              <div className="modal-header">
                <h3>{editingSchedule ? 'Editar Horario Especial' : 'Nuevo Horario Especial'}</h3>
                <button onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>

              <form onSubmit={handleCreate}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Selector de Festivos */}
                  {!editingSchedule && (
                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Calendar size={16} color="#f59e0b" />
                        Seleccionar festivo de Colombia (opcional)
                      </label>
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            const [monthDay, name] = e.target.value.split('|');
                            const currentYear = new Date().getFullYear();
                            setForm(f => ({
                              ...f,
                              specificDate: `${currentYear}-${monthDay}`,
                              description: name,
                              type: 'closed',
                              isRecurringYearly: true,
                            }));
                          }
                        }}
                        style={{ width: '100%' }}
                      >
                        <option value="">-- Selecciona un festivo --</option>
                        {COMMON_HOLIDAYS.map(holiday => (
                          <option key={holiday.date} value={`${holiday.date}|${holiday.name}`}>
                            🏖️ {holiday.name} (día/mes: {holiday.date})
                          </option>
                        ))}
                      </select>
                      <small style={{ color: 'var(--warning, #f59e0b)', marginTop: 4, display: 'block' }}>
                        💡 Tip: Al seleccionar un festivo, se marca automáticamente como "Cerrado" y se configura para repetir cada año
                      </small>
                    </div>
                  )}

                  {/* Fecha */}
                  <div className="form-group">
                    <label>Fecha específica *</label>
                    <input
                      type="date"
                      value={form.specificDate}
                      onChange={(e) => setForm({ ...form, specificDate: e.target.value })}
                      required
                      style={{ width: '100%' }}
                    />
                    <small style={{ color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                      Este horario reemplazará los horarios regulares para esta fecha
                    </small>
                  </div>

                  {/* Empleado */}
                  <div className="form-group">
                    <label>Aplicar a *</label>
                    <select
                      value={form.employeeId}
                      onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                      style={{ width: '100%' }}
                      disabled={loading}
                    >
                      <option value="">🏢 Todos los empleados del negocio</option>
                      <optgroup label={`Empleados disponibles (${employees.length}):`}>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            👤 {emp.User?.name || emp.user?.name || emp.name || 'Sin nombre'} 
                            {emp.User?.email ? `(${emp.User.email})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <small style={{ color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                      {loading 
                        ? "Cargando empleados..." 
                        : employees.length === 0 
                          ? "⚠️ No se detectaron empleados activos. Verifica que tengas empleados creados."
                          : form.employeeId 
                            ? "Este horario solo aplicará al empleado seleccionado" 
                            : "Este horario aplicará a TODOS los empleados del negocio"}
                    </small>
                  </div>

                  {/* Tipo */}
                  <div className="form-group">
                    <label>Tipo de horario *</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      style={{ width: '100%' }}
                    >
                      {SCHEDULE_TYPES.map(t => (
                        <option key={t.value} value={t.value}>
                          {t.icon} {t.label}
                        </option>
                      ))}
                    </select>
                    {form.type === 'closed' && (
                      <div className="alert alert-info" style={{ marginTop: 8, padding: '8px 12px', fontSize: 12 }}>
                        ℹ️ El negocio o empleado aparecerá como <strong>cerrado</strong> este día. No se mostrarán horarios disponibles.
                      </div>
                    )}
                  </div>

                  {/* Horas (solo si no es cerrado) */}
                  {form.type !== 'closed' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-group">
                        <label>Hora inicio *</label>
                        <input
                          type="time"
                          value={form.startTime}
                          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Hora fin *</label>
                        <input
                          type="time"
                          value={form.endTime}
                          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Descripción */}
                  <div className="form-group">
                    <label>Descripción (opcional)</label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Ej: Festivo, Día especial, Horario de verano..."
                    />
                  </div>

                  {/* Recurrente anual */}
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={form.isRecurringYearly}
                      onChange={(e) => setForm({ ...form, isRecurringYearly: e.target.checked })}
                      style={{ width: 'auto' }}
                    />
                    <label htmlFor="isRecurring" style={{ margin: 0, cursor: 'pointer' }}>
                      <div style={{ fontWeight: 500 }}>📅 Repetir cada año</div>
                      <small style={{ color: 'var(--text-muted)' }}>
                        Útil para festivos que ocurren el mismo día todos los años
                      </small>
                    </label>
                  </div>

                  {/* Resumen */}
                  <div style={{
                    background: getTypeInfo(form.type).bg,
                    borderRadius: 8,
                    padding: '12px 14px',
                    fontSize: 13,
                    borderLeft: `4px solid ${getTypeInfo(form.type).color}`,
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: getTypeInfo(form.type).color }}>
                      {getTypeInfo(form.type).icon} {getTypeInfo(form.type).label}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      {form.specificDate ? new Date(form.specificDate).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Selecciona una fecha'}
                    </div>
                    {form.type !== 'closed' && (
                      <div style={{ marginTop: 4, color: 'var(--text-light)' }}>
                        {form.startTime} - {form.endTime}
                      </div>
                    )}
                    {form.description && (
                      <div style={{ marginTop: 4, color: 'var(--text-light)', fontStyle: 'italic' }}>
                        "{form.description}"
                      </div>
                    )}
                    {form.isRecurringYearly && (
                      <div style={{ marginTop: 4, color: 'var(--accent-purple, #7c3aed)', fontSize: 12 }}>
                        <Repeat size={12} style={{ display: 'inline', marginRight: 4 }} />
                        Se repite cada año
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
                  <button type="submit" className="btn-primary" disabled={saving || !form.specificDate}>
                    {saving ? 'Guardando...' : editingSchedule ? 'Actualizar' : 'Crear horario especial'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            padding: '12px 20px',
            borderRadius: 8,
            background: toast.type === 'error' ? '#fee2e2' : '#dcfce7',
            color: toast.type === 'error' ? '#991b1b' : '#166534',
            border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
            zIndex: 9999,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            {toast.msg}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
