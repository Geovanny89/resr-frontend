// Barrel exports de todos los componentes de appointments
export { StatusBadge, getStatusConfig, isActiveStatus, isFinalStatus } from './common';
export { AppointmentFilters } from './filters';
export { AppointmentList, AppointmentsGrid } from './list';
export { 
  CompleteAppointmentModal, 
  ExpressAppointmentModal,
  CreateAppointmentModal,
  EditAppointmentModal,
  TransferModal,
  ExtendTimeModal,
  NotesModal,
  CancelModal,
  AdditionalChargeModal,
  SendReceiptModal,
  InsumosModal
} from './modals';
