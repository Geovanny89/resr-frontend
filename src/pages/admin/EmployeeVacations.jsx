import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import { Plus, Trash2, Calendar, Edit2, X, Info, Palmtree, Users } from 'lucide-react';

export default function EmployeeVacations() {
  const { business } = useAuth();
  const { colors } = useTheme();
  
  const [employees, setEmployees] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vacationToDelete, setVacationToDelete] = useState(null);
  const [editingVacation, setEditingVacation] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [form, setForm] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async (skipCache = false) => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const [empRes, vacRes] = await Promise.all([
        api.get(`/employees?businessId=${business.id}`, skipCache ? { params: { noCache: true } } : {}),
        api.get(`/employee-vacations/business/${business.id}`, skipCache ? { params: { noCache: true } } : {})
      ]);
      setEmployees(empRes.data || []);
      setVacations(vacRes.data || []);
    } catch (e) {
      console.error('[EmployeeVacations] Error al cargar:', e);
      showToast('Error al cargar datos: ' + (e.response?.data?.error || e.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [business]);

  const resetForm = () => {
    setForm({
      employeeId: '',
      startDate: '',
      endDate: '',
      description: ''
    });
    setEditingVacation(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        businessId: business.id
      };

      if (editingVacation) {
        await api.put(`/employee-vacations/${editingVacation.id}`, data);
        showToast('Vacaciones actualizadas correctamente');
      } else {
        await api.post('/employee-vacations', data);
        showToast('Vacaciones registradas correctamente');
      }
      
      await load(true);
      resetForm();
      setShowModal(false);
    } catch (e) {
      showToast(e.response?.data?.error || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    setVacationToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!vacationToDelete) return;
    try {
      await api.delete(`/employee-vacations/${vacationToDelete}`);
      await load(true);
      showToast('Período de vacaciones eliminado');
    } catch (e) {
      showToast(e.response?.data?.error || 'Error al eliminar', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setVacationToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setVacationToDelete(null);
  };

  const startEdit = (vacation) => {
    setEditingVacation(vacation);
    setForm({
      employeeId: vacation.employeeId,
      startDate: vacation.startDate,
      endDate: vacation.endDate,
      description: vacation.description || ''
    });
    setShowModal(true);
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp ? emp.User?.name || 'Empleado' : 'Desconocido';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00-05:00');
    return date.toLocaleDateString('es-CO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Bogota'
    });
  };

  const getVacationDuration = (start, end) => {
    const startDate = new Date(start + 'T00:00:00-05:00');
    const endDate = new Date(end + 'T00:00:00-05:00');
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Ordenar vacaciones por fecha de inicio (más recientes primero)
  const sortedVacations = [...vacations].sort((a, b) => 
    new Date(b.startDate) - new Date(a.startDate)
  );

  return (
    <AdminLayout>
      <div style={{ padding: 24 }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 24, 
          flexWrap: 'wrap', 
          gap: 12 
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Palmtree size={28} color="#10b981" />
              Vacaciones de Empleados
            </h1>
            <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
              Gestiona los períodos de vacaciones. Los empleados en vacaciones no aparecerán disponibles en la agenda.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => { resetForm(); setShowModal(true); }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={18} /> Registrar Vacaciones
          </button>
        </div>

        {/* Info alert */}
        <div style={{ 
          background: colors.bgAccent || 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid #10b981', 
          borderRadius: 8, 
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          fontSize: 14,
          color: colors.text
        }}>
          <Info size={20} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>¿Cómo funcionan las vacaciones?</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
              <li>Define un rango de fechas (inicio y fin) para cada empleado</li>
              <li>Durante este período, el empleado no aparecerá en la agenda para nuevas citas</li>
              <li>No afecta los horarios regulares del empleado</li>
              <li>Citas existentes programadas antes no se ven afectadas</li>
            </ul>
          </div>
        </div>

        {/* Lista de vacaciones */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Cargando...</div>
        ) : sortedVacations.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 60, 
            color: 'var(--text-muted)',
            background: 'var(--bg-secondary)',
            borderRadius: 12,
            border: '2px dashed var(--border-color)'
          }}>
            <Palmtree size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p style={{ fontSize: 16, marginBottom: 8 }}>No hay vacaciones registradas</p>
            <p style={{ fontSize: 14, opacity: 0.7 }}>
              Usa el botón "Registrar Vacaciones" para crear un nuevo período
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sortedVacations.map(vacation => {
              const duration = getVacationDuration(vacation.startDate, vacation.endDate);
              const isPast = new Date(vacation.endDate + 'T23:59:59') < new Date();
              
              return (
                <div 
                  key={vacation.id}
                  style={{ 
                    border: `2px solid ${isPast ? 'var(--border-color)' : '#10b981'}`, 
                    borderRadius: 12, 
                    padding: 16,
                    background: isPast ? 'var(--bg-secondary)' : 'rgba(16, 185, 129, 0.15)',
                    opacity: isPast ? 0.7 : 1
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: isPast ? '#9ca3af' : '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0
                      }}>
                        <Users size={22} />
                      </div>
                      <div>
                        <div style={{ 
                          fontWeight: 700, 
                          fontSize: 16, 
                          color: 'var(--text)',
                          marginBottom: 4
                        }}>
                          {getEmployeeName(vacation.employeeId)}
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 8,
                          color: isPast ? 'var(--text-muted)' : '#10b981',
                          fontSize: 14,
                          fontWeight: 500
                        }}>
                          <Calendar size={16} />
                          {formatDate(vacation.startDate)} 
                          <span style={{ opacity: 0.5 }}>→</span>
                          {formatDate(vacation.endDate)}
                        </div>
                        <div style={{ 
                          marginTop: 8,
                          display: 'flex',
                          gap: 12,
                          alignItems: 'center'
                        }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 20,
                            background: isPast ? 'var(--bg-tertiary)' : 'rgba(16, 185, 129, 0.25)',
                            color: isPast ? 'var(--text-muted)' : '#10b981',
                            fontSize: 12,
                            fontWeight: 600
                          }}>
                            {duration} día{duration !== 1 ? 's' : ''}
                          </span>
                          {isPast && (
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: 20,
                              background: 'var(--bg-tertiary)',
                              color: 'var(--text-muted)',
                              fontSize: 12,
                              fontWeight: 600
                            }}>
                              Finalizado
                            </span>
                          )}
                        </div>
                        {vacation.description && (
                          <div style={{ 
                            marginTop: 8,
                            fontSize: 13,
                            color: 'var(--text-muted)',
                            fontStyle: 'italic'
                          }}>
                            "{vacation.description}"
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => startEdit(vacation)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 6,
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Editar"
                      >
                        <Edit2 size={16} color="#3b82f6" />
                      </button>
                      <button
                        onClick={() => handleDelete(vacation.id)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 6,
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Eliminar"
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de confirmación para eliminar */}
        {showDeleteConfirm && (
          <div 
            className="modal-overlay" 
            onClick={cancelDelete}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 16
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{ 
                background: colors.cardBg, 
                borderRadius: 16, 
                padding: 28,
                maxWidth: 400,
                width: '100%',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Trash2 size={28} color="white" />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 20, color: colors.text }}>
                ¿Eliminar período de vacaciones?
              </h3>
              <p style={{ margin: '0 0 20px', color: colors.textSecondary, fontSize: 14 }}>
                Esta acción no se puede deshacer
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  onClick={cancelDelete}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    background: 'none',
                    color: colors.text,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#ef4444',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Trash2 size={16} />
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div 
            className="modal-overlay" 
            onClick={() => setShowModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 16
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{ 
                background: colors.cardBg, 
                borderRadius: 16, 
                padding: 24,
                maxWidth: 500,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 20
              }}>
                <h3 style={{ margin: 0, fontSize: 20, color: colors.text }}>
                  {editingVacation ? 'Editar Vacaciones' : 'Registrar Vacaciones'}
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    padding: 4
                  }}
                >
                  <X size={24} color={colors.textSecondary} />
                </button>
              </div>

              <form onSubmit={handleCreate}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Selector de Empleado */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 6, 
                      fontWeight: 600, 
                      fontSize: 14,
                      color: colors.text
                    }}>
                      <Users size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      Empleado *
                    </label>
                    <select
                      value={form.employeeId}
                      onChange={(e) => setForm({...form, employeeId: e.target.value})}
                      required
                      disabled={editingVacation}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: `1px solid ${colors.border}`,
                        background: editingVacation ? '#f3f4f6' : colors.inputBg,
                        color: colors.text,
                        fontSize: 14
                      }}
                    >
                      <option value="">Seleccionar empleado</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.User?.name || 'Empleado'}
                        </option>
                      ))}
                    </select>
                    {editingVacation && (
                      <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                        No se puede cambiar el empleado al editar
                      </p>
                    )}
                  </div>

                  {/* Fechas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 6, 
                        fontWeight: 600, 
                        fontSize: 14,
                        color: colors.text
                      }}>
                        <Calendar size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                        Fecha Inicio *
                      </label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm({...form, startDate: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          borderRadius: 6,
                          border: `1px solid ${colors.border}`,
                          background: colors.inputBg,
                          color: colors.text,
                          fontSize: 13
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 6, 
                        fontWeight: 600, 
                        fontSize: 14,
                        color: colors.text
                      }}>
                        <Calendar size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                        Fecha Fin *
                      </label>
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => setForm({...form, endDate: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          borderRadius: 6,
                          border: `1px solid ${colors.border}`,
                          background: colors.inputBg,
                          color: colors.text,
                          fontSize: 13
                        }}
                      />
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 6, 
                      fontWeight: 600, 
                      fontSize: 14,
                      color: colors.text
                    }}>
                      Descripción (opcional)
                    </label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({...form, description: e.target.value})}
                      placeholder="Ej: Vacaciones de verano"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: `1px solid ${colors.border}`,
                        background: colors.inputBg,
                        color: colors.text,
                        fontSize: 14
                      }}
                    />
                  </div>
                </div>

                {/* Botones */}
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 10,
                      border: `1px solid ${colors.border}`,
                      background: 'none',
                      color: colors.text,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 10,
                      border: 'none',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      fontWeight: 700,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1
                    }}
                  >
                    {saving ? 'Guardando...' : (editingVacation ? 'Actualizar' : 'Guardar')}
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
            background: toast.type === 'error' ? '#ef4444' : '#10b981',
            color: 'white',
            fontWeight: 500,
            zIndex: 2000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {toast.msg}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
