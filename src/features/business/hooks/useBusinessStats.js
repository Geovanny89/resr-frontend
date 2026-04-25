/**
 * Hook para obtener estadísticas del negocio
 * Extraído del Dashboard.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';

export function useBusinessStats(businessId) {
  const [stats, setStats] = useState({ 
    total: 0, 
    pending: 0, 
    confirmed: 0, 
    done: 0, 
    cancelled: 0 
  });
  const [upcoming, setUpcoming] = useState([]);
  const [finance, setFinance] = useState({ 
    totalRevenue: 0, 
    ownerRevenue: 0, 
    employeeRevenue: 0,
    cashRevenue: 0,
    transferRevenue: 0
  });
  const [employeeRatings, setEmployeeRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemNotification, setSystemNotification] = useState(null);

  const loadStats = useCallback(async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      const month = new Date().toISOString().slice(0, 7);
      
      const [apptRes, reportRes, systemNotifRes, employeesRes] = await Promise.all([
        api.get(`/appointments?businessId=${businessId}`),
        api.get(`/employees/commission-report?businessId=${businessId}&month=${month}`).catch(() => ({ data: null })),
        api.get('/system-settings/global-notification').catch(() => ({ data: { message: null } })),
        api.get(`/employees?businessId=${businessId}`).catch(() => ({ data: [] }))
      ]);

      setSystemNotification(systemNotifRes.data?.message);
      setEmployeeRatings(employeesRes.data || []);

      const allAppointments = apptRes.data;
      
      // Calcular estadísticas
      setStats({
        total: allAppointments.length,
        pending: allAppointments.filter(a => a.status === 'pending').length,
        confirmed: allAppointments.filter(a => a.status === 'confirmed').length,
        done: allAppointments.filter(a => a.status === 'done').length,
        cancelled: allAppointments.filter(a => a.status === 'cancelled').length
      });

      // Próximas citas
      const now = new Date();
      setUpcoming(
        allAppointments
          .filter(a => new Date(a.startTime) >= now && ['pending', 'confirmed'].includes(a.status))
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
          .slice(0, 6)
      );

      // Finanzas
      if (reportRes.data?.totals) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const doneThisMonth = allAppointments.filter(
          a => a.status === 'done' && a.startTime.startsWith(currentMonth)
        );

        const cash = doneThisMonth
          .filter(a => a.paymentMethod === 'cash')
          .reduce((s, a) => s + parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0), 0);

        const transfer = doneThisMonth
          .filter(a => a.paymentMethod === 'transfer')
          .reduce((s, a) => s + parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0), 0);

        setFinance({
          totalRevenue: reportRes.data.totals.total,
          ownerRevenue: reportRes.data.totals.ownerTotal,
          employeeRevenue: reportRes.data.totals.employeeTotal,
          cashRevenue: cash,
          transferRevenue: transfer
        });
      }
    } catch (e) {
      console.error('[useBusinessStats] Error loading stats:', e);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refresh = useCallback(() => {
    return loadStats();
  }, [loadStats]);

  return {
    stats,
    upcoming,
    finance,
    employeeRatings,
    loading,
    systemNotification,
    refresh
  };
}

export default useBusinessStats;
