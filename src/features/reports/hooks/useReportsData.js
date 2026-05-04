import { useEffect, useState, useMemo } from 'react';
import api from '../../../api/client';
import { getDateRange, calculateStats, groupByStatus, groupByEmployee, groupByService } from '../utils/reportHelpers';

export function useReportsData({ business, mainBusiness, period, customStart, customEnd, selectedBranchId, showFullFinancial, employeeFilter }) {
  const [appointments, setAppointments] = useState([]);
  const [previousPeriodAppointments, setPreviousPeriodAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailPage, setDetailPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Filtrar citas según el empleado seleccionado
  const filteredAppointments = useMemo(() => {
    if (!employeeFilter || employeeFilter === 'all') return appointments;
    return appointments.filter(a => a.employeeId === employeeFilter);
  }, [appointments, employeeFilter]);

  const filteredPreviousAppointments = useMemo(() => {
    if (!employeeFilter || employeeFilter === 'all') return previousPeriodAppointments;
    return previousPeriodAppointments.filter(a => a.employeeId === employeeFilter);
  }, [previousPeriodAppointments, employeeFilter]);

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
      const params = {
        businessId: business.id,
      };

      const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      if (range?.start && range?.end) {
        params.startDate = formatDate(range.start);
        params.endDate = formatDate(range.end);
      }

      if (employeeFilter && employeeFilter !== 'all') {
        params.employeeId = employeeFilter;
      }

      let url = `/appointments`;
      
      if (selectedBranchId === 'all') {
        url = `/appointments/consolidated`;
      } else if (selectedBranchId === 'main') {
        params.businessId = mainBusiness.id;
      } else if (selectedBranchId !== 'active') {
        params.businessId = selectedBranchId;
      }

      const res = await api.get(url, { 
        params: skipCache ? { ...params, noCache: true } : params 
      });
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
  const stats = useMemo(() => calculateStats(filteredAppointments, business), [filteredAppointments, business]);
  
  // Statistics del período anterior
  const previousStats = useMemo(() => calculateStats(filteredPreviousAppointments, business), [filteredPreviousAppointments, business]);
  
  // Calcular variación vs período anterior
  const comparison = useMemo(() => {
    if (!previousStats || filteredPreviousAppointments.length === 0) {
      return null;
    }
    
    const calculateVariation = (current, previous) => {
      if (!previous || previous === 0) return null;
      return ((current - previous) / previous) * 100;
    };
    
    return {
      total: {
        current: filteredAppointments.length,
        previous: filteredPreviousAppointments.length,
        variation: calculateVariation(filteredAppointments.length, filteredPreviousAppointments.length)
      },
      completed: {
        current: stats.done.length,
        previous: previousStats.done.length,
        variation: calculateVariation(stats.done.length, previousStats.done.length)
      },
      revenue: {
        current: stats.totalRev || 0,
        previous: previousStats.totalRev || 0,
        variation: calculateVariation(stats.totalRev || 0, previousStats.totalRev || 0)
      },
      completionRate: {
        current: filteredAppointments.length > 0 ? (stats.done.length / filteredAppointments.length) * 100 : 0,
        previous: filteredPreviousAppointments.length > 0 ? (previousStats.done.length / filteredPreviousAppointments.length) * 100 : 0,
        variation: calculateVariation(
          filteredAppointments.length > 0 ? (stats.done.length / filteredAppointments.length) * 100 : 0,
          filteredPreviousAppointments.length > 0 ? (previousStats.done.length / filteredPreviousAppointments.length) * 100 : 0
        )
      }
    };
  }, [filteredAppointments, filteredPreviousAppointments, stats, previousStats]);

  // Chart data
  const byStatus = useMemo(() => groupByStatus(filteredAppointments), [filteredAppointments]);
  
  // MODIFICADO: Pasar todas las citas filtradas (filteredAppointments)
  const byEmployee = useMemo(
    () => groupByEmployee(filteredAppointments, business?.isTechnicalServices || business?.hasFieldTechnicians),
    [filteredAppointments, business]
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
