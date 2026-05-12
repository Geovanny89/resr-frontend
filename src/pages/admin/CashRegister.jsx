import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import { Plus, Lock, Unlock, History } from 'lucide-react';
import { 
  ShiftSummaryCards, 
  MovementsTable, 
  OpenShiftModal, 
  CloseShiftModal, 
  MovementModal, 
  CorrectionModal, 
  HistoryModal 
} from '../../features/cashRegister/components';

export default function CashRegister() {
  const { business, user } = useAuth();
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
    notes: '',
    correctAmount: '',
    reason: ''
  });

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    if (business?.id) loadActiveShift();
    return () => window.removeEventListener('resize', handleResize);
  }, [business?.id]);

  const itemsPerPage = isMobile ? 6 : 10;

  const filteredMovements = movements.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'income') return m.type === 'income';
    if (filter === 'expense') return (m.type === 'expense' || m.type === 'withdrawal') && m.category !== 'supplies' && m.category !== 'fixed';
    if (filter === 'fixed') return m.category === 'fixed';
    if (filter === 'supplies') return m.category === 'supplies' || parseFloat(m.suppliesCost) > 0;
    return true;
  });

  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const paginatedMovements = filteredMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const showToast = (msg, type = 'success') => {
    setStatusMsg({ msg, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const loadActiveShift = async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const res = await api.get('/cash-register/active', {
        params: { businessId: business.id }
      });
      if (res.data) {
        setActiveShift(res.data.activeShift);
        setMovements(res.data.movements || []);
      } else {
        setActiveShift(null);
        setMovements([]);
      }
    } catch (e) {
      console.error('Error al cargar turno:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenShift = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/cash-register/shift/open', {
        ...openForm,
        businessId: business.id,
        employeeId: user?.id
      });
      showToast('Turno abierto correctamente');
      loadActiveShift();
      setShowOpenModal(false);
    } catch (e) {
      showToast(e.response?.data?.error || 'Error al abrir turno', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseShift = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/cash-register/shift/close', {
        ...closeForm,
        shiftId: activeShift.id
      });
      showToast('Turno cerrado correctamente');
      loadActiveShift();
      setShowCloseModal(false);
    } catch (e) {
      showToast(e.response?.data?.error || 'Error al cerrar turno', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMovement = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/cash-register/movements', {
        ...movementForm,
        businessId: business.id,
        shiftId: activeShift.id
      });
      showToast('Movimiento registrado');
      loadActiveShift();
      setShowMovementModal(false);
      setMovementForm({ ...movementForm, amount: '', description: '', notes: '' });
    } catch (e) {
      showToast(e.response?.data?.error || 'Error al registrar movimiento', 'error');
    } finally {
      setSaving(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.get('/cash-register/shifts/history', {
        params: { businessId: business.id }
      });
      setHistoryShifts(res.data.shifts || []);
      setShowHistoryModal(true);
    } catch (e) {
      showToast('Error al cargar historial', 'error');
    }
  };

  const loadHistoryMovements = async (shiftId) => {
    try {
      const res = await api.get(`/cash-register/shifts/${shiftId}/movements`);
      setSelectedShiftHistory(res.data.shift);
      setHistoryMovements(res.data.movements);
    } catch (e) {
      showToast('Error al cargar movimientos', 'error');
    }
  };

  const handleCorrectMovement = (m) => {
    setEditingMovement(m);
    setMovementForm({
      ...movementForm,
      type: m.type,
      description: m.description,
      correctAmount: m.amount,
      paymentMethod: m.paymentMethod,
      reason: ''
    });
    setShowCorrectModal(true);
  };

  const handleSubmitCorrection = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/cash-register/movements/${editingMovement.id}/correct`, {
        type: movementForm.type,
        amount: parseFloat(movementForm.correctAmount),
        description: movementForm.description,
        paymentMethod: movementForm.paymentMethod,
        reason: movementForm.reason
      });
      showToast('Movimiento corregido con éxito');
      loadActiveShift();
      setShowCorrectModal(false);
    } catch (e) {
      showToast(e.response?.data?.error || 'Error al corregir', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleSelection = (id) => {
    setSelectedMovements(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const downloadHistoryExcel = async (month, year) => {
    try {
      const params = { businessId: business.id };
      
      if (month && year) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const res = await api.get('/cash-register/export/excel', { 
        params,
        responseType: 'blob' 
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = month && year ? `informe-caja-${year}-${month}.xlsx` : `historial-caja-completo.xlsx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
    } catch (e) {
      showToast('Error al exportar Excel', 'error');
    }
  };

  const downloadShiftExcel = async (shiftId) => {
    try {
      const res = await api.get('/cash-register/export/excel', { 
        params: { businessId: business.id, shiftId },
        responseType: 'blob' 
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `turno-caja-${shiftId.slice(0, 8)}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (e) {
      showToast('Error al exportar Excel', 'error');
    }
  };

  const closeModal = () => {
    setShowOpenModal(false);
    setShowCloseModal(false);
    setShowMovementModal(false);
    setShowHistoryModal(false);
    setShowCorrectModal(false);
    setEditingMovement(null);
    setSelectedShiftHistory(null);
    setOpenForm({ openingAmount: '0', notes: '' });
    setCloseForm({ closingAmount: '0', notes: '' });
    setMovementForm({ type: 'income', amount: '', paymentMethod: 'cash', description: '', notes: '', correctAmount: '', reason: '' });
  };

  if (loading) {
    return (
      <AdminLayout title="Caja">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
          <div className="spinner" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Caja" subtitle="Control de turnos y movimientos de caja">
      {/* Resumen de turno activo */}
      {activeShift ? (
        <>
          {/* Guía de Colores para el Dueño */}
          <div style={{
            display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap',
            padding: '4px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: colors.textSecondary }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' }}></div>
              <span>Monto en Caja</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: colors.textSecondary }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 5px rgba(16, 185, 129, 0.5)' }}></div>
              <span>Ingresos (+)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: colors.textSecondary }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)' }}></div>
              <span>G. Operativos (-)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: colors.textSecondary }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 5px rgba(99, 102, 241, 0.5)' }}></div>
              <span>G. Fijos (Mensual)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: colors.textSecondary }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 5px rgba(245, 158, 11, 0.5)' }}></div>
              <span>Insumos (Deducido)</span>
            </div>
          </div>

          <div style={{ 
            marginTop: 0,
            marginRight: isMobile ? -4 : 0,
            marginBottom: 0,
            marginLeft: isMobile ? -4 : 0
          }}>
            <ShiftSummaryCards activeShift={activeShift} isMobile={isMobile} colors={colors} />
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <button
              onClick={loadHistory}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '14px 20px', borderRadius: 12, border: 'none',
                background: '#6366f1', color: 'white', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
              }}
            >
              <History size={18} /> Historial
            </button>
            <button
              onClick={() => setShowMovementModal(true)}
              style={{
                flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '14px 20px', borderRadius: 12, border: 'none',
                background: '#3b82f6', color: 'white', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
              }}
            >
              <Plus size={18} /> Nuevo Mov.
            </button>
            <button
              onClick={() => setShowCloseModal(true)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '14px 20px', borderRadius: 12, border: 'none',
                background: '#ef4444', color: 'white', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)'
              }}
            >
              <Lock size={18} /> Cerrar
            </button>
          </div>

          {/* Filtros */}
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? 6 : 8, 
            marginBottom: 20, 
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            padding: '4px 0'
          }}>
            {[
              { id: 'all', label: 'Todos', color: '#6b7280' },
              { id: 'income', label: 'Ingresos', color: '#10b981' },
              { id: 'expense', label: 'Gastos', color: '#ef4444' },
              { id: 'fixed', label: 'Fijos', color: '#6366f1' },
              { id: 'supplies', label: 'Insumos', color: '#f59e0b' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: isMobile ? '6px 12px' : '10px 20px',
                  borderRadius: 25,
                  border: filter === f.id ? `2px solid ${f.color}` : `1px solid ${colors.border}`,
                  background: filter === f.id ? `${f.color}15` : colors.cardBg,
                  color: filter === f.id ? f.color : colors.textSecondary,
                  fontWeight: 800,
                  fontSize: isMobile ? 11 : 13,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  boxShadow: filter === f.id ? `0 4px 10px ${f.color}20` : 'none',
                  flex: isMobile ? '1' : 'none',
                  textAlign: 'center'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ 
            marginTop: 0,
            marginRight: -4,
            marginBottom: 0,
            marginLeft: -4
          }}> {/* Ajuste para que las tarjetas respiren en móvil */}
            <MovementsTable 
              movements={paginatedMovements}
              onCorrect={handleCorrectMovement}
              colors={colors}
              isMobile={isMobile}
            />
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: 20,
              padding: '12px 16px',
              background: colors.cardBg,
              borderRadius: 12,
              border: `1px solid ${colors.border}`
            }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: `1px solid ${colors.border}`,
                  background: currentPage === 1 ? colors.inputBg : colors.cardBg,
                  color: currentPage === 1 ? colors.textSecondary : colors.text,
                  fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Anterior
              </button>
              <span style={{ fontSize: 14, fontWeight: 700, color: colors.textSecondary }}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: `1px solid ${colors.border}`,
                  background: currentPage === totalPages ? colors.inputBg : colors.cardBg,
                  color: currentPage === totalPages ? colors.textSecondary : colors.text,
                  fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{
          background: '#fef3c7', padding: 32, borderRadius: 16, textAlign: 'center',
          border: '1px solid #fbbf24', boxShadow: '0 4px 12px rgba(251, 191, 36, 0.1)'
        }}>
          <Unlock size={48} color="#d97706" style={{ marginBottom: 16 }} />
          <h2 style={{ color: '#92400e', marginBottom: 8 }}>Caja Cerrada</h2>
          <p style={{ color: '#b45309', marginBottom: 24 }}>Inicia un nuevo turno para registrar ventas y gastos, o consulta turnos anteriores.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={loadHistory}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '16px 32px', borderRadius: 12, border: 'none',
                background: '#6366f1', color: 'white', fontWeight: 800, fontSize: 16,
                cursor: 'pointer', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
              }}
            >
              <History size={20} /> Ver Historial
            </button>
            <button
              onClick={() => setShowOpenModal(true)}
              style={{
                padding: '16px 32px', borderRadius: 12, border: 'none',
                background: '#10b981', color: 'white', fontWeight: 800, fontSize: 16,
                cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
              }}
            >
              Abrir Turno Ahora
            </button>
          </div>
        </div>
      )}

      {/* Modales */}
      <OpenShiftModal 
        show={showOpenModal}
        openForm={openForm}
        setOpenForm={setOpenForm}
        onOpen={handleOpenShift}
        onClose={closeModal}
        saving={saving}
        colors={colors}
      />

      <CloseShiftModal 
        show={showCloseModal}
        activeShift={activeShift}
        closeForm={closeForm}
        setCloseForm={setCloseForm}
        onCloseShift={handleCloseShift}
        onClose={closeModal}
        saving={saving}
        colors={colors}
      />

      <MovementModal 
        show={showMovementModal}
        movementForm={movementForm}
        setMovementForm={setMovementForm}
        onCreateMovement={handleCreateMovement}
        onClose={closeModal}
        saving={saving}
        colors={colors}
      />

      <CorrectionModal 
        show={showCorrectModal}
        editingMovement={editingMovement}
        movementForm={movementForm}
        setMovementForm={setMovementForm}
        onSubmitCorrection={handleSubmitCorrection}
        onClose={closeModal}
        saving={saving}
        colors={colors}
      />

      <HistoryModal 
        show={showHistoryModal}
        historyShifts={historyShifts}
        selectedShiftHistory={selectedShiftHistory}
        setSelectedShiftHistory={setSelectedShiftHistory}
        historyMovements={historyMovements}
        loadHistoryMovements={loadHistoryMovements}
        downloadHistoryExcel={downloadHistoryExcel}
        downloadShiftExcel={downloadShiftExcel}
        onClose={closeModal}
        colors={colors}
        isMobile={isMobile}
      />

      {/* Notificaciones */}
      {statusMsg && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: statusMsg.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: statusMsg.type === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${statusMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          {statusMsg.msg}
        </div>
      )}
    </AdminLayout>
  );
}
