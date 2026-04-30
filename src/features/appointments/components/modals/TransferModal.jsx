/**
 * Modal para transferir cita a otro empleado
 * Extraído de Appointments.jsx
 */
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../../../api/client';

const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Bogota'
  });
};

export function TransferModal({
  isOpen,
  onClose,
  appointment,
  employees,
  business,
  onTransfer,
  isTransferring,
  colors
}) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [conflictError, setConflictError] = useState(null);

  // Cargar slots cuando cambia el empleado
  useEffect(() => {
    const loadSlots = async () => {
      if (!appointment || !selectedEmployeeId) {
        setAvailableSlots([]);
        return;
      }

      const dateStr = new Date(appointment.startTime).toISOString().split('T')[0];
      try {
        const allowPast = !business?.hasFieldTechnicians;
        const res = await api.get(`/appointments/availability?date=${dateStr}&employeeId=${selectedEmployeeId}&serviceId=${appointment.serviceId}&businessId=${business.id}&allowPast=${allowPast}`, { params: { noCache: true } });
        setAvailableSlots(res.data.availableSlots || []);
      } catch (e) {
        setAvailableSlots([]);
      }
    };

    loadSlots();
  }, [selectedEmployeeId, appointment, business]);

  const resetAndClose = () => {
    setSelectedEmployeeId('');
    setSelectedSlot('');
    setAvailableSlots([]);
    setConflictError(null);
    onClose();
  };

  const handleTransfer = async () => {
    const result = await onTransfer(appointment, selectedEmployeeId, selectedSlot);
    
    if (result?.requiresReschedule) {
      setConflictError({
        message: result.error,
        conflict: result.conflict
      });
    } else if (result?.success) {
      resetAndClose();
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: colors.cardBg, borderRadius: 12, padding: 24,
        maxWidth: 400, width: '90%', border: `1px solid ${colors.border}`
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: colors.text }}>🔄 Reasignar</h2>
          <button onClick={resetAndClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: colors.textSecondary }}>
            <X size={24} />
          </button>
        </div>

        {/* Info de la cita */}
        <div style={{ marginBottom: 16, padding: 12, background: colors.bgSecondary, borderRadius: 8 }}>
          <p style={{ margin: 0, fontSize: 13, color: colors.textSecondary }}>
            <strong style={{ color: colors.text }}>Servicio:</strong> {appointment.Service?.name}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: colors.textSecondary }}>
            <strong style={{ color: colors.text }}>Cliente:</strong> {appointment.clientName}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: colors.textSecondary }}>
            <strong style={{ color: colors.text }}>Hora:</strong> {formatTime(appointment.startTime)}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: colors.textSecondary }}>
            <strong style={{ color: colors.text }}>Empleado actual:</strong> {appointment.Employee?.User?.name}
          </p>
        </div>

        {/* Selector de empleado */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: colors.text }}>
            Transferir a:
          </label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => {
              setSelectedEmployeeId(e.target.value);
              setSelectedSlot('');
              setConflictError(null);
            }}
            style={{
              width: '100%', padding: 10, border: `1px solid ${colors.border}`,
              borderRadius: 6, fontSize: 14, background: colors.inputBg, color: colors.text
            }}
          >
            <option value="">Selecciona un empleado</option>
            {employees
              .filter(emp => emp.id !== appointment.employeeId)
              .map(emp => (
                <option key={emp.id} value={emp.id}>{emp.User?.name || emp.name}</option>
              ))
            }
          </select>
          <p style={{ margin: '8px 0 0 0', fontSize: 12, color: colors.textSecondary }}>
            Solo se muestran profesionales disponibles
          </p>
        </div>

        {/* Horarios disponibles */}
        {selectedEmployeeId && availableSlots.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: colors.text }}>
              {conflictError ? 'Selecciona un nuevo horario:' : 'Opcional: Cambiar horario'}
            </label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: 8, maxHeight: 150, overflowY: 'auto',
              border: `1px solid ${colors.border}`, borderRadius: 8, padding: 10
            }}>
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => setSelectedSlot(slot.time)}
                  style={{
                    padding: 8, border: `2px solid ${selectedSlot === slot.time ? '#6366f1' : colors.border}`,
                    borderRadius: 6, background: selectedSlot === slot.time ? '#6366f1' : colors.inputBg,
                    color: selectedSlot === slot.time ? 'white' : colors.text, cursor: 'pointer', fontSize: 12, fontWeight: 600
                  }}
                >
                  {slot.time}
                </button>
              ))}
            </div>
            {selectedSlot && (
              <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#10b981' }}>
                ✓ Nueva hora: {selectedSlot}
              </p>
            )}
          </div>
        )}

        {/* Error de conflicto */}
        {conflictError && (
          <div style={{
            marginBottom: 16, padding: 12, background: '#fef2f2',
            borderRadius: 8, border: '1px solid #ef4444'
          }}>
            <p style={{ margin: 0, fontSize: 13, color: '#dc2626' }}>
              <strong>⚠️ Conflicto:</strong> {conflictError.message}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#7f1d1d' }}>
              Selecciona un horario diferente arriba para transferir.
            </p>
          </div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={resetAndClose}
            style={{
              background: colors.bgTertiary, color: colors.text,
              border: `1px solid ${colors.border}`, borderRadius: 6,
              padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleTransfer}
            disabled={isTransferring || !selectedEmployeeId}
            style={{
              background: isTransferring || !selectedEmployeeId ? colors.bgTertiary : '#6366f1',
              color: isTransferring || !selectedEmployeeId ? colors.text : 'white',
              border: 'none', borderRadius: 6, padding: '10px 20px',
              fontSize: 14, fontWeight: 600, cursor: isTransferring || !selectedEmployeeId ? 'not-allowed' : 'pointer'
            }}
          >
            {isTransferring ? 'Transfiriendo...' : 'Transferir'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransferModal;
