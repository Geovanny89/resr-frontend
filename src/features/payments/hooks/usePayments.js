/**
 * Payments Feature - usePayments Hook
 * Maneja la lógica de datos y estado para reportes de pagos
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../api/client';
import { getCurrentColombiaMonth } from '../utils';

export function usePayments(businessId) {
  const [month, setMonth] = useState(getCurrentColombiaMonth);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sendingEmail, setSendingEmail] = useState({});
  const [emailResult, setEmailResult] = useState({});

  const loadReport = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError('');
    try {
      let url = `/employees/commission-report?businessId=${businessId}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      } else {
        url += `&month=${month}`;
      }
      
      const res = await api.get(url);
      const data = res.data;

      // ====================
      // USAR appointmentsByEmployee si existe (backend actualizado con split correcto)
      // sino, fallback a appointments por compatibilidad
      // ====================
      const byEmpItems = Array.isArray(data.appointmentsByEmployee) && data.appointmentsByEmployee.length > 0
        ? data.appointmentsByEmployee
        : data.appointments || [];

      // Normalizar appointmentsByEmployee para asegurar consistencia
      const normalizedItems = byEmpItems.map(item => {
        const price = parseFloat(item.price) || 0;
        const empEarns = parseFloat(item.employeeEarns) || 0;
        let ownerEarns = parseFloat(item.ownerEarns);
        if (isNaN(ownerEarns)) ownerEarns = Math.max(0, price - empEarns);
        return {
          ...item,
          ownerEarns: ownerEarns.toFixed(2),
        };
      });

      // Calcular totales GLOBALES (tomar del backend si están, sino recalcular de items con isPrincipal=true)
      const total = (data.totals && data.totals.total !== undefined)
        ? parseFloat(data.totals.total)
        : normalizedItems.filter(a => a.isPrincipal !== false).reduce((acc, a) => acc + (parseFloat(a.price) || 0), 0);

      const employeeTotal = (data.totals && data.totals.employeeTotal !== undefined)
        ? parseFloat(data.totals.employeeTotal)
        : normalizedItems.reduce((acc, a) => acc + (parseFloat(a.employeeEarns) || 0), 0);

      const ownerTotal = (data.totals && data.totals.ownerTotal !== undefined)
        ? parseFloat(data.totals.ownerTotal)
        : normalizedItems.filter(a => a.isPrincipal !== false).reduce((acc, a) => acc + (parseFloat(a.ownerEarns) || 0), 0);

      // Guardar data actualizada
      setReport({
        ...data,
        appointments: data.appointments, // original por cita (si se necesita en tablas)
        appointmentsByEmployee: normalizedItems,
        totals: {
          total: parseFloat(total.toFixed(2)),
          employeeTotal: parseFloat(employeeTotal.toFixed(2)),
          ownerTotal: parseFloat(ownerTotal.toFixed(2)),
        },
      });
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  }, [businessId, month, startDate, endDate]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // ====================
  // Agrupar POR EMPLEADO usando appointmentsByEmployee (cada profesional con sus servicios)
  // ====================
  const byEmployee = useMemo(() => {
    const items = report?.appointmentsByEmployee || [];
    const acc = {};

    items.forEach(item => {
      const name = item.employee || 'Sin asignar';
      if (!acc[name]) {
        acc[name] = {
          name,
          appointments: [], // split-items donde participó este empleado
          appointmentDetails: [], // citas originales donde este empleado participó
          total: 0,
          employeeEarns: 0,
          ownerEarns: 0,
          countAppointments: new Set(),
        };
      }
      acc[name].appointments.push(item);
      if (item.appointmentId) acc[name].countAppointments.add(item.appointmentId);
      // Sumamos SU share (employeeShare) para "total facturado por este empleado"
      // Si no existe employeeShare, usamos price (compatibilidad vieja)
      const empTotal = item.employeeShare !== undefined && item.employeeShare !== null
        ? parseFloat(item.employeeShare) || 0
        : parseFloat(item.price) || 0;
      acc[name].total += empTotal;
      acc[name].employeeEarns += parseFloat(item.employeeEarns) || 0;
      // Ahora ownerEarns está distribuido proporcionalmente en cada split
      // (no está todo en el principal), así que sumamos el de cada item
      acc[name].ownerEarns += parseFloat(item.ownerEarns) || 0;
    });

    // Convertir Set a count
    Object.keys(acc).forEach(name => {
      acc[name].countAppointments = acc[name].countAppointments.size;
    });

    return acc;
  }, [report]);

  const employees = useMemo(() => Object.values(byEmployee), [byEmployee]);

  const sendPaymentEmail = useCallback(async (employeeName, generateEmployeePDFFn) => {
    setSendingEmail(p => ({ ...p, [employeeName]: true }));
    try {
      const empData = byEmployee[employeeName];
      
      // Generar PDF individual del empleado
      const pdfBase64 = await generateEmployeePDFFn(empData, month);
      
      console.log('PDF Base64 length:', pdfBase64?.length);
      console.log('PDF Base64 starts with:', pdfBase64?.substring(0, 50));

      const response = await api.post('/notifications/payment-summary', {
        businessId,
        employeeName,
        month,
        totalEarned: empData.employeeEarns,
        appointmentsCount: empData.appointments.length,
        pdfBase64,
      });
      
      // Manejar diferentes estados de respuesta
      if (response.data.simulated) {
        setEmailResult(p => ({ ...p, [employeeName]: 'simulated' }));
      } else if (response.data.partial) {
        setEmailResult(p => ({ ...p, [employeeName]: 'partial' }));
      } else {
        setEmailResult(p => ({ ...p, [employeeName]: 'sent' }));
      }
      setTimeout(() => setEmailResult(p => ({ ...p, [employeeName]: null })), 5000);
    } catch (e) {
      const errorMsg = e.response?.data?.error || 'Error al enviar el email';
      setEmailResult(p => ({ ...p, [employeeName]: `error: ${errorMsg}` }));
      setTimeout(() => setEmailResult(p => ({ ...p, [employeeName]: null })), 4000);
    } finally {
      setSendingEmail(p => ({ ...p, [employeeName]: false }));
    }
  }, [byEmployee, businessId, month]);

  return {
    month,
    setMonth,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    report,
    loading,
    error,
    sendingEmail,
    emailResult,
    employees,
    byEmployee,
    loadReport,
    sendPaymentEmail,
  };
}
