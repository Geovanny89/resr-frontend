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
          border-radius: 24px; 
          border: 1px solid ${colors.border};
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0,0,0,0.08);
          margin-top: 20px;
        }
        
        /* Estilos para el selector de días tipo burbuja */
        .day-bubble-container {
          display: flex;
          overflow-x: auto;
          gap: 12px;
          padding: 16px 20px;
          background: ${colors.cardBg};
          scrollbar-width: none; /* Firefox */
        }
        .day-bubble-container::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        
        .day-bubble {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 70px;
          height: 80px;
          border-radius: 35px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: ${colors.bgSecondary};
          border: 1px solid ${colors.border};
        }
        
        .day-bubble.active {
          background: ${colors.primary};
          color: white;
          border-color: ${colors.primary};
          transform: translateY(-4px);
          box-shadow: 0 8px 15px ${colors.primary}40;
        }
        
        .day-bubble.today {
          border-color: ${colors.primary};
          border-width: 2px;
        }

        .day-name {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 4px;
          opacity: 0.8;
        }
        
        .day-number {
          font-size: 20px;
          font-weight: 800;
        }

        /* Selector de Profesionales (Avatares) */
        .professionals-scroll {
          display: flex;
          overflow-x: auto;
          gap: 20px;
          padding: 15px 20px;
          border-bottom: 1px solid ${colors.border};
          background: ${colors.cardBg};
          scrollbar-width: none;
        }
        
        .professional-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          min-width: 65px;
          transition: all 0.3s;
        }
        
        .pro-avatar-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          padding: 3px;
          border: 2px solid transparent;
          transition: all 0.3s;
        }
        
        .professional-item.active .pro-avatar-wrapper {
          border-color: ${colors.primary};
          transform: scale(1.1);
        }
        
        .pro-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          background: ${colors.bgSecondary};
        }
        
        .pro-initials {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${colors.primary}20;
          color: ${colors.primary};
          font-weight: 700;
          font-size: 20px;
        }
        
        .pro-name {
          font-size: 11px;
          font-weight: 600;
          color: ${colors.text};
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 70px;
        }

        .agenda-grid {
          display: grid;
          background: ${colors.cardBg};
          overflow: auto;
          max-height: 800px;
        }
        
        .agenda-grid.day-view {
          grid-template-columns: 75px 1fr;
        }
        
        .agenda-grid.week-view {
          grid-template-columns: 75px repeat(7, minmax(150px, 1fr));
        }
        
        .time-label-group {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          padding-right: 12px;
          height: 100px;
          justify-content: flex-start;
          padding-top: 0;
        }
        
        .time-main {
          font-size: 13px;
          font-weight: 700;
          color: ${colors.text};
        }
        
        .time-ampm {
          font-size: 10px;
          color: ${colors.textSecondary};
          text-transform: lowercase;
        }
        
        .time-sub {
          font-size: 10px;
          color: ${colors.textSecondary}80;
          margin-top: 8px;
        }

        .agenda-slot {
          height: 100px;
          border-bottom: 1px solid ${colors.border}40;
          position: relative;
        }

        .appointment-card-v5 {
          position: absolute;
          left: 4px;
          right: 8px;
          border-radius: 12px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          overflow: hidden;
          transition: all 0.2s;
          cursor: pointer;
          border-left: 4px solid transparent;
        }
        
        .appointment-card-v5:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 16px rgba(0,0,0,0.1);
          z-index: 10;
        }

        @media (max-width: 1024px) {
          .agenda-header { flex-direction: column; align-items: stretch; }
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
          onDayClick={switchToDayView}
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
