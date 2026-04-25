import { useEffect, useState, useMemo } from 'react';
import api from '../../../api/client';
import { getDateRange, calculateStats, groupByStatus, groupByEmployee, groupByService } from '../utils/reportHelpers';

export function useReportsData({ business, mainBusiness, period, customStart, customEnd, selectedBranchId, showFullFinancial }) {
  const [appointments, setAppointments] = useState([]);
  const [previousPeriodAppointments, setPreviousPeriodAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailPage, setDetailPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const range = useMemo(() => getDateRange(period, customStart, customEnd), [period, customStart, customEnd]);
  
  // Calcular rango del período anterior para comparación
  const previousRange = useMemo(() => {
    if (!range || !range.start || !range.end) return null;
    
    const start = new Date(range.start);
    const end = new Date(range.end);
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - diffDays);
    
    return { start: prevStart, end: prevEnd };
  }, [range]);

  const loadData = async (skipCache = false) => {
    if (!business?.id || !range) return;
    setLoading(true);
    setError('');
    try {
      let url = `/appointments?businessId=${business.id}`;

      if (selectedBranchId === 'all') {
        url = `/appointments/consolidated`;
      } else if (selectedBranchId === 'main') {
        url = `/appointments?businessId=${mainBusiness.id}`;
      } else if (selectedBranchId !== 'active') {
        url = `/appointments?businessId=${selectedBranchId}`;
      }

      const res = await api.get(url, skipCache ? { params: { noCache: true } } : {});
      const all = res.data;

      // Filtrar período actual
      const filtered = all.filter((a) => {
        const d = new Date(a.startTime);
        return d >= range.start && d <= range.end;
      });
      setAppointments(filtered);

      // Filtrar período anterior para comparación
      if (previousRange) {
        const previousFiltered = all.filter((a) => {
          const d = new Date(a.startTime);
          return d >= previousRange.start && d <= previousRange.end;
        });
        setPreviousPeriodAppointments(previousFiltered);
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (business?.id && range && range.start && range.end) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, customStart, customEnd, selectedBranchId, business?.id]);

  // Reset pagination when appointments change
  useEffect(() => {
    setDetailPage(1);
  }, [appointments.length]);

  // Statistics
  const stats = useMemo(() => calculateStats(appointments, business), [appointments, business]);
  
  // Statistics del período anterior
  const previousStats = useMemo(() => calculateStats(previousPeriodAppointments, business), [previousPeriodAppointments, business]);
  
  // Calcular variación vs período anterior
  const comparison = useMemo(() => {
    if (!previousStats || previousPeriodAppointments.length === 0) {
      return null;
    }
    
    const calculateVariation = (current, previous) => {
      if (!previous || previous === 0) return null;
      return ((current - previous) / previous) * 100;
    };
    
    return {
      total: {
        current: appointments.length,
        previous: previousPeriodAppointments.length,
        variation: calculateVariation(appointments.length, previousPeriodAppointments.length)
      },
      completed: {
        current: stats.done.length,
        previous: previousStats.done.length,
        variation: calculateVariation(stats.done.length, previousStats.done.length)
      },
      revenue: {
        current: stats.totalRevenue || 0,
        previous: previousStats.totalRevenue || 0,
        variation: calculateVariation(stats.totalRevenue || 0, previousStats.totalRevenue || 0)
      },
      completionRate: {
        current: appointments.length > 0 ? (stats.done.length / appointments.length) * 100 : 0,
        previous: previousPeriodAppointments.length > 0 ? (previousStats.done.length / previousPeriodAppointments.length) * 100 : 0,
        variation: calculateVariation(
          appointments.length > 0 ? (stats.done.length / appointments.length) * 100 : 0,
          previousPeriodAppointments.length > 0 ? (previousStats.done.length / previousPeriodAppointments.length) * 100 : 0
        )
      }
    };
  }, [appointments, previousPeriodAppointments, stats, previousStats]);

  // Chart data
  const byStatus = useMemo(() => groupByStatus(appointments), [appointments]);
  
  // MODIFICADO: Pasar todas las citas (appointments) en lugar de solo las completadas (stats.done)
  // para poder calcular correctamente las métricas de totales vs completadas
  const byEmployee = useMemo(
    () => groupByEmployee(appointments, business?.isTechnicalServices || business?.hasFieldTechnicians),
    [appointments, business]
  );
  
  const byService = useMemo(
    () => groupByService(stats.done, business?.isTechnicalServices || business?.hasFieldTechnicians),
    [stats.done, business]
  );

  // Pagination
  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = appointments.slice(
    (detailPage - 1) * ITEMS_PER_PAGE,
    detailPage * ITEMS_PER_PAGE
  );

  return {
    appointments,
    previousPeriodAppointments,
    loading,
    error,
    range,
    previousRange,
    stats,
    previousStats,
    comparison,
    byStatus,
    byEmployee,
    byService,
    detailPage,
    setDetailPage,
    totalPages,
    paginatedAppointments,
    ITEMS_PER_PAGE,
    refresh: loadData,
  };
}
