/**
 * Hook for managing special schedules UI state
 * Extracted from SpecialSchedule.jsx
 */
import { useState, useMemo, useCallback } from 'react';
import { ITEMS_PER_PAGE } from '../constants';

export function useSpecialSchedulesUI(schedules) {
  const [showModal, setShowModal] = useState(false);
  const [showHolidayConfirm, setShowHolidayConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Agrupar horarios por fecha
  const groupedSchedules = useMemo(() => {
    return schedules.reduce((acc, sched) => {
      const key = sched.specificDate;
      if (!acc[key]) acc[key] = [];
      acc[key].push(sched);
      return acc;
    }, {});
  }, [schedules]);

  // Ordenar fechas
  const sortedDates = useMemo(() => {
    return Object.keys(groupedSchedules).sort();
  }, [groupedSchedules]);

  // Filtrar por mes
  const filteredDates = useMemo(() => {
    return filterMonth
      ? sortedDates.filter(date => date.startsWith(filterMonth))
      : sortedDates;
  }, [sortedDates, filterMonth]);

  // Paginación
  const totalPages = useMemo(() => {
    return Math.ceil(filteredDates.length / ITEMS_PER_PAGE);
  }, [filteredDates]);

  const paginatedDates = useMemo(() => {
    return filteredDates.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredDates, currentPage]);

  const setFilterMonthAndReset = useCallback((value) => {
    setFilterMonth(value);
    setCurrentPage(1);
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage(p => Math.min(totalPages, p + 1));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage(p => Math.max(1, p - 1));
  }, []);

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);
  const openHolidayConfirm = useCallback(() => setShowHolidayConfirm(true), []);
  const closeHolidayConfirm = useCallback(() => setShowHolidayConfirm(false), []);
  const openDeleteConfirm = useCallback(() => setShowDeleteConfirm(true), []);
  const closeDeleteConfirm = useCallback(() => setShowDeleteConfirm(false), []);

  return {
    // Modal states
    showModal,
    showHolidayConfirm,
    showDeleteConfirm,
    // Filter state
    filterMonth,
    // Pagination state
    currentPage,
    totalPages,
    // Grouped data
    groupedSchedules,
    paginatedDates,
    filteredDates,
    sortedDates,
    // Actions
    openModal,
    closeModal,
    openHolidayConfirm,
    closeHolidayConfirm,
    closeDeleteConfirm,
    openDeleteConfirm,
    setFilterMonth: setFilterMonthAndReset,
    goToNextPage,
    goToPrevPage,
    setCurrentPage,
  };
}

export default useSpecialSchedulesUI;
