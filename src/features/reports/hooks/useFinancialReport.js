import { useEffect, useState } from 'react';
import api from '../../../api/client';

export function useFinancialReport({ business, range, showFullFinancial, period }) {
  const [financialReport, setFinancialReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enabledModules, setEnabledModules] = useState({
    expenses: false,
    inventory: false,
    deposits: false,
  });

  const loadFinancialReport = async () => {
    if (!business?.id || !range) return;

    setLoading(true);
    try {
      const year = range.start.getFullYear();
      const month = String(range.start.getMonth() + 1).padStart(2, '0');

      const res = await api.get('/financial-report', {
        params: {
          businessId: business.id,
          year,
          month,
        },
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
    if (showFullFinancial && period === 'month') {
      loadFinancialReport();
    }
  }, [showFullFinancial, period, business?.id, range?.start?.getTime()]);

  // Computed values for display
  const financialData = financialReport?.summary || {};
  const displayIncome = showFullFinancial ? financialData.totalIncome || 0 : 0;
  const displayExpenses = showFullFinancial ? financialData.totalExpenses || 0 : 0;
  const displayInventory = showFullFinancial ? financialData.inventoryCost || 0 : 0;
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
    displayExpenses,
    displayInventory,
    displayNetProfit,
    displayMargin,
    refresh: loadFinancialReport,
  };
}
