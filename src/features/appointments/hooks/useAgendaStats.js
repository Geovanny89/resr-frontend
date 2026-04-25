/**
 * Hook para calcular estadísticas de agenda
 * Extraído de Agenda.jsx
 */
import { useMemo } from 'react';

export function useAgendaStats(appointments) {
  return useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    done: appointments.filter(a => a.status === 'done').length,
    onTheWay: appointments.filter(a => a.technicianStatus === 'on_the_way').length,
    arrived: appointments.filter(a => a.technicianStatus === 'arrived').length,
  }), [appointments]);
}

export default useAgendaStats;
