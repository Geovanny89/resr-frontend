/**
 * Hook for managing special schedules
 * Extracted from SpecialSchedule.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';
import { DEFAULT_SCHEDULE_FORM } from '../constants';

export function useSpecialSchedules(businessId) {
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_SCHEDULE_FORM);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);

  const load = useCallback(async (skipCache = false) => {
    if (!businessId) return;
    setLoading(true);
    try {
      const [empRes, schedRes] = await Promise.all([
        api.get(`/employees?businessId=${businessId}&onlyProfessionals=true`, skipCache ? { params: { noCache: true } } : {}),
        api.get(`/special-schedules/business/${businessId}`, skipCache ? { params: { noCache: true } } : {}),
      ]);
      setEmployees(empRes.data || []);
      setSchedules(schedRes.data || []);
    } catch (e) {
      console.error('[useSpecialSchedules] Error al cargar:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      load();
    }
  }, [businessId, load]);

  const resetForm = useCallback(() => {
    setForm(DEFAULT_SCHEDULE_FORM);
    setEditingSchedule(null);
  }, []);

  const setEditSchedule = useCallback((sched) => {
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
  }, []);

  const updateFormField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const saveSchedule = useCallback(async (onSuccess, onError) => {
    if (!businessId) return;
    setSaving(true);
    try {
      const data = {
        ...form,
        businessId,
        employeeId: form.employeeId || null,
      };

      if (editingSchedule) {
        const res = await api.put(`/special-schedules/${editingSchedule.id}`, data);
        // Actualizar estado local inmediatamente
        setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? res.data : s));
      } else {
        const res = await api.post('/special-schedules', data);
        // Agregar al estado local inmediatamente
        setSchedules(prev => [...prev, res.data]);
      }
      await load(true);
      resetForm();
      onSuccess?.(editingSchedule ? 'Horario especial actualizado' : 'Horario especial creado');
    } catch (e) {
      onError?.(e.response?.data?.error || 'Error al guardar horario especial');
    } finally {
      setSaving(false);
    }
  }, [businessId, form, editingSchedule, load, resetForm]);

  const deleteSchedule = useCallback(async (onSuccess, onError) => {
    if (!scheduleToDelete) return;
    try {
      await api.delete(`/special-schedules/${scheduleToDelete}`);
      // Actualizar estado local inmediatamente
      setSchedules(prev => prev.filter(s => s.id !== scheduleToDelete));
      await load(true);
      onSuccess?.('Horario especial eliminado');
    } catch (e) {
      onError?.(e.response?.data?.error || 'Error al eliminar');
    }
  }, [scheduleToDelete, load]);

  const getEmployeeName = useCallback((employeeId) => {
    if (!employeeId) return '🏢 Todos los empleados';
    const emp = employees.find(e => e.id === employeeId);
    return emp ? `👤 ${emp.User?.name || 'Empleado'}` : '👤 Empleado';
  }, [employees]);

  return {
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
  };
}

export default useSpecialSchedules;
