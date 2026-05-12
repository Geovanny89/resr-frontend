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
      // Asegurarnos de que los cálculos del negocio sean los reales (Total - Comisión)
      const data = res.data;
      if (data.appointments) {
        data.appointments = data.appointments.map(appt => {
          const price = parseFloat(appt.price);
          const empEarns = parseFloat(appt.employeeEarns);
          // Forzar el cálculo real en el frontend por si el backend aún no se ha actualizado
          const ownerEarns = price - empEarns;
          return { ...appt, ownerEarns: ownerEarns.toFixed(2) };
        });
        
        // Recalcular totales
        const total = data.appointments.reduce((acc, a) => acc + parseFloat(a.price), 0);
        const employeeTotal = data.appointments.reduce((acc, a) => acc + parseFloat(a.employeeEarns), 0);
        const ownerTotal = total - employeeTotal;
        
        data.totals = {
          total,
          employeeTotal,
          ownerTotal
        };
      }
      setReport(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  }, [businessId, month, startDate, endDate]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Agrupar por empleado
  const byEmployee = useMemo(() => {
    return report?.appointments?.reduce((acc, appt) => {
      const name = appt.employee;
      if (!acc[name]) acc[name] = { name, appointments: [], total: 0, employeeEarns: 0, ownerEarns: 0 };
      acc[name].appointments.push(appt);
      acc[name].total += appt.price;
      acc[name].employeeEarns += parseFloat(appt.employeeEarns);
      acc[name].ownerEarns += parseFloat(appt.ownerEarns);
      return acc;
    }, {}) || {};
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
