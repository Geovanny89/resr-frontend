import { useEffect, useState } from 'react';
import api from '../../../api/client';

// Helper para formatear fecha a YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useFinancialReport({ business, range, showFullFinancial, period, employeeId }) {
  const [financialReport, setFinancialReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enabledModules, setEnabledModules] = useState({
    expenses: false,
    inventory: false,
    deposits: false,
    cashRegister: false,
  });

  const loadFinancialReport = async () => {
    if (!business?.id || !range) return;

    setLoading(true);
    try {
      const params = {
        businessId: business.id,
        employeeId: employeeId !== 'all' ? employeeId : undefined
      };

      // Para períodos day y week, usar startDate/endDate
      // Para month, mantener compatibilidad con year/month
      if (period === 'month') {
        params.year = range.start.getFullYear();
        params.month = String(range.start.getMonth() + 1).padStart(2, '0');
      } else {
        params.startDate = formatDate(range.start);
        params.endDate = formatDate(range.end);
      }

      const res = await api.get('/financial-report', {
        params,
      });

      setFinancialReport(res.data);
      setEnabledModules(res.data.enabledModules || {});
    } catch (e) {
      console.error('Error cargando informe financiero:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showFullFinancial && (period === 'month' || period === 'day' || period === 'week')) {
      loadFinancialReport();
    }
  }, [showFullFinancial, period, business?.id, range?.start?.getTime(), range?.end?.getTime(), employeeId]);

  // Computed values for display
  const financialData = financialReport?.summary || {};
  const displayIncome = showFullFinancial ? financialData.totalIncome || 0 : 0;
  const cashIncome = showFullFinancial ? financialData.cashIncome || 0 : 0;
  const transferIncome = showFullFinancial ? financialData.transferIncome || 0 : 0;
  const displayExpenses = showFullFinancial ? financialData.totalExpenses || 0 : 0;
  const displayInventory = showFullFinancial ? financialData.inventoryCost || 0 : 0;
  const displayCommissions = showFullFinancial ? financialData.totalCommissions || 0 : 0;
  const displayNetProfit = showFullFinancial ? financialData.netProfit || 0 : 0;
  const displayMargin = showFullFinancial
    ? financialData.margin || 0
    : 0;

  return {
    financialReport,
    loading,
    enabledModules,
    financialData,
    displayIncome,
    cashIncome,
    transferIncome,
    displayExpenses,
    displayInventory,
    displayCommissions,
    displayNetProfit,
    displayMargin,
    refresh: loadFinancialReport,
  };
}
