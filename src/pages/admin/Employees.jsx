import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AdminLayout from '../../components/AdminLayout';
import ResponsiveTable from '../../components/ResponsiveTable';

// Hooks
import { useEmployees } from '../../features/employees/hooks/useEmployees';
import { useEmployeeServices } from '../../features/employees/hooks/useEmployeeServices';

// Modal Components
import EmployeeModal from '../../features/employees/components/modals/EmployeeModal';
import DeleteEmployeeModal from '../../features/employees/components/modals/DeleteEmployeeModal';
import EmployeeServicesModal from '../../features/employees/components/modals/EmployeeServicesModal';

export default function Employees() {
  const { business } = useAuth();
  const { colors } = useTheme();

  // Empleados hook
  const {
    paginatedEmployees,
    loading,
    saving,
    error: employeesError,
    success: employeesSuccess,
    branches,
    subscriptionInfo,
    isTechnicalBusiness,
    currentPage,
    setCurrentPage,
    totalPages,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    uploadPhoto,
    clearMessages: clearEmployeeMessages
  } = useEmployees(business);

  // Servicios hook
  const {
    showModal: showServicesModal,
    selectedEmployee: servicesEmployee,
    availableServices,
    selectedServices,
    loading: loadingServices,
    saving: savingServices,
    error: servicesError,
    success: servicesSuccess,
    openModal: openServicesModal,
    closeModal: closeServicesModal,
    toggleService,
    saveServices,
    clearMessages: clearServicesMessages
  } = useEmployeeServices();

  // Estados locales para modales
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Detectar cambios en tamaño de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Abrir modal para crear
  const openCreateModal = () => {
    setSelectedEmployee(null);
    clearEmployeeMessages();
    setShowEmployeeModal(true);
  };

  // Abrir modal para editar
  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    clearEmployeeMessages();
    setShowEmployeeModal(true);
  };

  // Cerrar modal de empleado
  const closeEmployeeModal = () => {
    setShowEmployeeModal(false);
    setSelectedEmployee(null);
  };

  // Guardar empleado (crear o actualizar)
  const handleSaveEmployee = async (formData, employeeId) => {
    console.log('Employees.jsx - handleSaveEmployee llamado', { formData, employeeId });
    let result;
    if (employeeId) {
      result = await updateEmployee(employeeId, formData);
    } else {
      result = await createEmployee(formData);
    }
    console.log('Employees.jsx - resultado de create/update', result);
    
    if (result.success) {
      setTimeout(() => {
        closeEmployeeModal();
        clearEmployeeMessages();
      }, 1500);
    }
  };

  // Abrir modal de eliminación
  const openDeleteConfirmation = (emp) => {
    setSelectedEmployee(emp);
    setShowDeleteModal(true);
  };

  // Cerrar modal de eliminación
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedEmployee(null);
    setDeleting(false);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedEmployee) return;
    setDeleting(true);
    
    const result = await deleteEmployee(selectedEmployee.id);
    
    if (result.success) {
      setTimeout(() => {
        closeDeleteModal();
        clearEmployeeMessages();
      }, 1500);
    } else {
      setDeleting(false);
    }
  };

  // Abrir modal de servicios
  const handleOpenServices = async (emp) => {
    clearServicesMessages();
    await openServicesModal(emp, business?.slug, business?.id);
  };

  // Guardar servicios
  const handleSaveServices = async () => {
    const result = await saveServices(business?.id);
    if (result.success) {
      setTimeout(() => {
        closeServicesModal();
        clearServicesMessages();
      }, 2000);
    }
  };

  return (
    <AdminLayout title="Empleados" subtitle="Gestiona tu equipo de trabajo">
      <style>{`
        @media (max-width: 480px) {
          .employees-modal-close {
            min-width: 40px;
          }
          .employees-photo {
            width: 84px !important;
            height: 84px !important;
          }
        }
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Banner de información de suscripción */}
      {subscriptionInfo && (
        <SubscriptionBanner subscriptionInfo={subscriptionInfo} colors={colors} />
      )}

      {/* Botón nuevo empleado */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={openCreateModal}
          className="btn-primary"
          style={{
            width: isMobile ? '100%' : 'auto',
            opacity: subscriptionInfo?.availableUsers === 0 ? 0.5 : 1,
            cursor: subscriptionInfo?.availableUsers === 0 ? 'not-allowed' : 'pointer'
          }}
          disabled={subscriptionInfo?.availableUsers === 0}
        >
          ➕ Nuevo empleado
        </button>
        {subscriptionInfo?.availableUsers === 0 && (
          <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>
            Has usado todos tus empleados permitidos ({subscriptionInfo?.currentEmployees} de {subscriptionInfo?.totalUsersAllowed}).
            El admin no cuenta. Contacta al administrador para agregar más cupos.
          </div>
        )}
      </div>

      {/* Tabla de empleados */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: 16 }}>
          <div>
            <div className="card-title">👥 Empleados registrados</div>
            <div className="card-subtitle">
              {paginatedEmployees.length} empleado{paginatedEmployees.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <ResponsiveTable
          columns={[
            {
              key: 'name',
              label: 'Nombre',
              render: (v, row) => row.User?.name || '—'
            },
            {
              key: 'email',
              label: 'Email',
              render: (v, row) => row.User?.email || '—'
            },
            {
              key: 'commissionPct',
              label: 'Comisión',
              render: v => `${v}%`
            }
          ]}
          data={paginatedEmployees}
          actions={[
            { label: '💼 Servicios', onClick: handleOpenServices, color: 'var(--info)' },
            { label: '✏️ Editar', onClick: openEditModal, color: 'var(--primary)' },
            { label: '🗑️ Eliminar', onClick: openDeleteConfirmation, color: 'var(--danger)' }
          ]}
          fullWidthActions={false}
          loading={loading}
          emptyMessage="No hay empleados. ¡Crea uno para empezar!"
        />

        {/* Paginación */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modal de Empleado (Crear/Editar) */}
      <EmployeeModal
        isOpen={showEmployeeModal}
        onClose={closeEmployeeModal}
        employee={selectedEmployee}
        business={business}
        branches={branches}
        isTechnicalBusiness={isTechnicalBusiness}
        subscriptionInfo={subscriptionInfo}
        onSave={handleSaveEmployee}
        onUploadPhoto={uploadPhoto}
        error={employeesError}
        success={employeesSuccess}
        saving={saving}
      />

      {/* Modal de Eliminación */}
      <DeleteEmployeeModal
        isOpen={showDeleteModal}
        employee={selectedEmployee}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        deleting={deleting}
      />

      {/* Modal de Servicios */}
      <EmployeeServicesModal
        isOpen={showServicesModal}
        employee={servicesEmployee}
        availableServices={availableServices}
        selectedServices={selectedServices}
        loading={loadingServices}
        saving={savingServices}
        error={servicesError}
        success={servicesSuccess}
        onClose={closeServicesModal}
        onToggleService={toggleService}
        onSave={handleSaveServices}
      />
    </AdminLayout>
  );
}

// Componente interno: Banner de suscripción
function SubscriptionBanner({ subscriptionInfo, colors }) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        color: 'white',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>
          Plan {subscriptionInfo.planName}
        </div>
        <div style={{ fontSize: '24px', fontWeight: 700 }}>
          {subscriptionInfo.currentEmployees} de {subscriptionInfo.totalUsersAllowed} empleados
        </div>
        <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>
          {subscriptionInfo.includedUsers} incluidos + {subscriptionInfo.additionalUsers} adicionales (el admin no cuenta)
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            {subscriptionInfo.availableUsers > 0 ? 'Cupos disponibles' : 'Sin cupos'}
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: subscriptionInfo.availableUsers > 0 ? '#10b981' : '#ef4444'
            }}
          >
            {subscriptionInfo.availableUsers}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente interno: Paginación
function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginTop: 20,
        padding: '16px',
        borderTop: '1px solid var(--border)'
      }}
    >
      <button
        onClick={() => onPageChange(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="btn-outline btn-sm"
        style={{ padding: '6px 12px' }}
      >
        Anterior
      </button>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={() => onPageChange(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="btn-outline btn-sm"
        style={{ padding: '6px 12px' }}
      >
        Siguiente
      </button>
    </div>
  );
}
