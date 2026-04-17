import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import EmployeeLayout from '../../components/EmployeeLayout';
import api from '../../api/client';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Download,
  Briefcase,
  CalendarDays,
  CalendarRange,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wrench,
  Car,
  MapPin,
  Package,
  Play,
  CheckCircle2,
  Trash2,
  MessageSquare
} from 'lucide-react';

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('es-CO', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    timeZone: 'America/Bogota'
  });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('es-CO', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'America/Bogota'
  });

export default function EmployeeCommissions() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Vista: 'day' | 'week' | 'month'
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(() => {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para flujo de técnicos de campo (insumos y estados)
  const [showInsumosModal, setShowInsumosModal] = useState(false);
  const [insumosAppointment, setInsumosAppointment] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedInsumos, setSelectedInsumos] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [savingInsumos, setSavingInsumos] = useState(false);
  const [workNotes, setWorkNotes] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    loadCommissions();
  }, [view, currentDate, currentPage]);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/employees/me/commissions', {
        params: { 
          view, 
          date: view === 'month' ? currentDate.slice(0, 7) : currentDate,
          page: currentPage,
          limit: 8
        }
      });
      setData(res.data);
      console.log('[FRONTEND] Received data:', res.data);
      console.log('[FRONTEND] hasFieldTechnicians:', res.data?.hasFieldTechnicians);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar comisiones');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar mensaje de estado
  const showStatus = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Cargar insumos del inventario
  const loadInventoryItems = async () => {
    if (!data?.business?.enabledModules?.inventory) return;
    setLoadingInventory(true);
    try {
      const res = await api.get('/inventory/items', {
        params: { businessId: data.business.id }
      });
      setInventoryItems(res.data || []);
    } catch (e) {
      console.error('Error cargando insumos:', e);
      setInventoryItems([]);
    } finally {
      setLoadingInventory(false);
    }
  };

  // Cambiar estado de la cita
  const handleStatusChange = async (appointment, newStatus) => {
    try {
      // Para técnicos de campo, usar endpoint específico para estados de seguimiento
      const isTechnicianStatus = ['on_the_way', 'arrived', 'in_progress'].includes(newStatus);
      if (data?.hasFieldTechnicians && isTechnicianStatus) {
        await api.patch(`/appointments/${appointment.id}/technician-status`, { status: newStatus });
      } else {
        await api.patch(`/appointments/${appointment.id}/status`, { status: newStatus });
      }
      showStatus(`Cita marcada como: ${newStatus}`);
      loadCommissions();
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al cambiar estado', 'error');
    }
  };

  // Iniciar trabajo directamente sin modal (para técnicos de campo)
  const handleStartWorkDirectly = async (appointment) => {
    try {
      // Cambiar estado a in_progress usando el endpoint de técnico
      await api.patch(`/appointments/${appointment.id}/technician-status`, { status: 'in_progress' });
      showStatus('Trabajo iniciado');
      loadCommissions();
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al iniciar trabajo', 'error');
    }
  };

  // Abrir modal de insumos
  const handleOpenInsumosModal = async (appointment) => {
    setInsumosAppointment(appointment);
    setSelectedInsumos([]);
    setWorkNotes(appointment.workNotes || '');
    await loadInventoryItems();
    setShowInsumosModal(true);
  };

  // Agregar insumo seleccionado
  const handleAddInsumo = (itemId, quantity) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item || !quantity) return;
    
    setSelectedInsumos(prev => {
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        return prev.map(i => i.itemId === itemId ? { ...i, quantity: parseFloat(quantity) } : i);
      }
      return [...prev, { itemId, quantity: parseFloat(quantity), name: item.name, unit: item.unit }];
    });
  };

  // Remover insumo
  const handleRemoveInsumo = (itemId) => {
    setSelectedInsumos(prev => prev.filter(i => i.itemId !== itemId));
  };

  // Guardar insumos e iniciar trabajo
  const handleSaveInsumosAndStart = async () => {
    if (!insumosAppointment) return;
    setSavingInsumos(true);
    try {
      // Guardar insumos usados
      for (const insumo of selectedInsumos) {
        await api.post('/inventory/usages', {
          itemId: insumo.itemId,
          quantity: insumo.quantity,
          date: new Date().toISOString().split('T')[0],
          notes: `Usado en cita #${insumosAppointment.id} - ${insumosAppointment.clientName}`,
          businessId: data.business.id,
          appointmentId: insumosAppointment.id
        });
      }
      
      // Guardar notas del trabajo y cambiar estado
      await api.patch(`/appointments/${insumosAppointment.id}/start-work`, {
        workNotes: workNotes,
        status: 'attention'
      });
      
      showStatus('Insumos registrados y trabajo iniciado');
      setShowInsumosModal(false);
      setInsumosAppointment(null);
      setSelectedInsumos([]);
      setWorkNotes('');
      loadCommissions();
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al guardar insumos', 'error');
    } finally {
      setSavingInsumos(false);
    }
  };

  // Handlers de navegación según la vista
  const handlePrev = () => {
    setCurrentPage(1); // Reset página al cambiar fecha
    if (view === 'day') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d.toISOString().slice(0, 10));
    } else if (view === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d.toISOString().slice(0, 10));
    } else {
      // month
      const [year, month] = currentDate.slice(0, 7).split('-').map(Number);
      const d = new Date(year, month - 2, 1);
      setCurrentDate(d.toISOString().slice(0, 7) + '-01');
    }
  };

  const handleNext = () => {
    setCurrentPage(1); // Reset página al cambiar fecha
    const now = new Date();
    
    if (view === 'day') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      const nextDate = d.toISOString().slice(0, 10);
      const today = now.toISOString().slice(0, 10);
      if (nextDate > today) return;
      setCurrentDate(nextDate);
    } else if (view === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      const today = now.toISOString().slice(0, 10);
      if (d.toISOString().slice(0, 10) > today) return;
      setCurrentDate(d.toISOString().slice(0, 10));
    } else {
      // month
      const [year, month] = currentDate.slice(0, 7).split('-').map(Number);
      const d = new Date(year, month, 1);
      const nextMonth = d.toISOString().slice(0, 7);
      const currentMonthStr = now.toISOString().slice(0, 7);
      if (nextMonth > currentMonthStr) return;
      setCurrentDate(nextMonth + '-01');
    }
  };

  const getPeriodLabel = () => {
    if (view === 'day') {
      const d = new Date(currentDate);
      return d.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else if (view === 'week') {
      // Calcular inicio y fin de semana
      const d = new Date(currentDate);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(d.setDate(diff));
      const end = new Date(d.setDate(start.getDate() + 6));
      return `${start.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else {
      const [year, month] = currentDate.slice(0, 7).split('-').map(Number);
      const d = new Date(year, month - 1, 1);
      return d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Exportar a CSV
  const exportToCSV = () => {
    if (!data || !data.appointments.length) return;
    
    const isTechnical = data?.isTechnicalServices;
    const isFieldTech = data?.hasFieldTechnicians;
    
    const headers = isFieldTech
      ? ['Fecha', 'Hora', 'Servicio', 'Cliente', 'Teléfono', 'Estado', 'Estado Técnico']
      : isTechnical 
        ? ['Fecha', 'Hora', 'Servicio', 'Cliente', 'Teléfono']
        : ['Fecha', 'Hora', 'Servicio', 'Cliente', 'Teléfono', 'Valor Servicio', 'Adicional', 'Total', 'Comisión', 'Método Pago'];
    
    const rows = data.appointments.map(apt => {
      if (isFieldTech) {
        const statusLabels = {
          pending: 'Pendiente',
          confirmed: 'Confirmada',
          attention: 'En Atención',
          done: 'Completada',
          cancelled: 'Cancelada'
        };
        const techStatusLabels = {
          not_started: 'No iniciado',
          on_the_way: 'En Camino',
          arrived: 'Llegó',
          in_progress: 'Iniciado'
        };
        return [
          fmtDate(apt.date),
          fmtTime(apt.date),
          apt.service,
          apt.client,
          apt.clientPhone || '',
          statusLabels[apt.status] || apt.status,
          techStatusLabels[apt.technicianStatus] || apt.technicianStatus || 'No iniciado'
        ];
      }
      if (isTechnical) {
        return [
          fmtDate(apt.date),
          fmtTime(apt.date),
          apt.service,
          apt.client,
          apt.clientPhone || ''
        ];
      }
      return [
        fmtDate(apt.date),
        fmtTime(apt.date),
        apt.service,
        apt.client,
        apt.clientPhone || '',
        fmt(apt.basePrice),
        fmt(apt.additional),
        fmt(apt.price),
        fmt(apt.myCommission),
        apt.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const periodStr = view === 'month' ? currentDate.slice(0, 7) : currentDate;
    const fileName = isFieldTech
      ? `citas_${view}_${periodStr}_${data.employee.name.replace(/\s+/g, '_')}.csv`
      : isTechnical 
        ? `servicios_${view}_${periodStr}_${data.employee.name.replace(/\s+/g, '_')}.csv`
        : `comisiones_${view}_${periodStr}_${data.employee.name.replace(/\s+/g, '_')}.csv`;
    link.download = fileName;
    link.click();
  };

  return (
    <EmployeeLayout>
      {/* Contenido */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
        
        {/* Selector de Vista y Navegación */}
        <div style={{
          background: colors.cardBg,
          padding: 20,
          borderRadius: 12,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          marginBottom: 24
        }}>
          {/* Botones de Vista */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 20,
            flexWrap: 'wrap'
          }}>
            {[
              { key: 'day', label: 'Día', icon: CalendarDays },
              { key: 'week', label: 'Semana', icon: CalendarRange },
              { key: 'month', label: 'Mes', icon: Calendar }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setView(key);
                  setCurrentPage(1);
                  // Resetear fecha al cambiar vista
                  const now = new Date();
                  if (key === 'month') {
                    setCurrentDate(now.toISOString().slice(0, 7) + '-01');
                  } else {
                    setCurrentDate(now.toISOString().slice(0, 10));
                  }
                }}
                style={{
                  flex: 1,
                  minWidth: 80,
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: view === key ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                  background: view === key ? `${colors.primary}15` : colors.bgSecondary,
                  color: view === key ? colors.primary : colors.text,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Navegación de Periodo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'nowrap'
          }}>
            <button
              onClick={handlePrev}
              style={{
                background: colors.bgSecondary,
                border: `1px solid ${colors.border}`,
                padding: '10px',
                borderRadius: 8,
                cursor: 'pointer',
                color: colors.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ChevronLeft size={20} />
            </button>
            
            <div style={{ textAlign: 'center', flex: 1, minWidth: 0, maxWidth: 250 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 8,
                flexWrap: 'wrap'
              }}>
                <Calendar size={18} color={colors.primary} />
                <span style={{ 
                  fontSize: 16, 
                  fontWeight: 700, 
                  color: colors.text, 
                  textTransform: 'capitalize' 
                }}>
                  {getPeriodLabel()}
                </span>
              </div>
              <span style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, display: 'block' }}>
                {data?.pagination?.total || 0} citas en total
              </span>
            </div>
            
            <button
              onClick={handleNext}
              style={{
                background: colors.bgSecondary,
                border: `1px solid ${colors.border}`,
                padding: '10px',
                borderRadius: 8,
                cursor: 'pointer',
                color: colors.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: colors.isDark ? '#7f1d1d' : '#fed7d7',
            color: colors.isDark ? '#fca5a5' : '#c53030',
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
            border: `1px solid ${colors.isDark ? '#dc2626' : '#fc8181'}`
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <p style={{ color: colors.textSecondary }}>
              {data?.hasFieldTechnicians ? 'Cargando citas...' : data?.isTechnicalServices ? 'Cargando servicios...' : 'Cargando comisiones...'}
            </p>
          </div>
        ) : (
          <>
            {/* Tarjetas de Resumen */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: (data?.isTechnicalServices || data?.hasFieldTechnicians)
                ? 'repeat(auto-fit, minmax(140px, 1fr))' 
                : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 24
            }}>
              {/* ===== VISTA PARA TÉCNICOS DE CAMPO ===== */}
              {data?.hasFieldTechnicians ? (
                <>
                  {/* Total Citas */}
                  <div style={{
                    background: colors.cardBg,
                    padding: 16,
                    borderRadius: 12,
                    boxShadow: `0 2px 8px ${colors.shadow}`,
                    border: `1px solid ${colors.border}`,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: colors.primary }}>
                      {data?.statusStats?.total || 0}
                    </div>
                    <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                      Total Citas
                    </div>
                  </div>

                  {/* Pendientes */}
                  <div style={{
                    background: colors.cardBg,
                    padding: 16,
                    borderRadius: 12,
                    boxShadow: `0 2px 8px ${colors.shadow}`,
                    border: `1px solid ${colors.border}`,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>
                      {data?.statusStats?.pending || 0}
                    </div>
                    <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                      ⏳ Pendientes
                    </div>
                  </div>

                  {/* Confirmadas */}
                  <div style={{
                    background: colors.cardBg,
                    padding: 16,
                    borderRadius: 12,
                    boxShadow: `0 2px 8px ${colors.shadow}`,
                    border: `1px solid ${colors.border}`,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6' }}>
                      {data?.statusStats?.confirmed || 0}
                    </div>
                    <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                      ✅ Confirmadas
                    </div>
                  </div>

                  {/* En Atención */}
                  <div style={{
                    background: colors.cardBg,
                    padding: 16,
                    borderRadius: 12,
                    boxShadow: `0 2px 8px ${colors.shadow}`,
                    border: `1px solid ${colors.border}`,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6' }}>
                      {data?.statusStats?.attention || 0}
                    </div>
                    <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                      🔧 En Atención
                    </div>
                  </div>

                  {/* Completadas */}
                  <div style={{
                    background: colors.cardBg,
                    padding: 16,
                    borderRadius: 12,
                    boxShadow: `0 2px 8px ${colors.shadow}`,
                    border: `1px solid ${colors.border}`,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>
                      {data?.statusStats?.done || 0}
                    </div>
                    <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                      ✓ Completadas
                    </div>
                  </div>

                  {/* Canceladas */}
                  <div style={{
                    background: colors.cardBg,
                    padding: 16,
                    borderRadius: 12,
                    boxShadow: `0 2px 8px ${colors.shadow}`,
                    border: `1px solid ${colors.border}`,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>
                      {data?.statusStats?.cancelled || 0}
                    </div>
                    <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                      ✗ Canceladas
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* ===== VISTA NORMAL / SERVICIOS TÉCNICOS ===== */}
                  {/* Total de Servicios - Siempre visible */}
                  <div style={{
                    background: colors.cardBg,
                    padding: 20,
                    borderRadius: 12,
                    boxShadow: `0 2px 8px ${colors.shadow}`,
                    border: `1px solid ${colors.border}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: `${colors.primary}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Briefcase size={20} color={colors.primary} />
                      </div>
                      <span style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 500 }}>
                        {data?.isTechnicalServices ? 'Servicios Realizados' : 'Citas Completadas'}
                      </span>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: colors.text }}>
                      {data?.totals?.count || 0}
                    </div>
                  </div>

                  {/* Valor Total Servicios - Oculto para técnicos */}
                  {!data?.isTechnicalServices && (
                    <div style={{
                      background: colors.cardBg,
                      padding: 20,
                      borderRadius: 12,
                      boxShadow: `0 2px 8px ${colors.shadow}`,
                      border: `1px solid ${colors.border}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: '#3b82f615',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <CreditCard size={20} color="#3b82f6" />
                        </div>
                        <span style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 500 }}>
                          Total Servicios
                        </span>
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6' }}>
                        {fmt(data?.totals?.totalServices)}
                      </div>
                    </div>
                  )}

                  {/* Mi Comisión - Oculto para técnicos */}
                  {!data?.isTechnicalServices && (
                    <div style={{
                      background: colors.cardBg,
                      padding: 20,
                      borderRadius: 12,
                      boxShadow: `0 2px 8px ${colors.shadow}`,
                      border: `1px solid ${colors.border}`,
                      borderLeft: `4px solid #10b981`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: '#10b98115',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <DollarSign size={20} color="#10b981" />
                        </div>
                        <div>
                          <span style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 500, display: 'block' }}>
                            Tu Comisión
                          </span>
                          <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                            {data?.employee?.commissionPct || 0}% de cada servicio
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>
                        {fmt(data?.totals?.totalCommission)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Botón Exportar */}
            {data?.appointments?.length > 0 && (
              <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <button
                  onClick={exportToCSV}
                  style={{
                    background: colors.bgSecondary,
                    border: `1px solid ${colors.border}`,
                    padding: '10px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: colors.text,
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Download size={16} />
                  {data?.hasFieldTechnicians ? 'Exportar Citas' : data?.isTechnicalServices ? 'Exportar Servicios' : 'Exportar CSV'}
                </button>
              </div>
            )}

            {/* Lista de Citas - OCULTA para técnicos de campo (van al Dashboard) */}
            {!data?.hasFieldTechnicians && (
            <div style={{
              background: colors.cardBg,
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${colors.border}`
            }}>
              {/* Título y Contador */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: 0 }}>
                    Detalle de Servicios
                  </h2>
                  <span style={{ fontSize: 13, color: colors.textSecondary }}>
                    Mostrando {data?.appointments?.length || 0} de {data?.pagination?.total || 0} citas
                  </span>
                </div>
              </div>

              {data?.appointments?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <p style={{ color: colors.textSecondary, fontSize: 16 }}>
                    {data?.isTechnicalServices 
                      ? `No tienes servicios registrados en este ${view === 'day' ? 'día' : view === 'week' ? 'periodo' : 'mes'}`
                      : `No tienes citas completadas en este ${view === 'day' ? 'día' : view === 'week' ? 'periodo' : 'mes'}`}
                  </p>
                  <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 8 }}>
                    {data?.isTechnicalServices 
                      ? 'Los servicios aparecerán cuando marques una cita como "Terminada"' 
                      : 'Las comisiones se generan cuando marcas una cita como "Terminada"'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Vista Desktop - Tabla */}
                  <div className="desktop-view" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table className="commissions-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: (data?.isTechnicalServices || data?.hasFieldTechnicians) ? '200px' : '320px' }}>
                      <thead>
                        <tr style={{ background: colors.bgSecondary }}>
                          <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Fecha
                          </th>
                          <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Servicio / Cliente
                          </th>
                          {data?.hasFieldTechnicians && (
                            <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Estado
                            </th>
                          )}
                          {!data?.isTechnicalServices && !data?.hasFieldTechnicians && (
                            <>
                              <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Valor
                              </th>
                              <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Tu Comisión
                              </th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {data.appointments.map((apt, idx) => (
                          <tr 
                            key={apt.id} 
                            style={{ 
                              borderTop: `1px solid ${colors.border}`,
                              background: idx % 2 === 0 ? 'transparent' : colors.bgSecondary
                            }}
                          >
                            <td style={{ padding: '16px' }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, whiteSpace: 'nowrap' }}>
                                {fmtDate(apt.date)}
                              </div>
                              <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                                {fmtTime(apt.date)}
                              </div>
                            </td>
                            <td style={{ padding: '16px', maxWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {apt.service}
                              </div>
                              <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <User size={12} style={{ flexShrink: 0 }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{apt.client}</span>
                              </div>
                              {!data?.isTechnicalServices && !data?.hasFieldTechnicians && apt.additional > 0 && (
                                <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4, whiteSpace: 'nowrap' }}>
                                  + Adicional: {fmt(apt.additional)}
                                </div>
                              )}
                            </td>
                            {/* Estado y Acciones para técnicos de campo */}
                            {data?.hasFieldTechnicians && (
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '4px 10px',
                                  borderRadius: 12,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: apt.status === 'done' ? '#10b981' : 
                                             apt.status === 'attention' ? '#8b5cf6' :
                                             apt.status === 'confirmed' ? '#3b82f6' :
                                             apt.status === 'cancelled' ? '#ef4444' : '#f59e0b',
                                  color: 'white',
                                  marginBottom: 8
                                }}>
                                  {apt.status === 'pending' && '⏳ Pendiente'}
                                  {apt.status === 'confirmed' && '✅ Confirmada'}
                                  {apt.status === 'attention' && '🔧 En Atención'}
                                  {apt.status === 'done' && '✓ Completada'}
                                  {apt.status === 'cancelled' && '✗ Cancelada'}
                                </span>
                                
                                {/* Botones de acción para flujo de campo */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                                  {/* En Camino - si está confirmada y no ha iniciado viaje */}
                                  {apt.status === 'confirmed' && (!apt.technicianStatus || apt.technicianStatus === 'not_started') && (
                                    <button
                                      onClick={() => handleStatusChange(apt, 'on_the_way')}
                                      style={{
                                        padding: '6px 10px',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        borderRadius: 6,
                                        border: 'none',
                                        background: '#3b82f6',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 4
                                      }}
                                    >
                                      <Car size={12} /> En Camino
                                    </button>
                                  )}
                                  {/* Llegué - cuando está en camino */}
                                  {apt.technicianStatus === 'on_the_way' && (
                                    <button
                                      onClick={() => handleStatusChange(apt, 'arrived')}
                                      style={{
                                        padding: '6px 10px',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        borderRadius: 6,
                                        border: 'none',
                                        background: '#06b6d4',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 4
                                      }}
                                    >
                                      <MapPin size={12} /> Llegué
                                    </button>
                                  )}
                                  {/* Botones cuando llegó al destino: Iniciar Trabajo e Insumos */}
                                  {apt.technicianStatus === 'arrived' && apt.status !== 'attention' && (
                                    <>
                                      <button
                                        onClick={() => handleStartWorkDirectly(apt)}
                                        style={{
                                          padding: '6px 10px',
                                          fontSize: 11,
                                          fontWeight: 600,
                                          borderRadius: 6,
                                          border: 'none',
                                          background: '#8b5cf6',
                                          color: 'white',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          gap: 4
                                        }}
                                      >
                                        <Play size={12} /> Iniciar
                                      </button>
                                      <button
                                        onClick={() => handleOpenInsumosModal(apt)}
                                        style={{
                                          padding: '6px 10px',
                                          fontSize: 11,
                                          fontWeight: 600,
                                          borderRadius: 6,
                                          border: 'none',
                                          background: '#f59e0b',
                                          color: 'white',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          gap: 4
                                        }}
                                      >
                                        <Package size={12} /> Insumos
                                      </button>
                                    </>
                                  )}
                                  {apt.status === 'attention' && (
                                    <>
                                      <button
                                        onClick={() => handleOpenInsumosModal(apt)}
                                        style={{
                                          padding: '6px 10px',
                                          fontSize: 11,
                                          fontWeight: 600,
                                          borderRadius: 6,
                                          border: 'none',
                                          background: '#f59e0b',
                                          color: 'white',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          gap: 4
                                        }}
                                      >
                                        <Package size={12} /> Insumos
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(apt, 'done')}
                                        style={{
                                          padding: '6px 10px',
                                          fontSize: 11,
                                          fontWeight: 600,
                                          borderRadius: 6,
                                          border: 'none',
                                          background: '#22c55e',
                                          color: 'white',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          gap: 4
                                        }}
                                      >
                                        <CheckCircle2 size={12} /> Completar
                                      </button>
                                    </>
                                  )}
                                  {(apt.status === 'confirmed' || apt.status === 'attention') && (
                                    <button
                                      onClick={() => handleStatusChange(apt, 'cancelled')}
                                      style={{
                                        padding: '6px 10px',
                                        fontSize: 10,
                                        fontWeight: 500,
                                        borderRadius: 6,
                                        border: 'none',
                                        background: '#fee2e2',
                                        color: '#dc2626',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Cancelar
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                            {/* Valor y comisión - Solo para vista normal */}
                            {!data?.isTechnicalServices && !data?.hasFieldTechnicians && (
                              <>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                                    {fmt(apt.price)}
                                  </div>
                                  <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                                    {apt.paymentMethod === 'cash' ? '💵 Efectivo' : '📲 Transferencia'}
                                  </div>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                  <div style={{ 
                                    fontSize: 16, 
                                    fontWeight: 700, 
                                    color: apt.hasCommission ? '#10b981' : colors.textMuted 
                                  }}>
                                    {apt.hasCommission ? fmt(apt.myCommission) : '-'}
                                  </div>
                                  {apt.hasCommission && (
                                    <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                                      {apt.commissionPct}%
                                    </div>
                                  )}
                                  {!apt.hasCommission && (
                                    <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                                      Sin comisión
                                    </div>
                                  )}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista Mobile - Cards */}
                  <div className="mobile-view" style={{ display: 'none' }}>
                    <div style={{ display: 'grid', gap: 12 }}>
                      {data.appointments.map((apt) => (
                        <div 
                          key={apt.id}
                          style={{
                            background: colors.cardBg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 12,
                            padding: 16,
                            boxShadow: `0 2px 8px ${colors.shadow}`,
                            borderLeft: `4px solid ${
                              data?.hasFieldTechnicians 
                                ? (apt.status === 'done' ? '#10b981' : 
                                   apt.status === 'attention' ? '#8b5cf6' :
                                   apt.status === 'confirmed' ? '#3b82f6' :
                                   apt.status === 'cancelled' ? '#ef4444' : '#f59e0b')
                                : data?.isTechnicalServices 
                                  ? colors.primary 
                                  : (apt.hasCommission ? '#10b981' : colors.border)
                            }`
                          }}
                        >
                          {/* Header de la card - Fecha y Hora */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: 12,
                            paddingBottom: 10,
                            borderBottom: `1px solid ${colors.border}`
                          }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>
                                {new Date(apt.date).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </div>
                              <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                                {fmtTime(apt.date)}
                              </div>
                            </div>
                            
                            {/* Estado para técnicos de campo */}
                            {data?.hasFieldTechnicians && (
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: 12,
                                fontSize: 11,
                                fontWeight: 700,
                                background: apt.status === 'done' ? '#10b981' : 
                                           apt.status === 'attention' ? '#8b5cf6' :
                                           apt.status === 'confirmed' ? '#3b82f6' :
                                           apt.status === 'cancelled' ? '#ef4444' : '#f59e0b',
                                color: 'white'
                              }}>
                                {apt.status === 'pending' && '⏳'}
                                {apt.status === 'confirmed' && '✅'}
                                {apt.status === 'attention' && '🔧'}
                                {apt.status === 'done' && '✓'}
                                {apt.status === 'cancelled' && '✗'}
                              </span>
                            )}
                            
                            {!data?.isTechnicalServices && !data?.hasFieldTechnicians && (
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ 
                                  fontSize: 16, 
                                  fontWeight: 800, 
                                  color: apt.hasCommission ? '#10b981' : colors.textMuted 
                                }}>
                                  {apt.hasCommission ? fmt(apt.myCommission) : '-'}
                                </div>
                                {apt.hasCommission && (
                                  <div style={{ fontSize: 10, color: colors.textMuted }}>
                                    {apt.commissionPct}% comisión
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Servicio y Cliente */}
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                              {apt.service}
                            </div>
                            <div style={{ fontSize: 13, color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <User size={14} />
                              {apt.client}
                            </div>
                          </div>

                          {/* Footer - Valor y Método de pago (solo si no es técnico) */}
                          {!data?.isTechnicalServices && !data?.hasFieldTechnicians && (
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              paddingTop: 10,
                              borderTop: `1px solid ${colors.border}`
                            }}>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>
                                  {fmt(apt.price)}
                                </div>
                                {apt.additional > 0 && (
                                  <div style={{ fontSize: 11, color: '#f59e0b' }}>
                                    + {fmt(apt.additional)} adicional
                                  </div>
                                )}
                              </div>
                              <div style={{ 
                                fontSize: 11, 
                                color: colors.textMuted,
                                background: colors.bgSecondary,
                                padding: '4px 8px',
                                borderRadius: 4
                              }}>
                                {apt.paymentMethod === 'cash' ? '💵 Efectivo' : '📲 Transferencia'}
                              </div>
                            </div>
                          )}

                          {/* Botones de acción para técnicos de campo - Mobile */}
                          {data?.hasFieldTechnicians && (
                            <div style={{ 
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, 1fr)',
                              gap: 8,
                              paddingTop: 12,
                              borderTop: `1px solid ${colors.border}`,
                              marginTop: 8
                            }}>
                              {/* En Camino - si está confirmada y no ha iniciado viaje */}
                              {apt.status === 'confirmed' && (!apt.technicianStatus || apt.technicianStatus === 'not_started') && (
                                <button
                                  onClick={() => handleStatusChange(apt, 'on_the_way')}
                                  style={{
                                    padding: '8px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    borderRadius: 6,
                                    border: 'none',
                                    background: '#3b82f6',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 4
                                  }}
                                >
                                  <Car size={14} /> En Camino
                                </button>
                              )}
                              {/* Llegué - cuando está en camino */}
                              {apt.technicianStatus === 'on_the_way' && (
                                <button
                                  onClick={() => handleStatusChange(apt, 'arrived')}
                                  style={{
                                    padding: '8px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    borderRadius: 6,
                                    border: 'none',
                                    background: '#06b6d4',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 4
                                  }}
                                >
                                  <MapPin size={14} /> Llegué
                                </button>
                              )}
                              {/* Botones cuando llegó al destino: Iniciar Trabajo e Insumos */}
                              {apt.technicianStatus === 'arrived' && apt.status !== 'attention' && (
                                <>
                                  <button
                                    onClick={() => handleStartWorkDirectly(apt)}
                                    style={{
                                      padding: '10px',
                                      fontSize: 13,
                                      fontWeight: 600,
                                      borderRadius: 6,
                                      border: 'none',
                                      background: '#8b5cf6',
                                      color: 'white',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 4
                                    }}
                                  >
                                    <Play size={16} /> Iniciar Trabajo
                                  </button>
                                  <button
                                    onClick={() => handleOpenInsumosModal(apt)}
                                    style={{
                                      padding: '10px',
                                      fontSize: 13,
                                      fontWeight: 600,
                                      borderRadius: 6,
                                      border: 'none',
                                      background: '#f59e0b',
                                      color: 'white',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 4
                                    }}
                                  >
                                    <Package size={16} /> Insumos
                                  </button>
                                </>
                              )}
                              {apt.status === 'attention' && (
                                <>
                                  <button
                                    onClick={() => handleOpenInsumosModal(apt)}
                                    style={{
                                      padding: '10px',
                                      fontSize: 13,
                                      fontWeight: 600,
                                      borderRadius: 6,
                                      border: 'none',
                                      background: '#f59e0b',
                                      color: 'white',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 4
                                    }}
                                  >
                                    <Package size={16} /> Insumos
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(apt, 'done')}
                                    style={{
                                      padding: '10px',
                                      fontSize: 13,
                                      fontWeight: 600,
                                      borderRadius: 6,
                                      border: 'none',
                                      background: '#22c55e',
                                      color: 'white',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 4
                                    }}
                                  >
                                    <CheckCircle2 size={16} /> Completar
                                  </button>
                                </>
                              )}
                              {(apt.status === 'confirmed' || apt.status === 'attention') && (
                                <button
                                  onClick={() => handleStatusChange(apt, 'cancelled')}
                                  style={{
                                    gridColumn: 'span 2',
                                    padding: '8px',
                                    fontSize: 11,
                                    fontWeight: 500,
                                    borderRadius: 6,
                                    border: 'none',
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Cancelar Cita
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Paginación - Abajo de la lista */}
              {data?.pagination?.totalPages > 1 && (
                <div style={{
                  padding: '16px 20px',
                  borderTop: `1px solid ${colors.border}`,
                  background: colors.bgSecondary
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    flexWrap: 'nowrap'
                  }}>
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={!data?.pagination?.hasPrev}
                      style={{
                        padding: '8px',
                        borderRadius: 6,
                        border: `1px solid ${colors.border}`,
                        background: colors.cardBg,
                        cursor: data?.pagination?.hasPrev ? 'pointer' : 'not-allowed',
                        opacity: data?.pagination?.hasPrev ? 1 : 0.5,
                        color: colors.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    <button
                      onClick={() => setCurrentPage(p => p - 1)}
                      disabled={!data?.pagination?.hasPrev}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: `1px solid ${colors.border}`,
                        background: colors.cardBg,
                        cursor: data?.pagination?.hasPrev ? 'pointer' : 'not-allowed',
                        opacity: data?.pagination?.hasPrev ? 1 : 0.5,
                        color: colors.text,
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        flexShrink: 0
                      }}
                    >
                      <ChevronLeft size={14} />
                      Ant
                    </button>

                    <div style={{
                      padding: '8px 16px',
                      borderRadius: 6,
                      background: colors.primary + '20',
                      border: `1px solid ${colors.primary}50`,
                      color: colors.primary,
                      fontSize: 14,
                      fontWeight: 700,
                      minWidth: 70,
                      textAlign: 'center',
                      flexShrink: 0
                    }}>
                      {data?.pagination?.page}/{data?.pagination?.totalPages}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={!data?.pagination?.hasNext}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: `1px solid ${colors.border}`,
                        background: colors.cardBg,
                        cursor: data?.pagination?.hasNext ? 'pointer' : 'not-allowed',
                        opacity: data?.pagination?.hasNext ? 1 : 0.5,
                        color: colors.text,
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        flexShrink: 0
                      }}
                    >
                      Sig
                      <ChevronRight size={14} />
                    </button>

                    <button
                      onClick={() => setCurrentPage(data?.pagination?.totalPages)}
                      disabled={!data?.pagination?.hasNext}
                      style={{
                        padding: '8px',
                        borderRadius: 6,
                        border: `1px solid ${colors.border}`,
                        background: colors.cardBg,
                        cursor: data?.pagination?.hasNext ? 'pointer' : 'not-allowed',
                        opacity: data?.pagination?.hasNext ? 1 : 0.5,
                        color: colors.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: colors.textMuted }}>
                      Página {data?.pagination?.page} de {data?.pagination?.totalPages}
                    </span>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Info adicional - Solo visible si no es servicio técnico */}
            {!data?.isTechnicalServices && (
              <div style={{
                marginTop: 24,
                padding: 16,
                background: colors.isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
                borderRadius: 8,
                border: `1px solid ${colors.isDark ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <TrendingUp size={20} color={colors.isDark ? '#60a5fa' : '#3b82f6'} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 600, color: colors.isDark ? '#93c5fd' : '#1e40af' }}>
                      ¿Cómo se calculan tus comisiones?
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: colors.isDark ? '#bfdbfe' : '#3b82f6', lineHeight: '1.5' }}>
                      Tu comisión se calcula sobre el valor total de cada servicio (incluyendo cargos adicionales). 
                      El porcentaje actual es del <strong style={{ color: colors.isDark ? '#60a5fa' : '#1e40af' }}>{data?.employee?.commissionPct || 0}%</strong> por servicio. 
                      Algunos servicios pueden estar configurados sin comisión para el empleado.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Responsive styles */}
            <style>{`
              /* Desktop: mostrar tabla, ocultar cards */
              @media (min-width: 769px) {
                .desktop-view {
                  display: block !important;
                }
                .mobile-view {
                  display: none !important;
                }
              }
              
              /* Mobile: ocultar tabla, mostrar cards */
              @media (max-width: 768px) {
                .desktop-view {
                  display: none !important;
                }
                .mobile-view {
                  display: block !important;
                }
                
                .commissions-table {
                  font-size: 12px;
                }
                .commissions-table th,
                .commissions-table td {
                  padding: 10px 8px !important;
                }
                .commissions-table th:nth-child(1),
                .commissions-table td:nth-child(1) {
                  min-width: 85px;
                }
                .commissions-table th:nth-child(2),
                .commissions-table td:nth-child(2) {
                  width: auto;
                  min-width: 100px;
                }
                .commissions-table th:nth-child(3),
                .commissions-table td:nth-child(3) {
                  min-width: 75px;
                }
                .commissions-table th:nth-child(4),
                .commissions-table td:nth-child(4) {
                  min-width: 65px;
                }
              }
              
              @media (max-width: 480px) {
                .commissions-table th,
                .commissions-table td {
                  padding: 8px 6px !important;
                  font-size: 11px;
                }
                .commissions-table th:nth-child(1),
                .commissions-table td:nth-child(1) {
                  min-width: 70px;
                }
                .commissions-table th:nth-child(2),
                .commissions-table td:nth-child(2) {
                  min-width: 90px;
                }
                .commissions-table th:nth-child(3),
                .commissions-table td:nth-child(3) {
                  min-width: 65px;
                }
                .commissions-table th:nth-child(4),
                .commissions-table td:nth-child(4) {
                  min-width: 60px;
                }
              }
              
              @media (max-width: 360px) {
                .commissions-table th,
                .commissions-table td {
                  padding: 6px 4px !important;
                  font-size: 10px;
                }
              }
            `}</style>
          </>
        )}

        {/* Toast de mensajes */}
        {statusMsg && (
          <div style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            padding: '12px 24px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            background: statusMsg.type === 'error' ? '#fee2e2' : '#d1fae5',
            color: statusMsg.type === 'error' ? '#991b1b' : '#065f46',
            border: `1px solid ${statusMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {statusMsg.text}
          </div>
        )}

        {/* Modal de Insumos para Técnicos de Campo */}
        {showInsumosModal && insumosAppointment && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: 20
          }}>
            <div style={{
              background: colors.cardBg, borderRadius: '16px', padding: '24px',
              maxWidth: '500px', width: '100%', maxHeight: '80vh',
              overflowY: 'auto',
              border: `1px solid ${colors.border}`
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={24} color={colors.primary} />
                Iniciar Trabajo - Registrar Insumos
              </h2>
              
              <div style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
                Cliente: <strong>{insumosAppointment.client}</strong> • {' '}
                Servicio: <strong>{insumosAppointment.service}</strong>
              </div>

              {/* Lista de insumos disponibles */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                  Seleccionar Insumos Usados:
                </label>
                
                {loadingInventory ? (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <div className="spinner" />
                    <p style={{ fontSize: 12, color: colors.textSecondary, marginTop: 8 }}>
                      Cargando insumos...
                    </p>
                  </div>
                ) : inventoryItems.length === 0 ? (
                  <div style={{ 
                    padding: 16, 
                    background: colors.bgSecondary, 
                    borderRadius: 8,
                    fontSize: 13,
                    color: colors.textSecondary
                  }}>
                    No hay insumos registrados en el inventario.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {inventoryItems.map(item => (
                      <div 
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: 12,
                          background: colors.bgSecondary,
                          borderRadius: 8,
                          border: `1px solid ${colors.border}`
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedInsumos.some(i => i.itemId === item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleAddInsumo(item.id, 1);
                            } else {
                              handleRemoveInsumo(item.id);
                            }
                          }}
                          style={{ width: 18, height: 18 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: colors.textSecondary }}>
                            Stock: {item.currentStock} {item.unit}
                          </div>
                        </div>
                        {selectedInsumos.some(i => i.itemId === item.id) && (
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={selectedInsumos.find(i => i.itemId === item.id)?.quantity || 1}
                            onChange={(e) => handleAddInsumo(item.id, e.target.value)}
                            style={{
                              width: 70,
                              padding: '6px 8px',
                              borderRadius: 6,
                              border: `1px solid ${colors.border}`,
                              fontSize: 14,
                              textAlign: 'center'
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumen de insumos seleccionados */}
              {selectedInsumos.length > 0 && (
                <div style={{ 
                  marginBottom: 20, 
                  padding: 12, 
                  background: '#f0fdf4', 
                  borderRadius: 8,
                  border: '1px solid #86efac'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 6 }}>
                    📦 Insumos seleccionados ({selectedInsumos.length}):
                  </div>
                  <div style={{ fontSize: 12, color: '#166534' }}>
                    {selectedInsumos.map(i => `${i.name}: ${i.quantity} ${i.unit}`).join(', ')}
                  </div>
                </div>
              )}

              {/* Notas del trabajo */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                  Notas del Trabajo Realizado:
                </label>
                <textarea
                  value={workNotes}
                  onChange={(e) => setWorkNotes(e.target.value)}
                  placeholder="Describe el trabajo realizado, diagnóstico, reparaciones, etc."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    fontSize: 14,
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => {
                    setShowInsumosModal(false);
                    setInsumosAppointment(null);
                    setSelectedInsumos([]);
                    setWorkNotes('');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    background: 'none',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveInsumosAndStart}
                  disabled={savingInsumos}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: 10,
                    border: 'none',
                    background: colors.primary,
                    color: 'white',
                    fontWeight: 700,
                    cursor: savingInsumos ? 'not-allowed' : 'pointer',
                    opacity: savingInsumos ? 0.7 : 1
                  }}
                >
                  {savingInsumos ? 'Guardando...' : 'Iniciar Trabajo'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}
