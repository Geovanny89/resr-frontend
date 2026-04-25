import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AdminLayout from '../../components/AdminLayout';
import { useAgenda } from '../../features/appointments/hooks/useAgenda';
import { HOURS } from '../../features/appointments/utils/calendar';
import {
  AgendaHeader,
  AgendaStats,
  WeekView,
  DayView,
  AppointmentDetailModal,
} from '../../features/appointments/components/calendar';

export default function Agenda() {
  const { business, user } = useAuth();
  const { colors } = useTheme();

  const {
    weekDates,
    viewMode,
    selectedDate,
    prevWeek,
    nextWeek,
    goToToday,
    switchToWeekView,
    switchToDayView,
    loading,
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    filteredAppointments,
    getAppointmentsForDay,
    getAppointmentsForHour,
    selectedAppointment,
    showDetailModal,
    openDetail,
    closeDetail,
    isConnected,
  } = useAgenda({
    businessId: business?.id,
    userId: user?.id,
  });

  return (
    <AdminLayout title="Agenda" subtitle="Vista calendario de citas">
      {/* Estilos CSS */}
      <style>{`
        .agenda-container { 
          background: ${colors.cardBg}; 
          border-radius: 12px; 
          border: 1px solid ${colors.border};
          overflow: visible;
        }
        .agenda-grid {
          display: grid;
          grid-template-columns: 60px repeat(7, 1fr);
          overflow-x: auto;
        }
        .agenda-slot {
          height: 140px;
          border-bottom: 1px solid ${colors.border}30;
          position: relative;
        }
        @media (max-width: 768px) {
          .agenda-grid {
            grid-template-columns: 50px repeat(7, minmax(100px, 1fr));
          }
        }
      `}</style>

      {/* Stats */}
      <AgendaStats colors={colors} appointments={filteredAppointments} />

      <div className="agenda-container">
        {/* Header */}
        <AgendaHeader
          colors={colors}
          weekDates={weekDates}
          viewMode={viewMode}
          selectedDate={selectedDate}
          employees={employees}
          selectedEmployeeId={selectedEmployeeId}
          onEmployeeChange={setSelectedEmployeeId}
          onPrevWeek={prevWeek}
          onNextWeek={nextWeek}
          onSwitchToWeekView={switchToWeekView}
          onGoToToday={goToToday}
        />

        {/* Calendar Grid */}
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div className="spinner" />
          </div>
        ) : viewMode === 'day' ? (
          <DayView
            colors={colors}
            selectedDate={selectedDate}
            HOURS={HOURS}
            getAppointmentsForDay={getAppointmentsForDay}
            getAppointmentsForHour={getAppointmentsForHour}
            onAppointmentClick={openDetail}
          />
        ) : (
          <WeekView
            colors={colors}
            weekDates={weekDates}
            HOURS={HOURS}
            getAppointmentsForDay={getAppointmentsForDay}
            getAppointmentsForHour={getAppointmentsForHour}
            onDayClick={switchToDayView}
            onAppointmentClick={openDetail}
          />
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <AppointmentDetailModal
          colors={colors}
          appointment={selectedAppointment}
          hasFieldTechnicians={business?.hasFieldTechnicians}
          onClose={closeDetail}
        />
      )}
    </AdminLayout>
  );
}
