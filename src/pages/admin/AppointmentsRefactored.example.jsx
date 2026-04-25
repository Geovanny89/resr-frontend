/**
 * EJEMPLO: Appointments refactorizado usando los nuevos componentes
 * Este archivo es solo demostrativo - muestra cómo se vería Appointments.jsx
 * usando la nueva arquitectura feature-based.
 * 
 * Para usar: copiar código relevante a Appointments.jsx gradualmente
 * 
 * Beneficios de esta refactorización:
 * - De ~3,300 líneas a ~400 líneas
 * - Cada componente tiene una sola responsabilidad
 * - Reutilizable en otras partes de la app
 * - Más fácil de testear
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import { useSocket } from '../../hooks/useSocket';
import { Plus, Edit, Trash2, CheckCircle2, Repeat, Clock } from 'lucide-react';

// NUEVO: Componentes extraídos de features/appointments
import {
  StatusBadge,
  AppointmentFilters,
  AppointmentList,
  CompleteAppointmentModal
} from '../../features/appointments/components';

// NUEVO: Hooks de features
import { useAppointments } from '../../features/appointments/hooks';
import { useStatusMessage } from '../../shared/hooks';

// NUEVO: Utilidades compartidas
import { fmt } from '../../shared/utils/formatters';

export default function AppointmentsRefactored() {
  const { business, user } = useAuth();
  const { colors } = useTheme();
  const { showStatus, showSuccess, showError, statusMsg } = useStatusMessage();
  
  // NUEVO: Hook de appointments para fetching y mutaciones
  const {
    appointments,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedAppointments,
    selectedDate,
    setSelectedDate,
    selectedEmployeeId,
    setSelectedEmployeeId,
    refresh,
    changeStatus
  } = useAppointments(business?.id);

  // State UI específico
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isCompleting, setIsCompleting] = useState(false);

  // Cargar servicios y empleados
  useEffect(() => {
    if (!business?.id) return;
    
    const loadData = async () => {
      try {
        const [servicesRes, employeesRes] = await Promise.all([
          api.get(`/services?businessId=${business.id}`),
          api.get(`/employees?businessId=${business.id}`)
        ]);
        setServices(servicesRes.data);
        setEmployees(employeesRes.data);
      } catch (e) {
        console.error('Error loading data:', e);
      }
    };
    
    loadData();
  }, [business?.id]);

  // Responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Socket.io para actualizaciones en tiempo real
  useSocket({
    onAppointmentCreated: (apt) => {
      showInfo(`📅 Nueva cita: ${apt.clientName}`);
      refresh();
    },
    onAppointmentUpdated: () => refresh()
  });

  // Handlers
  const handleCompleteClick = (appointment) => {
    setSelectedAppointment(appointment);
    setPaymentMethod('cash');
    setShowCompleteModal(true);
  };

  const handleCompleteConfirm = async (method) => {
    if (!selectedAppointment) return;
    
    setIsCompleting(true);
    try {
      const result = await changeStatus(selectedAppointment.id, 'done', { paymentMethod: method });
      
      if (result.success) {
        showSuccess('Cita completada exitosamente');
        setShowCompleteModal(false);
        setSelectedAppointment(null);
      } else {
        showError(result.error || 'Error al completar cita');
      }
    } catch (e) {
      showError(e.response?.data?.error || 'Error al completar cita');
    } finally {
      setIsCompleting(false);
    }
  };

  // Renderizar acciones por cita
  const renderAppointmentActions = (apt) => {
    const isDone = apt.status === 'done';
    const isCancelled = apt.status === 'cancelled';
    
    return (
      <div style={{ display: 'flex', gap: 6, justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
        {!isDone && !isCancelled && (
          <button
            onClick={() => handleCompleteClick(apt)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: '#10b981',
              color: 'white',
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            <CheckCircle2 size={14} />
          </button>
        )}
        
        <button
          onClick={() => {/* handle edit */}}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: `1px solid ${colors.border}`,
            background: colors.cardBg,
            cursor: 'pointer'
          }}
        >
          <Edit size={14} />
        </button>
        
        {!isDone && (
          <button
            onClick={() => {/* handle cancel */}}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: '#ef4444',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    );
  };

  return (
    <AdminLayout title="Gestión de Citas">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
            📅 Gestión de Citas
          </h2>
          <p style={{ margin: '4px 0 0 0', color: colors.textSecondary }}>
            Administra las citas del día
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: colors.primary,
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={18} />
          Nueva Cita
        </button>
      </div>

      {/* Grid principal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '280px 1fr',
        gap: 24
      }}>
        {/* Sidebar: Filtros - NUEVO COMPONENTE */}
        <AppointmentFilters
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          selectedEmployeeId={selectedEmployeeId}
          onEmployeeChange={setSelectedEmployeeId}
          employees={employees}
          colors={colors}
          isMobile={isMobile}
        />

        {/* Main: Lista de citas - NUEVO COMPONENTE */}
        <div className="card" style={{ padding: 24 }}>
          <AppointmentList
            appointments={paginatedAppointments}
            loading={loading}
            isMobile={isMobile}
            colors={colors}
            business={business}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={() => setCurrentPage(p => Math.max(1, p - 1))}
            onNextPage={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            renderActions={renderAppointmentActions}
            emptyMessage="No hay citas para esta fecha"
          />
        </div>
      </div>

      {/* Modales - NUEVOS COMPONENTES */}
      {showCreateModal && (
        <CreateAppointmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          services={services}
          employees={employees}
          business={business}
          onSuccess={() => {
            refresh();
            showSuccess('Cita creada exitosamente');
          }}
        />
      )}

      {/* NUEVO: Componente de modal extraído */}
      <CompleteAppointmentModal
        isOpen={showCompleteModal}
        appointment={selectedAppointment}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        onComplete={handleCompleteConfirm}
        onCancel={() => {
          setShowCompleteModal(false);
          setSelectedAppointment(null);
        }}
        isCompleting={isCompleting}
        colors={colors}
      />

      {/* Toast - del hook useStatusMessage */}
      {statusMsg && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          padding: '12px 20px',
          borderRadius: 10,
          fontWeight: 600,
          background: statusMsg.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: statusMsg.type === 'error' ? '#991b1b' : '#065f46',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
        }}>
          {statusMsg.text}
        </div>
      )}
    </AdminLayout>
  );
}

// Placeholder - este se crearía en FASE 6
function CreateAppointmentModal({ isOpen, onClose, services, employees, business, onSuccess }) {
  if (!isOpen) return null;
  // ... implementación
  return null;
}
