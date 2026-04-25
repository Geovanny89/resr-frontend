// Feature module: Booking
// Re-exports all components, hooks and utilities

// Components
export { default as CalendarPicker } from './components/CalendarPicker';
export { default as ConfirmationScreen } from './components/ConfirmationScreen';
export { default as ServiceStep } from './components/ServiceStep';
export { default as EmployeeStep } from './components/EmployeeStep';
export { default as DateStep } from './components/DateStep';
export { default as TimeSlotStep } from './components/TimeSlotStep';
export { default as ClientDataStep } from './components/ClientDataStep';
export { default as DepositStep } from './components/DepositStep';

// Hooks
export { useBooking } from './hooks/useBooking';

// Utils
export { formatDateES, formatSlotTime, todayColombia } from './utils/dateHelpers';
