import { useMemo } from 'react';

export function useClientStats(clients) {
  return useMemo(() => {
    const total = clients.length;
    const withMultipleVisits = clients.filter(c => c.totalAppointments > 1).length;
    const totalRevenue = clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const avgPerClient = total > 0 ? totalRevenue / total : 0;
    const completedAppointments = clients.reduce((sum, c) => sum + (c.completedAppointments || 0), 0);
    const cancelledAppointments = clients.reduce((sum, c) => sum + (c.cancelledAppointments || 0), 0);

    return {
      total,
      withMultipleVisits,
      totalRevenue,
      avgPerClient,
      completedAppointments,
      cancelledAppointments
    };
  }, [clients]);
}
