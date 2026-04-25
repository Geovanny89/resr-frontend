/**
 * Hook for managing Colombian holidays creation
 * Extracted from SpecialSchedule.jsx
 */
import { useCallback } from 'react';
import api from '../../../api/client';
import { getColombianHolidays } from '../utils/holidays';

export function useHolidays(businessId, schedules, loadSchedules) {
  /**
   * Crea todos los festivos de Colombia para un año específico
   * @param {number} year - Año para crear festivos (opcional, usa año actual si no se proporciona)
   * @returns {Promise<{created: number, skipped: number}>}
   */
  const createAllHolidays = useCallback(async (year) => {
    const targetYear = year || new Date().getFullYear();
    const yearHolidays = getColombianHolidays(targetYear);

    let created = 0;
    let skipped = 0;

    // Verificar cuáles ya existen
    const existingDates = new Set(schedules.map(s => s.specificDate));

    for (const holiday of yearHolidays) {
      const fullDate = `${targetYear}-${holiday.date}`;

      // Si ya existe un horario para esta fecha, saltar
      if (existingDates.has(fullDate)) {
        skipped++;
        continue;
      }

      try {
        await api.post('/special-schedules', {
          businessId,
          employeeId: null, // Aplica a todos
          specificDate: fullDate,
          startTime: '00:00',
          endTime: '23:59',
          type: 'closed',
          description: holiday.name,
          isRecurringYearly: true,
        });
        created++;
      } catch (e) {
        console.error(`Error creando festivo ${holiday.name}:`, e);
      }
    }

    await loadSchedules(true);
    return { created, skipped };
  }, [businessId, schedules, loadSchedules]);

  /**
   * Prepara el formulario para aplicar un festivo específico
   * @param {string} monthDay - Fecha en formato MM-DD
   * @param {string} name - Nombre del festivo
   * @returns {Object} Datos del formulario para el festivo
   */
  const getHolidayFormData = useCallback((monthDay, name, year) => {
    const targetYear = year || new Date().getFullYear();
    return {
      specificDate: `${targetYear}-${monthDay}`,
      description: name,
      type: 'closed',
      isRecurringYearly: true,
    };
  }, []);

  return {
    createAllHolidays,
    getHolidayFormData,
    getColombianHolidays,
  };
}

export default useHolidays;
