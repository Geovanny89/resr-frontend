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
          border-radius: 16px; 
          border: 1px solid ${colors.border};
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }
        .agenda-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: ${colors.cardBg};
          border-bottom: 1px solid ${colors.border};
          flex-wrap: wrap;
          gap: 16px;
        }
        .agenda-nav {
          display: flex;
          align-items: center;
          gap: 12px;
          background: ${colors.bgSecondary};
          padding: 4px;
          border-radius: 10px;
          border: 1px solid ${colors.border};
        }
        .agenda-nav-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: ${colors.text};
          cursor: pointer;
          transition: all 0.2s;
        }
        .agenda-nav-btn:hover {
          background: ${colors.cardBg};
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .agenda-week-label {
          font-weight: 700;
          font-size: 15px;
          min-width: 140px;
          text-align: center;
          color: ${colors.text};
        }
        .agenda-controls {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .agenda-grid {
          display: grid;
          grid-template-columns: 65px repeat(7, 1fr);
          overflow-x: auto;
          background: ${colors.cardBg};
        }
        .agenda-slot {
          height: 120px;
          border-bottom: 1px dashed ${colors.border};
          position: relative;
          transition: background 0.2s;
        }
        .agenda-slot::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          border-top: 1px dotted ${colors.border}60;
          pointer-events: none;
        }

        .agenda-slot:hover {
          background: ${colors.primary}05;
        }
        .agenda-day-column {
          border-right: 1px dashed ${colors.border};
          min-width: 150px;
        }

        .agenda-day-column:last-child {
          border-right: none;
        }
        @media (max-width: 1024px) {
          .agenda-header { flex-direction: column; align-items: stretch; }
          .agenda-nav { justify-content: space-between; }
        }
      `}</style>


      {/* Stats */}
      <AgendaStats 
        colors={colors} 
        appointments={filteredAppointments} 
        hasFieldTechnicians={business?.hasFieldTechnicians}
      />


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
