import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
import { DollarSign, Plus, TrendingUp, Calendar, FileText, Pencil, X, Lock, Unlock, History, Download } from 'lucide-react';

export default function CashRegister() {
  const { business } = useAuth();
  const { colors } = useTheme();
  const [activeShift, setActiveShift] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyShifts, setHistoryShifts] = useState([]);
  const [selectedShiftHistory, setSelectedShiftHistory] = useState(null);
  const [historyMovements, setHistoryMovements] = useState([]);
  const [showCorrectModal, setShowCorrectModal] = useState(false);
  const [editingMovement, setEditingMovement] = useState(null);
  const [selectedMovements, setSelectedMovements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [openForm, setOpenForm] = useState({
    openingAmount: '0',
    notes: ''
  });
  const [closeForm, setCloseForm] = useState({
    closingAmount: '0',
    notes: ''
  });
  const [movementForm, setMovementForm] = useState({
    type: 'income',
    amount: '',
    paymentMethod: 'cash',
    description: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  // Toast notification state
  const [statusMsg, setStatusMsg] = useState(null);
  const showStatus = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  useEffect(() => {
    if (business?.id) {
      loadActiveShift();
    }
  }, [business]);

  const loadActiveShift = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cash-register/active', {
        params: { businessId: business.id }
      });
      setActiveShift(res.data.activeShift);
      if (res.data.activeShift) {
        await loadMovements(res.data.activeShift.id);
      } else {
        setMovements([]);
      }
    } catch (e) {
      console.error('Error cargando turno activo:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async (shiftId) => {
    try {
      const res = await api.get(`/cash-register/shifts/${shiftId}/movements`);
      setMovements(res.data.movements || []);
      setCurrentPage(1); // Resetear a primera página
    } catch (e) {
      console.error('Error cargando movimientos:', e);
    }
  };

  const loadShiftHistory = async () => {
    try {
      const res = await api.get('/cash-register/shifts/history', {
        params: { businessId: business.id }
      });
      setHistoryShifts(res.data.shifts || []);
    } catch (e) {
      console.error('Error cargando historial:', e);
    }
  };

  const loadHistoryMovements = async (shiftId) => {
    try {
      const res = await api.get(`/cash-register/shifts/${shiftId}/movements`);
      setHistoryMovements(res.data.movements || []);
      setSelectedShiftHistory(historyShifts.find(s => s.id === shiftId));
    } catch (e) {
      console.error('Error cargando movimientos del historial:', e);
    }
  };

  const downloadHistoryExcel = async () => {
    try {
      const res = await api.get('/cash-register/export/excel', {
        params: { businessId: business.id },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `historial-caja-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      showStatus('Error al descargar Excel', 'error');
    }
  };

  const downloadShiftExcel = async (shiftId) => {
    try {
      const shiftDate = selectedShiftHistory?.openedAt ? new Date(selectedShiftHistory.openedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      
      const res = await api.get('/cash-register/export/excel', {
        params: { 
          businessId: business.id,
          startDate: shiftDate,
          endDate: shiftDate,
          shiftId: shiftId
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `caja-turno-${shiftDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      showStatus('Error al descargar Excel', 'error');
    }
  };

  const handleOpenShift = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/cash-register/shift/open', {
        businessId: business.id,
        openingAmount: parseFloat(openForm.openingAmount) || 0,
        notes: openForm.notes
      });
      closeModal();
      await loadActiveShift();
      showStatus('Turno de caja abierto exitosamente');
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al abrir turno', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseShift = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/cash-register/shift/close', {
        shiftId: activeShift.id,
        closingAmount: parseFloat(closeForm.closingAmount),
        notes: closeForm.notes
      });
      closeModal();
      setActiveShift(null);
      setMovements([]);
      showStatus('Turno de caja cerrado exitosamente');
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al cerrar turno', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMovement = async (e) => {
    e.preventDefault();
    if (!movementForm.amount || !movementForm.description) return;
    
    setSaving(true);
    try {
      const res = await api.post('/cash-register/movements', {
        businessId: business.id,
        shiftId: activeShift.id,
        ...movementForm,
        amount: parseFloat(movementForm.amount)
      });
      closeModal();
      // Actualizar estado con datos actualizados del backend
      setActiveShift(res.data.shift);
      setMovements(res.data.movements || []);
      showStatus('Movimiento registrado exitosamente');
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al crear movimiento', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMovement = async (movementId) => {
    try {
      await api.delete(`/cash-register/movements/${movementId}`);
      // Actualizar estado inmediatamente
      setMovements(prev => prev.filter(m => m.id !== movementId));
      setSelectedMovements(prev => prev.filter(id => id !== movementId));
      // Recargar turno para actualizar totales
      await loadActiveShift();
      showStatus('Movimiento eliminado');
    } catch (e) {
      showStatus('Error al eliminar movimiento', 'error');
    }
  };

  const handleCorrectMovement = (movement) => {
    // Solo permitir corregir movimientos manuales (sin appointmentId ni expenseId)
    if (movement.appointmentId || movement.expenseId) {
      showStatus('No se pueden corregir movimientos asociados a citas o gastos', 'error');
      return;
    }
    setEditingMovement(movement);
    setMovementForm({
      correctAmount: movement.amount.toString(),
      reason: '',
      type: movement.type,
      paymentMethod: movement.paymentMethod,
      description: movement.description
    });
    setShowCorrectModal(true);
  };

  const handleSubmitCorrection = async (e) => {
    e.preventDefault();
    if (!movementForm.correctAmount || parseFloat(movementForm.correctAmount) < 0) {
      showStatus('Ingrese un monto válido (0 para anular)', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const res = await api.post(`/cash-register/movements/${editingMovement.id}/correct`, {
        correctAmount: parseFloat(movementForm.correctAmount),
        reason: movementForm.reason || 'Corrección de movimiento',
        type: movementForm.type,
        paymentMethod: movementForm.paymentMethod,
        description: movementForm.description
      });
      // Primero recargar datos, luego cerrar modal
      await loadActiveShift();
      closeModal();
      showStatus(`Corrección realizada. Diferencia: $${res.data.difference.toLocaleString('es-CO')}`);
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al corregir movimiento', 'error');
    } finally {
      setSaving(false);
      setEditingMovement(null);
    }
  };

  const handleSelectMovement = (movementId) => {
    setSelectedMovements(prev =>
      prev.includes(movementId)
        ? prev.filter(id => id !== movementId)
        : [...prev, movementId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMovements.length === movements.length) {
      setSelectedMovements([]);
    } else {
      setSelectedMovements(movements.map(m => m.id));
    }
  };

  const closeModal = () => {
    setShowOpenModal(false);
    setShowCloseModal(false);
    setShowMovementModal(false);
    setShowHistoryModal(false);
    setShowCorrectModal(false);
    setEditingMovement(null);
    setOpenForm({ openingAmount: '0', notes: '' });
    setCloseForm({ closingAmount: '0', notes: '' });
    setMovementForm({ type: 'income', amount: '', paymentMethod: 'cash', description: '', notes: '', correctAmount: '', reason: '' });
  };

  const totalSelected = movements
    .filter(m => selectedMovements.includes(m.id))
    .reduce((sum, m) => sum + parseFloat(m.amount), 0);

  return (
    <AdminLayout title="Caja" subtitle="Control de turnos y movimientos de caja">
      {/* Resumen de turno activo */}
      {activeShift ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 16,
          marginBottom: 24 
        }}>
          <div style={{
            background: colors.cardBg,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 2px 8px ${colors.shadow}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ 
                width: 40, height: 40, borderRadius: 10, 
                background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <TrendingUp size={20} color="#3b82f6" />
              </div>
              <span style={{ fontSize: 14, color: colors.textSecondary }}>Monto Actual</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6' }}>
              ${activeShift.currentAmount?.toLocaleString('es-CO') || '0'}
            </div>
          </div>

          <div style={{
            background: colors.cardBg,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 2px 8px ${colors.shadow}`
          }}>
            <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
              Ingresos
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>
              ${activeShift.totalIncome?.toLocaleString('es-CO') || '0'}
            </div>
          </div>

          <div style={{
            background: colors.cardBg,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 2px 8px ${colors.shadow}`
          }}>
            <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
              Gastos/Retiros
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>
              ${((activeShift.totalExpenses || 0) + (activeShift.totalWithdrawals || 0)).toLocaleString('es-CO')}
            </div>
          </div>

          <div style={{
            background: colors.cardBg,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 2px 8px ${colors.shadow}`
          }}>
            <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
              Movimientos
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.text }}>
              {activeShift.movementsCount || 0}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: '#fef3c7',
          padding: 20,
          borderRadius: 12,
          marginBottom: 24,
          border: '1px solid #fbbf24'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Lock size={24} color="#d97706" />
            <div>
              <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
                No hay turno de caja activo
              </div>
              <div style={{ fontSize: 14, color: '#b45309' }}>
                Abre un turno para comenzar a registrar movimientos
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 12,
        marginBottom: 20
      }}>
        {/* Fila de botones principales */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: 8
        }}>
          <button
            onClick={() => {
              setShowHistoryModal(true);
              loadShiftHistory();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '12px 8px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 13,
              whiteSpace: 'nowrap'
            }}
          >
            <History size={16} />
            Historial
          </button>
          
          {!activeShift ? (
            <button
              onClick={() => setShowOpenModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '12px 8px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 13,
                whiteSpace: 'nowrap'
              }}
            >
              <Unlock size={16} />
              Abrir Turno
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowMovementModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '12px 8px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 13,
                  whiteSpace: 'nowrap'
                }}
              >
                <Plus size={16} />
                Nuevo Mov.
              </button>
              <button
                onClick={() => setShowCloseModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '12px 8px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 13,
                  whiteSpace: 'nowrap'
                }}
              >
                <Lock size={16} />
                Cerrar
              </button>
            </>
          )}
        </div>
      </div>  

      {selectedMovements.length > 0 && (
        <div style={{
          background: '#dbeafe',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          color: '#1e40af'
        }}>
          {selectedMovements.length} seleccionados - Total: ${totalSelected.toLocaleString('es-CO')}
        </div>
      )}

      {/* Tabla de movimientos */}
      {activeShift && (
        <ResponsiveTable
          columns={[
            {
              key: 'checkbox',
              label: 'Sel.',
              render: (_, row) => (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedMovements.includes(row.id)}
                    onChange={() => handleSelectMovement(row.id)}
                    title="Seleccionar para cálculo de total"
                    style={{
                      cursor: 'pointer',
                      width: 18,
                      height: 18,
                      accentColor: '#3b82f6'
                    }}
                  />
                </div>
              ),
              width: '50px'
            },
            {
              key: 'createdAt',
              label: 'Hora',
              render: (v) => new Date(v).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
            },
            {
              key: 'type',
              label: 'Tipo',
              render: (v) => {
                const colors = {
                  income: '#10b981',
                  expense: '#ef4444',
                  withdrawal: '#f59e0b'
                };
                const labels = {
                  income: 'Ingreso',
                  expense: 'Gasto',
                  withdrawal: 'Retiro'
                };
                return (
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: 20, 
                    background: colors[v] + '20',
                    color: colors[v],
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {labels[v]}
                  </span>
                );
              }
            },
            { key: 'description', label: 'Descripción' },
            {
              key: 'amount',
              label: 'Monto',
              render: (v, row) => (
                <span style={{ 
                  fontWeight: 700, 
                  color: row.type === 'income' ? '#10b981' : '#ef4444'
                }}>
                  {row.type === 'income' ? '+' : '-'}${parseFloat(v).toLocaleString('es-CO')}
                </span>
              )
            },
            {
              key: 'paymentMethod',
              label: 'Método',
              render: (v) => {
                const methods = {
                  cash: '💵 Efectivo',
                  card: '💳 Tarjeta',
                  transfer: '📲 Transferencia',
                  nequi: '📱 Nequi',
                  daviplata: '📱 DaviPlata'
                };
                return methods[v] || v;
              }
            },
            {
              key: 'actions',
              label: 'Acciones',
              render: (_, row) => (
                <>
                  {!row.appointmentId && !row.expenseId && !row.isReversal && !row.Reversal && (
                    <button
                      onClick={() => handleCorrectMovement(row)}
                      style={{
                        padding: '6px 10px',
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title="Corregir (crea reversa)"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </>
              )
            }
          ]}
          data={movements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
          loading={loading}
          emptyMessage="No hay movimientos en este turno"
          headerActions={
            <input
              type="checkbox"
              checked={selectedMovements.length === movements.length && movements.length > 0}
              onChange={handleSelectAll}
              style={{ cursor: 'pointer' }}
            />
          }
        />
      )}

      {/* Paginación */}
      {activeShift && movements.length > itemsPerPage && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          marginTop: 16,
          padding: '8px 16px',
          background: colors.cardBg,
          borderRadius: 8
        }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '6px 12px',
              background: currentPage === 1 ? '#e5e7eb' : '#3b82f6',
              color: currentPage === 1 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: 6,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600
            }}
          >
            ← Anterior
          </button>
          
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.text,
            padding: '0 12px'
          }}>
            Página {currentPage} de {Math.ceil(movements.length / itemsPerPage)}
          </span>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(movements.length / itemsPerPage), p + 1))}
            disabled={currentPage >= Math.ceil(movements.length / itemsPerPage)}
            style={{
              padding: '6px 12px',
              background: currentPage >= Math.ceil(movements.length / itemsPerPage) ? '#e5e7eb' : '#3b82f6',
              color: currentPage >= Math.ceil(movements.length / itemsPerPage) ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: 6,
              cursor: currentPage >= Math.ceil(movements.length / itemsPerPage) ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600
            }}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal abrir turno */}
      {showOpenModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16
        }}>
          <div style={{
            background: colors.cardBg,
            borderRadius: 16,
            padding: 28,
            maxWidth: 450,
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>
                <Unlock size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Abrir Turno de Caja
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color={colors.textSecondary} />
              </button>
            </div>

            <form onSubmit={handleOpenShift}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Monto Inicial
                </label>
                <input
                  type="number"
                  value={openForm.openingAmount}
                  onChange={(e) => setOpenForm({...openForm, openingAmount: e.target.value})}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Notas
                </label>
                <textarea
                  value={openForm.notes}
                  onChange={(e) => setOpenForm({...openForm, notes: e.target.value})}
                  placeholder="Notas del turno..."
                  rows={3}
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text,
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1, padding: 12, borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    background: 'none', color: colors.text,
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1, padding: 12, borderRadius: 10,
                    border: 'none',
                    background: '#10b981', color: 'white',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Abriendo...' : 'Abrir Turno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal cerrar turno */}
      {showCloseModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16
        }}>
          <div style={{
            background: colors.cardBg,
            borderRadius: 16,
            padding: 28,
            maxWidth: 450,
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>
                <Lock size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Cerrar Turno (Corte de Caja)
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color={colors.textSecondary} />
              </button>
            </div>

            <div style={{
              background: '#dbeafe',
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 14
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Monto esperado:</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1e40af' }}>
                ${activeShift?.currentAmount?.toLocaleString('es-CO') || '0'}
              </div>
            </div>

            <form onSubmit={handleCloseShift}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Monto Real en Caja *
                </label>
                <input
                  type="number"
                  value={closeForm.closingAmount}
                  onChange={(e) => setCloseForm({...closeForm, closingAmount: e.target.value})}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text,
                    fontSize: 18, fontWeight: 700
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Notas del cierre
                </label>
                <textarea
                  value={closeForm.notes}
                  onChange={(e) => setCloseForm({...closeForm, notes: e.target.value})}
                  placeholder="Observaciones del corte de caja..."
                  rows={3}
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text,
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1, padding: 12, borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    background: 'none', color: colors.text,
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1, padding: 12, borderRadius: 10,
                    border: 'none',
                    background: '#ef4444', color: 'white',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Cerrando...' : 'Cerrar Turno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal nuevo movimiento */}
      {showMovementModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16
        }}>
          <div style={{
            background: colors.cardBg,
            borderRadius: 16,
            padding: 28,
            maxWidth: 450,
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>
                <Plus size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Nuevo Movimiento
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color={colors.textSecondary} />
              </button>
            </div>

            <form onSubmit={handleCreateMovement}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Tipo de Movimiento
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { value: 'income', label: '💰 Ingreso', color: '#10b981' },
                    { value: 'expense', label: '💸 Gasto', color: '#ef4444' },
                    { value: 'withdrawal', label: '🏧 Retiro', color: '#f59e0b' }
                  ].map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMovementForm({...movementForm, type: m.value})}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 8,
                        border: movementForm.type === m.value ? '2px solid ' + m.color : `1px solid ${colors.border}`,
                        background: movementForm.type === m.value ? m.color + '20' : colors.inputBg,
                        color: movementForm.type === m.value ? m.color : colors.text,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Monto *
                </label>
                <input
                  type="number"
                  value={movementForm.amount}
                  onChange={(e) => setMovementForm({...movementForm, amount: e.target.value})}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Descripción *
                </label>
                <input
                  type="text"
                  value={movementForm.description}
                  onChange={(e) => setMovementForm({...movementForm, description: e.target.value})}
                  placeholder="Ej: Pago de servicio"
                  required
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Método de Pago
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { value: 'cash', label: '💵 Efectivo' },
                    { value: 'card', label: '💳 Tarjeta' },
                    { value: 'transfer', label: '📲 Transferencia' }
                  ].map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMovementForm({...movementForm, paymentMethod: m.value})}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 8,
                        border: movementForm.paymentMethod === m.value ? '2px solid #3b82f6' : `1px solid ${colors.border}`,
                        background: movementForm.paymentMethod === m.value ? '#eff6ff' : colors.inputBg,
                        color: movementForm.paymentMethod === m.value ? '#3b82f6' : colors.text,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Notas
                </label>
                <textarea
                  value={movementForm.notes}
                  onChange={(e) => setMovementForm({...movementForm, notes: e.target.value})}
                  placeholder="Notas adicionales..."
                  rows={2}
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text,
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1, padding: 12, borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    background: 'none', color: colors.text,
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1, padding: 12, borderRadius: 10,
                    border: 'none',
                    background: '#3b82f6', color: 'white',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal corregir movimiento */}
      {showCorrectModal && editingMovement && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16
        }}>
          <div style={{
            background: colors.cardBg,
            borderRadius: 16,
            padding: 28,
            maxWidth: 450,
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>
                Corregir Movimiento
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color={colors.textSecondary} />
              </button>
            </div>

            <div style={{
              background: '#fef3c7',
              padding: 12,
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 13,
              color: '#92400e'
            }}>
              <strong>⚠️ Corrección con reversa:</strong> Se creará un movimiento de reversa para anular el actual, y uno nuevo con el monto correcto. Esto mantiene la trazabilidad de la caja.
            </div>

            <form onSubmit={handleSubmitCorrection}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Tipo de Movimiento Correcto
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { value: 'income', label: '💰 Ingreso', color: '#10b981' },
                    { value: 'expense', label: '💸 Gasto', color: '#ef4444' },
                    { value: 'withdrawal', label: '🏧 Retiro', color: '#f59e0b' }
                  ].map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMovementForm({...movementForm, type: m.value})}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 8,
                        border: movementForm.type === m.value ? '2px solid ' + m.color : `1px solid ${colors.border}`,
                        background: movementForm.type === m.value ? m.color + '20' : colors.inputBg,
                        color: movementForm.type === m.value ? m.color : colors.text,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Descripción Correcta *
                </label>
                <input
                  type="text"
                  value={movementForm.description}
                  onChange={(e) => setMovementForm({...movementForm, description: e.target.value})}
                  placeholder="Ej: Pago de luz"
                  required
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Monto correcto * (Pon 0 para anular)
                </label>
                <input
                  type="number"
                  value={movementForm.correctAmount}
                  onChange={(e) => setMovementForm({...movementForm, correctAmount: e.target.value})}
                  placeholder="Ej: 250000"
                  min="0"
                  step="0.01"
                  required
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text,
                    fontSize: 16, fontWeight: 700
                  }}
                />
                {movementForm.correctAmount && (parseFloat(movementForm.correctAmount) !== parseFloat(editingMovement.amount) || movementForm.type !== editingMovement.type) && (
                  <div style={{
                    marginTop: 8,
                    padding: 8,
                    borderRadius: 6,
                    background: '#f3f4f6',
                    color: colors.text,
                    fontSize: 13,
                    fontWeight: 600
                  }}>
                    El saldo se ajustará automáticamente con una reversa.
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Método de Pago Correcto
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { value: 'cash', label: '💵 Efectivo' },
                    { value: 'card', label: '💳 Tarjeta' },
                    { value: 'transfer', label: '📲 Transferencia' }
                  ].map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMovementForm({...movementForm, paymentMethod: m.value})}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 8,
                        border: movementForm.paymentMethod === m.value ? '2px solid #3b82f6' : `1px solid ${colors.border}`,
                        background: movementForm.paymentMethod === m.value ? '#eff6ff' : colors.inputBg,
                        color: movementForm.paymentMethod === m.value ? '#3b82f6' : colors.text,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Motivo de la corrección *
                </label>
                <textarea
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm({...movementForm, reason: e.target.value})}
                  placeholder="Ej: Error al digitar, el monto correcto es 250.000 no 25.000"
                  rows={3}
                  required
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text,
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1, padding: 12, borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    background: 'none', color: colors.text,
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !movementForm.correctAmount || !movementForm.reason}
                  style={{
                    flex: 1, padding: 12, borderRadius: 10,
                    border: 'none',
                    background: '#f59e0b', color: 'white',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving || !movementForm.correctAmount || !movementForm.reason ? 0.7 : 1
                  }}
                >
                  {saving ? 'Procesando...' : 'Corregir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de historial */}
      {showHistoryModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16
        }}>
          <div style={{
            background: colors.cardBg,
            borderRadius: 16,
            padding: 28,
            maxWidth: 800,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>
                <History size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Historial de Turnos
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={downloadHistoryExcel}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Download size={18} />
                  Descargar Excel
                </button>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={24} color={colors.textSecondary} />
                </button>
              </div>
            </div>

            {!selectedShiftHistory ? (
              <div>
                <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 16 }}>
                  Selecciona un turno para ver sus movimientos
                </p>
                {historyShifts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: colors.textSecondary }}>
                    No hay turnos cerrados
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {historyShifts.map(shift => (
                      <div
                        key={shift.id}
                        onClick={() => loadHistoryMovements(shift.id)}
                        style={{
                          padding: 16,
                          background: colors.inputBg,
                          borderRadius: 8,
                          border: `1px solid ${colors.border}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = colors.border}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>
                              {new Date(shift.openedAt).toLocaleDateString('es-CO', { 
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                              })}
                            </div>
                            <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
                              {new Date(shift.openedAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                              {' - '}
                              {shift.closedAt ? new Date(shift.closedAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : 'En curso'}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 12, color: colors.textSecondary }}>
                              Inicio: ${shift.openingAmount?.toLocaleString('es-CO') || '0'}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: '#10b981' }}>
                              ${shift.currentAmount?.toLocaleString('es-CO') || '0'}
                            </div>
                            <div style={{ fontSize: 12, color: colors.textSecondary }}>
                              {shift.movementsCount} movimientos
                            </div>
                          </div>
                        </div>
                        {shift.difference && Math.abs(shift.difference) > 0.01 && (
                          <div style={{
                            marginTop: 8,
                            padding: 8,
                            borderRadius: 6,
                            background: shift.difference > 0 ? '#dcfce7' : '#fee2e2',
                            fontSize: 12,
                            fontWeight: 600,
                            color: shift.difference > 0 ? '#166534' : '#991b1b'
                          }}>
                            {shift.difference > 0 ? 'Sobrante' : 'Faltante'}: ${Math.abs(shift.difference).toLocaleString('es-CO')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <button
                    onClick={() => setSelectedShiftHistory(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      background: colors.inputBg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ← Volver a turnos
                  </button>
                  <button
                    onClick={() => downloadShiftExcel(selectedShiftHistory.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={18} />
                    Descargar Turno
                  </button>
                </div>

                <div style={{
                  background: colors.inputBg,
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 20
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: colors.textSecondary }}>Monto Inicial</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#6b7280' }}>
                        ${selectedShiftHistory.openingAmount?.toLocaleString('es-CO') || '0'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: colors.textSecondary }}>Monto Final</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>
                        ${selectedShiftHistory.currentAmount?.toLocaleString('es-CO') || '0'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: colors.textSecondary }}>Ingresos</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>
                        ${selectedShiftHistory.totalIncome?.toLocaleString('es-CO') || '0'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: colors.textSecondary }}>Gastos/Retiros</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>
                        ${((selectedShiftHistory.totalExpenses || 0) + (selectedShiftHistory.totalWithdrawals || 0)).toLocaleString('es-CO')}
                      </div>
                    </div>
                  </div>
                  {selectedShiftHistory.difference && Math.abs(selectedShiftHistory.difference) > 0.01 && (
                    <div style={{
                      padding: 10,
                      borderRadius: 6,
                      background: selectedShiftHistory.difference > 0 ? '#dcfce7' : '#fee2e2',
                      fontSize: 14,
                      fontWeight: 600,
                      color: selectedShiftHistory.difference > 0 ? '#166534' : '#991b1b'
                    }}>
                      Diferencia: {selectedShiftHistory.difference > 0 ? '+' : ''}${selectedShiftHistory.difference.toLocaleString('es-CO')}
                    </div>
                  )}
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: colors.text }}>
                  Movimientos del Turno
                </h3>
                
                {historyMovements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: colors.textSecondary }}>
                    No hay movimientos en este turno
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {historyMovements.map(movement => (
                      <div key={movement.id} style={{
                        padding: 12,
                        background: colors.inputBg,
                        borderRadius: 8,
                        border: `1px solid ${colors.border}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>
                            {movement.description}
                          </div>
                          <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                            {new Date(movement.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                            {' • '}
                            {movement.paymentMethod === 'cash' ? '💵 Efectivo' : 
                             movement.paymentMethod === 'card' ? '💳 Tarjeta' :
                             movement.paymentMethod === 'transfer' ? '📲 Transferencia' :
                             movement.paymentMethod === 'nequi' ? '📱 Nequi' : '📱 DaviPlata'}
                          </div>
                        </div>
                        <div style={{
                          fontWeight: 700,
                          color: movement.type === 'income' ? '#10b981' : '#ef4444',
                          fontSize: 16
                        }}>
                          {movement.type === 'income' ? '+' : '-'}${parseFloat(movement.amount).toLocaleString('es-CO')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast notification */}
      {statusMsg && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: statusMsg.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: statusMsg.type === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${statusMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          {statusMsg.type === 'error' ? <X size={16} /> : <DollarSign size={16} />}
          {statusMsg.text}
        </div>
      )}
    </AdminLayout>
  );
}
