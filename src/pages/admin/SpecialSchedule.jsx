import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import { Plus, Trash2, Calendar, Clock, Edit2, X, Info, Repeat } from 'lucide-react';
import {
  useSpecialSchedules,
  useSpecialSchedulesUI,
  useHolidays,
  SCHEDULE_TYPES,
  COMMON_HOLIDAYS,
  getColombianHolidays,
} from '../../features/specialschedules';

export default function SpecialSchedule() {
  const { business } = useAuth();
  const {
    employees,
    schedules,
    loading,
    saving,
    form,
    editingSchedule,
    scheduleToDelete,
    setScheduleToDelete,
    setEditSchedule,
    resetForm,
    updateFormField,
    saveSchedule,
    deleteSchedule,
    getEmployeeName,
    load,
  } = useSpecialSchedules(business?.id);

  const {
    showModal,
    showHolidayConfirm,
    showDeleteConfirm,
    filterMonth,
    currentPage,
    totalPages,
    groupedSchedules,
    paginatedDates,
    filteredDates,
    openModal,
    closeModal,
    openHolidayConfirm,
    closeHolidayConfirm,
    closeDeleteConfirm,
    openDeleteConfirm,
    setFilterMonth,
    goToNextPage,
    goToPrevPage,
  } = useSpecialSchedulesUI(schedules);

  const { createAllHolidays, getHolidayFormData } = useHolidays(business?.id, schedules, load);

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getTypeInfo = (type) => SCHEDULE_TYPES.find(t => t.value === type) || SCHEDULE_TYPES[0];
  const isClosed = (type) => type === 'closed';

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveSchedule(
      (msg) => {
        showToast(msg);
        closeModal();
      },
      (err) => showToast(err, 'error')
    );
  };

  const handleDeleteConfirm = async () => {
    await deleteSchedule(
      (msg) => {
        showToast(msg);
        closeDeleteConfirm();
      },
      (err) => showToast(err, 'error')
    );
  };

  const handleCreateAllHolidays = async () => {
    const year = filterMonth ? parseInt(filterMonth.split('-')[0]) : new Date().getFullYear();
    const { created, skipped } = await createAllHolidays(year);
    showToast(`✅ ${created} festivos creados${skipped > 0 ? `, ${skipped} omitidos (ya existían)` : ''}`);
    closeHolidayConfirm();
  };

  const handleApplyHoliday = (monthDay, name) => {
    const holidayData = getHolidayFormData(monthDay, name);
    Object.entries(holidayData).forEach(([field, value]) => {
      updateFormField(field, value);
    });
  };

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
            onClick={() => { resetForm(); openModal(); }}
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
            onChange={(e) => setFilterMonth(e.target.value)}
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
            onClick={openHolidayConfirm}
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
            🎉 Crear todos los festivos {filterMonth ? filterMonth.split('-')[0] : new Date().getFullYear()}
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
                              onClick={() => { setEditSchedule(sched); openModal(); }}
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
                              onClick={() => { setScheduleToDelete(sched.id); openDeleteConfirm(); }}
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
                  onClick={goToPrevPage}
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
                  onClick={goToNextPage}
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

        {/* Modal de confirmación para crear festivos */}
        {showHolidayConfirm && (
          <div className="modal-overlay" onClick={() => setShowHolidayConfirm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
              <div className="modal-header" style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 28
                }}>
                  🎉
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 20 }}>Crear festivos automáticamente</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>
                  Se crearán {getColombianHolidays(filterMonth ? parseInt(filterMonth.split('-')[0]) : new Date().getFullYear()).length} días festivos de Colombia para {filterMonth ? filterMonth.split('-')[0] : new Date().getFullYear()}
                </p>
              </div>
              
              <div className="modal-body" style={{ textAlign: 'center' }}>
                <p style={{ 
                  background: '#fef3c7', 
                  padding: 12, 
                  borderRadius: 8, 
                  fontSize: 13,
                  color: '#92400e',
                  margin: 0
                }}>
                  <strong>⚠️ Nota:</strong> Se marcarán como días <strong>cerrados</strong> y se configurarán para repetir cada año.
                </p>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'center', gap: 12 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowHolidayConfirm(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleCreateAllHolidays}
                  style={{ 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: 'none'
                  }}
                >
                  🎉 Crear {getColombianHolidays(filterMonth ? parseInt(filterMonth.split('-')[0]) : new Date().getFullYear()).length} festivos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación para eliminar */}
        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={closeDeleteConfirm}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
              <div className="modal-header" style={{ textAlign: 'center' }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 28
                }}>
                  <Trash2 size={32} color="white" />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 20 }}>¿Eliminar horario especial?</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>
                  Esta acción no se puede deshacer
                </p>
              </div>

              <div className="modal-body" style={{ textAlign: 'center' }}>
                <p style={{
                  background: '#fee2e2',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#991b1b',
                  margin: 0
                }}>
                  ⚠️ El horario especial será eliminado permanentemente
                </p>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'center', gap: 12 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeDeleteConfirm}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleDeleteConfirm}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: 'none'
                  }}
                >
                  <Trash2 size={16} style={{ marginRight: 6 }} />
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
              <div className="modal-header">
                <h3>{editingSchedule ? 'Editar Horario Especial' : 'Nuevo Horario Especial'}</h3>
                <button onClick={closeModal}><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit}>
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
                            handleApplyHoliday(monthDay, name);
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
                      onChange={(e) => updateFormField('specificDate', e.target.value)}
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
                      onChange={(e) => updateFormField('employeeId', e.target.value)}
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
                      onChange={(e) => updateFormField('type', e.target.value)}
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
                          onChange={(e) => updateFormField('startTime', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Hora fin *</label>
                        <input
                          type="time"
                          value={form.endTime}
                          onChange={(e) => updateFormField('endTime', e.target.value)}
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
                      onChange={(e) => updateFormField('description', e.target.value)}
                      placeholder="Ej: Festivo, Día especial, Horario de verano..."
                    />
                  </div>

                  {/* Recurrente anual */}
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={form.isRecurringYearly}
                      onChange={(e) => updateFormField('isRecurringYearly', e.target.checked)}
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
                    onClick={() => { closeModal(); resetForm(); }}
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
