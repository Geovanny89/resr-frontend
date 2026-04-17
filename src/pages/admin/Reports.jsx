import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import {
  BarChart3, Download, FileText, Table2, RefreshCw,
  TrendingUp, DollarSign, Calendar, CheckCircle, ChevronLeft, ChevronRight, FileSpreadsheet,
  Clock, XCircle, Car, MapPin, Wrench, Package
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveExcel, savePDF } from '../../utils/fileDownload';

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const STATUS_LABELS = {
  pending: 'Pendiente', confirmed: 'Confirmada',
  attention: 'En atención', done: 'Completada', cancelled: 'Cancelada',
};

// Extraer la URL base del backend desde el cliente API
const API_BASE_URL = api.defaults.baseURL || '';
const BACKEND_URL = API_BASE_URL.replace(/\/api$/, ''); // Quitar el sufijo /api si existe

// ─── Helper para cargar logo del negocio ──────────────────────────────────────
async function loadLogoImage(logoUrl, makeCircular = false) {
  if (!logoUrl) return null;
  
  // Si es URL relativa, convertir a absoluta
  let fullUrl = logoUrl;
  if (logoUrl.startsWith('/')) {
    fullUrl = `${window.location.origin}${logoUrl}`;
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 100; // Tamaño base
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Fondo transparente
        ctx.clearRect(0, 0, size, size);
        
        if (makeCircular) {
          // Crear máscara circular
          ctx.beginPath();
          ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
        } else {
          // Esquinas redondeadas
          const r = 15;
          ctx.beginPath();
          ctx.moveTo(r, 0);
          ctx.lineTo(size - r, 0);
          ctx.quadraticCurveTo(size, 0, size, r);
          ctx.lineTo(size, size - r);
          ctx.quadraticCurveTo(size, size, size - r, size);
          ctx.lineTo(r, size);
          ctx.quadraticCurveTo(0, size, 0, size - r);
          ctx.lineTo(0, r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.closePath();
          ctx.clip();
        }
        
        // Dibujar imagen centrada y cubriendo todo
        const scale = Math.max(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        // Agregar borde sutil
        ctx.strokeStyle = makeCircular ? '#e0e0e0' : '#d0d0d0';
        ctx.lineWidth = 2;
        if (makeCircular) {
          ctx.beginPath();
          ctx.arc(size/2, size/2, size/2 - 1, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          const r = 15;
          ctx.beginPath();
          ctx.moveTo(r, 1);
          ctx.lineTo(size - r, 1);
          ctx.quadraticCurveTo(size - 1, 1, size - 1, r);
          ctx.lineTo(size - 1, size - r);
          ctx.quadraticCurveTo(size - 1, size - 1, size - r, size - 1);
          ctx.lineTo(r, size - 1);
          ctx.quadraticCurveTo(1, size - 1, 1, size - r);
          ctx.lineTo(1, r);
          ctx.quadraticCurveTo(1, 1, r, 1);
          ctx.stroke();
        }
        
        const dataUrl = canvas.toDataURL('image/png');
        console.log('✅ Logo procesado con estilo');
        resolve(dataUrl);
      } catch (err) {
        console.log('❌ Error canvas:', err.message);
        resolve(null);
      }
    };
    
    img.onerror = () => {
      console.log('❌ Error cargando imagen:', fullUrl);
      resolve(null);
    };
    
    const separator = fullUrl.includes('?') ? '&' : '?';
    img.src = `${fullUrl}${separator}_t=${Date.now()}`;
    setTimeout(() => resolve(null), 5000);
  });
}

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function todayColombia() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function formatDateES(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const names = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  return `${names[date.getDay()]}, ${d} de ${MONTHS_ES[m - 1]}`;
}

// ─── Mini Calendario para Rango ──────────────────────────────────────────────

function RangeCalendarPicker({ startValue, endValue, onStartChange, onEndChange, onClose }) {
  const { colors } = useTheme();
  const today = todayColombia();
  const [y, m] = today.split('-').map(Number);
  const [viewYear, setViewYear] = useState(startValue ? parseInt(startValue.split('-')[0]) : y);
  const [viewMonth, setViewMonth] = useState(startValue ? parseInt(startValue.split('-')[1]) - 1 : m - 1);

  const days = useMemo(() => buildCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(v => v - 1); setViewMonth(11); }
    else setViewMonth(v => v - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(v => v + 1); setViewMonth(0); }
    else setViewMonth(v => v + 1);
  };

  const isPast = (day) => {
    if (!day) return true;
    const dd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dd < today;
  };

  const isInRange = (day) => {
    if (!day || !startValue || !endValue) return false;
    const dd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dd >= startValue && dd <= endValue;
  };

  const isStart = (day) => {
    if (!day || !startValue) return false;
    const dd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dd === startValue;
  };

  const isEnd = (day) => {
    if (!day || !endValue) return false;
    const dd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dd === endValue;
  };

  const handleDay = (day) => {
    if (!day) return;
    const dd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (!startValue) {
      onStartChange(dd);
    } else if (!endValue) {
      if (dd >= startValue) {
        onEndChange(dd);
      } else {
        onStartChange(dd);
        onEndChange(startValue);
      }
    } else {
      onStartChange(dd);
      onEndChange('');
    }
  };

  const canGoPrev = () => true;

  return (
    <div style={{
      background: colors.cardBg, borderRadius: 14, padding: 20, userSelect: 'none',
      maxWidth: 340, width: '100%', boxShadow: `0 4px 12px ${colors.shadow}`, border: `1px solid ${colors.border}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button type="button" onClick={prevMonth} disabled={!canGoPrev()}
          style={{ background: 'none', border: 'none', cursor: canGoPrev() ? 'pointer' : 'not-allowed', color: canGoPrev() ? 'var(--primary)' : colors.border, padding: 4 }}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>
          {MONTHS_ES[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={nextMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 4 }}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAYS_ES.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: colors.textSecondary, padding: '2px 0' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 16 }}>
        {days.map((day, i) => {
          const start = isStart(day);
          const end = isEnd(day);
          const inRange = isInRange(day);
          return (
            <div key={i} onClick={() => handleDay(day)}
              style={{
                textAlign: 'center', padding: '7px 2px', borderRadius: 6, fontSize: 12,
                fontWeight: start || end ? 700 : 400,
                cursor: day ? 'pointer' : 'default',
                background: start || end ? 'var(--primary)' : inRange ? 'var(--primary-bg)' : 'transparent',
                color: !day ? 'transparent' : start || end ? 'white' : inRange ? 'var(--primary)' : colors.text,
              }}>
              {day || ''}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center' }}>
        {startValue && endValue ? (
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>✓ {formatDateES(startValue)} a {formatDateES(endValue)}</span>
        ) : startValue ? (
          <span style={{ color: 'var(--warning)' }}>Selecciona fecha final</span>
        ) : (
          <span>Selecciona fecha inicial</span>
        )}
      </div>
    </div>
  );
}

function getDateRange(period, customStart, customEnd) {
  const todayStr = todayColombia();
  const now = new Date(`${todayStr}T00:00:00-05:00`);

  if (period === 'day') {
    const s = new Date(now);
    const e = new Date(now); e.setHours(23, 59, 59, 999);
    return { start: s, end: e, label: 'Hoy' };
  }
  if (period === 'week') {
    const s = new Date(now); s.setDate(now.getDate() - now.getDay());
    const e = new Date(s); e.setDate(s.getDate() + 6); e.setHours(23, 59, 59, 999);
    return { start: s, end: e, label: 'Esta semana' };
  }
  if (period === 'month') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start: s, end: e, label: 'Este mes' };
  }
  if (period === 'custom' && customStart && customEnd) {
    return {
      start: new Date(`${customStart}T00:00:00-05:00`),
      end:   new Date(`${customEnd}T23:59:59-05:00`),
      label: `${formatDateES(customStart)} → ${formatDateES(customEnd)}`,
    };
  }
  return null;
}

export default function Reports() {
  const { business, mainBusiness, branches: authBranches } = useAuth();
  const [period, setPeriod]         = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd]     = useState('');
  const [showRangeCalendar, setShowRangeCalendar] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState('active');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  const [error, setError]               = useState('');
  const [activeTab, setActiveTab]       = useState('overview');
  const [isMobile, setIsMobile]         = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 480 : false);
  const [detailPage, setDetailPage]       = useState(1); // PAGINACIÓN
  const [businessWithLogo, setBusinessWithLogo] = useState(business); // Negocio con logoUrl
  const ITEMS_PER_PAGE = 5; // 5 citas por página

  // Estados para informe financiero completo
  const [showFullFinancial, setShowFullFinancial] = useState(false);
  const [financialReport, setFinancialReport] = useState(null);
  const [loadingFinancial, setLoadingFinancial] = useState(false);
  const [enabledModules, setEnabledModules] = useState({ expenses: false, inventory: false, deposits: false });

  useEffect(() => {
    setBusinessWithLogo(business);
  }, [business]);

  const range = getDateRange(period, customStart, customEnd);

  // Cargar datos automáticamente cuando cambia el período o las fechas personalizadas
  useEffect(() => {
    if (business?.id && range && range.start && range.end) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, customStart, customEnd, selectedBranchId, business?.id]);

  const loadData = async () => {
    if (!business?.id || !range) return;
    setLoading(true);
    setError('');
    try {
      let url = `/appointments?businessId=${business.id}`;
      
      // Si el usuario quiere ver todas las sucursales (consolidado)
      if (selectedBranchId === 'all') {
        url = `/appointments/consolidated`;
      } else if (selectedBranchId === 'main') {
        url = `/appointments?businessId=${mainBusiness.id}`;
      } else if (selectedBranchId !== 'active') {
        // Por si acaso se elige una sucursal específica desde el selector interno de reportes
        url = `/appointments?businessId=${selectedBranchId}`;
      }

      const res = await api.get(url);
      const all = res.data;
      const filtered = all.filter(a => {
        const d = new Date(a.startTime);
        return d >= range.start && d <= range.end;
      });
      setAppointments(filtered);

      // Si el modo financiero completo está activado, cargar el informe financiero
      if (showFullFinancial && period === 'month') {
        await loadFinancialReport();
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar el informe financiero completo
  const loadFinancialReport = async () => {
    if (!business?.id || !range) return;
    
    setLoadingFinancial(true);
    try {
      const year = range.start.getFullYear();
      const month = String(range.start.getMonth() + 1).padStart(2, '0');
      
      const res = await api.get('/financial-report', {
        params: {
          businessId: business.id,
          year,
          month
        }
      });
      
      setFinancialReport(res.data);
      setEnabledModules(res.data.enabledModules || {});
    } catch (e) {
      console.error('Error cargando informe financiero:', e);
    } finally {
      setLoadingFinancial(false);
    }
  };

  useEffect(() => { loadData(); }, [business, period, customStart, customEnd, selectedBranchId, showFullFinancial]);
  
  // Reset página cuando cambian las citas
  useEffect(() => { setDetailPage(1); }, [appointments]);

  // Escuchar cambios de tamaño para ajustar gráficos en móvil
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      setIsMobile(window.innerWidth <= 480);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Estadísticas - CORREGIDO: calcular ganancia correctamente incluyendo cargos adicionales
  const done       = appointments.filter(a => a.status === 'done');
  const totalRev   = done.reduce((s, a) => s + parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0), 0);
  // La ganancia del dueño es lo que queda después de pagar al empleado
  const empRev     = done.reduce((s, a) => {
    const basePrice = parseFloat(a.Service?.price || 0);
    const additional = parseFloat(a.additionalAmount || 0);
    const totalPrice = basePrice + additional;
    const commPct = parseFloat(a.Employee?.commissionPct || 0);
    const earned = a.employeeEarns ? parseFloat(a.employeeEarns) : (totalPrice * commPct / 100);
    return s + (isNaN(earned) ? 0 : earned);
  }, 0);
  const ownerRev   = totalRev - empRev; // Ganancia real del negocio

  // Si hay informe financiero completo, usar esos valores
  const financialData = financialReport?.summary || {};
  const displayIncome = showFullFinancial ? (financialData.totalIncome || 0) : totalRev;
  const displayExpenses = showFullFinancial ? (financialData.totalExpenses || 0) : 0;
  const displayInventory = showFullFinancial ? (financialData.inventoryCost || 0) : 0;
  const displayNetProfit = showFullFinancial ? (financialData.netProfit || 0) : ownerRev;
  const displayMargin = showFullFinancial ? (financialData.margin || 0) : (totalRev > 0 ? (ownerRev / totalRev) * 100 : 0);

  // PAGINACIÓN - Calcular citas a mostrar (5 por página)
  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = appointments.slice(
    (detailPage - 1) * ITEMS_PER_PAGE,
    detailPage * ITEMS_PER_PAGE
  );

  // Datos para gráficas
  const byStatus = Object.entries(
    appointments.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {})
  ).map(([status, count]) => ({ name: STATUS_LABELS[status] || status, value: count }));

  const byEmployee = Object.entries(
    done.reduce((acc, a) => {
      const name = a.Employee?.User?.name || 'Sin asignar';
      if (!acc[name]) acc[name] = { name, citas: 0, ingresos: 0 };
      acc[name].citas++;
      acc[name].ingresos += (parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0));
      return acc;
    }, {})
  ).map(([, v]) => v);

  const byService = Object.entries(
    done.reduce((acc, a) => {
      const name = a.Service?.name || 'Sin servicio';
      if (!acc[name]) acc[name] = { name, count: 0, revenue: 0 };
      acc[name].count++;
      acc[name].revenue += (parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0));
      return acc;
    }, {})
  ).map(([, v]) => v).sort((a, b) => b.revenue - a.revenue);

  const downloadPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    
    // Color scheme - profesional y sobrio
    const colors = {
      primary: [60, 60, 60],      // Gris oscuro
      secondary: [100, 100, 100], // Gris medio
      light: [240, 240, 240],     // Gris claro
      white: [255, 255, 255],
      black: [30, 30, 30],
      accent: [79, 70, 229],      // Indigo sutil
    };
    
    let yPos = 20;
    
    // Logo (izquierda) + Info del negocio (derecha)
    console.log('📷 Logo URL:', businessWithLogo?.logoUrl);
    if (businessWithLogo?.logoUrl) {
      try {
        const logoData = await loadLogoImage(businessWithLogo.logoUrl, false); // false = esquinas redondeadas, true = circular
        console.log('📷 Logo data length:', logoData ? logoData.length : 0);
        if (logoData) {
          // El logo ya viene procesado con estilo desde el canvas
          doc.addImage(logoData, 'PNG', margin, 10, 26, 26);
          console.log('📷 Logo added to PDF with style');
        }
      } catch (e) {
        console.log('❌ Logo error:', e);
      }
    } else {
      console.log('⚠️ No logoUrl found in businessWithLogo');
    }
    
    // Título del negocio - alineado derecha
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...colors.black);
    doc.text(businessWithLogo?.name || business?.name || 'Mi Negocio', pageWidth - margin, yPos, { align: 'right' });
    
    // Subtítulo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...colors.secondary);
    doc.text('Informe de Actividad', pageWidth - margin, yPos + 7, { align: 'right' });
    
    // Período - formato corto para evitar desbordamiento
    doc.setFontSize(9);
    const periodLabel = range?.start && range?.end 
      ? `${range.start.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })} - ${range.end.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}`
      : (range?.label || '');
    doc.text(periodLabel, pageWidth - margin, yPos + 13, { align: 'right' });
    
    // Línea separadora elegante
    yPos = 40;
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    // Sección: Resumen
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...colors.black);
    doc.text('Resumen del Período', margin, yPos);
    
    // Tabla de resumen con estilo limpio
    yPos += 8;
    const summaryBody = [
      ['Total citas', appointments.length.toString()],
      ['Citas completadas', done.length.toString()],
      ['Citas pendientes', appointments.filter(a => a.status === 'pending').length.toString()],
      ['Citas canceladas', appointments.filter(a => a.status === 'cancelled').length.toString()],
    ];

    if (!business?.isTechnicalServices && !business?.hasFieldTechnicians) {
      summaryBody.push(['Ingresos totales', fmt(totalRev)]);
      summaryBody.push(['Ganancia del negocio', fmt(ownerRev)]);
      summaryBody.push(['Pago a empleados', fmt(empRev)]);
    }

    // === SECCIÓN: INFORME FINANCIERO COMPLETO (si está activado) ===
    if (showFullFinancial && period === 'month' && financialReport && !business?.isTechnicalServices) {
      summaryBody.push(['', '']); // Fila vacía como separador
      summaryBody.push(['─── INFORME FINANCIERO COMPLETO ───', '']);
      summaryBody.push(['Ingresos por Citas', fmt(financialReport.summary.totalIncome || 0)]);
      
      if (enabledModules.inventory) {
        summaryBody.push(['Costo de Insumos', fmt(financialReport.summary.inventoryCost || 0)]);
      }
      
      if (enabledModules.expenses) {
        summaryBody.push(['Gastos Operativos', fmt(financialReport.summary.totalExpenses || 0)]);
      }
      
      summaryBody.push(['Utilidad Neta', fmt(financialReport.summary.netProfit || 0)]);
      
      if (enabledModules.deposits && financialReport?.details?.deposits?.totalHeld > 0) {
        summaryBody.push(['Depósitos Retenidos', fmt(financialReport.details.deposits.totalHeld)]);
      }
    }

    autoTable(doc, {
      startY: yPos,
      head: [['Métrica', 'Valor']],
      body: summaryBody,
      theme: 'plain',
      headStyles: {
        fillColor: colors.light,
        textColor: colors.black,
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: colors.black,
      },
      columnStyles: {
        0: { fontStyle: 'normal', cellWidth: 60 },
        1: { fontStyle: 'bold', halign: 'right' },
      },
      styles: {
        cellPadding: 5,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      margin: { left: margin, right: margin },
    });
    
    // === SECCIÓN: RESUMEN DE PAGOS A EMPLEADOS ===
    // Calcular cuánto se le debe pagar a cada empleado
    const employeePayments = done.reduce((acc, a) => {
      const name = a.Employee?.User?.name || 'Sin asignar';
      const basePrice = parseFloat(a.Service?.price || 0);
      const additional = parseFloat(a.additionalAmount || 0);
      const totalPrice = basePrice + additional;
      const commPct = parseFloat(a.Employee?.commissionPct || 0);
      const earned = a.employeeEarns ? parseFloat(a.employeeEarns) : (totalPrice * commPct / 100);
      
      if (!acc[name]) {
        acc[name] = { name, citas: 0, total: 0 };
      }
      acc[name].citas++;
      acc[name].total += isNaN(earned) ? 0 : earned;
      return acc;
    }, {});

    const employeeList = Object.values(employeePayments);
    
    if (employeeList.length > 0) {
      yPos = doc.lastAutoTable.finalY + 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...colors.black);
      doc.text((business?.isTechnicalServices || business?.hasFieldTechnicians) ? 'Citas por Empleado' : 'Resumen de Pagos a Empleados', margin, yPos);
      
      yPos += 8;
      const empHead = (business?.isTechnicalServices || business?.hasFieldTechnicians)
        ? [['Empleado', 'Citas completadas']]
        : [['Empleado', 'Citas completadas', 'Total a pagar']];
      
      const empBody = employeeList.map(emp => {
        const row = [emp.name, emp.citas.toString()];
        if (!business?.isTechnicalServices && !business?.hasFieldTechnicians) row.push(fmt(emp.total));
        return row;
      });

      const empFoot = (business?.isTechnicalServices || business?.hasFieldTechnicians)
        ? [['TOTAL', done.length.toString()]]
        : [['TOTAL', done.length.toString(), fmt(empRev)]];

      autoTable(doc, {
        startY: yPos,
        head: empHead,
        body: empBody,
        foot: empFoot,
        theme: 'plain',
        headStyles: {
          fillColor: colors.light,
          textColor: colors.black,
          fontStyle: 'bold',
          fontSize: 10,
        },
        bodyStyles: {
          fontSize: 10,
          textColor: colors.black,
        },
        footStyles: {
          fillColor: [220, 220, 220],
          textColor: colors.black,
          fontStyle: 'bold',
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: (business?.isTechnicalServices || business?.hasFieldTechnicians) ? 130 : 80 },
          1: { cellWidth: 50, halign: 'center' },
          ...((business?.isTechnicalServices || business?.hasFieldTechnicians) ? {} : { 2: { cellWidth: 50, halign: 'right', fontStyle: 'bold' } }),
        },
        styles: {
          cellPadding: 5,
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
        },
        margin: { left: margin, right: margin },
      });
    }

    // Sección: Detalle de citas
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...colors.black);
    doc.text('Detalle de Citas', margin, yPos);
    
    const appointmentsHead = (business?.isTechnicalServices || business?.hasFieldTechnicians)
      ? [['Fecha', 'Cliente', 'Servicio', 'Empleado', 'Estado']]
      : [['Fecha', 'Cliente', 'Servicio', 'Empleado', 'Precio', 'Adicional', 'Pago', 'Estado']];
    
    const appointmentsBody = appointments.map(a => {
      const row = [
        new Date(a.startTime).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bogota' }),
        a.clientName || '',
        a.Service?.name || '',
        a.Employee?.User?.name || '',
      ];
      if (!business?.isTechnicalServices && !business?.hasFieldTechnicians) {
        const base = parseFloat(a.Service?.price || 0);
        const add = parseFloat(a.additionalAmount || 0);
        row.push(fmt(base));
        row.push(fmt(add));
        // Traducir método de pago para el PDF
        const pm = a.paymentMethod === 'cash' ? 'Efectivo' : a.paymentMethod === 'transfer' ? 'Transf.' : '-';
        row.push(pm);
      }
      row.push(STATUS_LABELS[a.status] || a.status);
      return row;
    });

    autoTable(doc, {
      startY: yPos,
      head: appointmentsHead,
      body: appointmentsBody,
      theme: 'plain',
      headStyles: {
        fillColor: colors.light,
        textColor: colors.black,
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: colors.black,
      },
      columnStyles: business?.isTechnicalServices ? {
        0: { cellWidth: 35 },
        1: { cellWidth: 40 },
        2: { cellWidth: 45 },
        3: { cellWidth: 35 },
        4: { cellWidth: 25, halign: 'center' },
      } : {
        0: { cellWidth: 24 },
        1: { cellWidth: 26 },
        2: { cellWidth: 28 },
        3: { cellWidth: 26 },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 22, halign: 'right' },
        6: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
        7: { cellWidth: 20, halign: 'center' },
      },
      styles: {
        cellPadding: 4,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
        overflow: 'linebreak',
      },
      margin: { left: margin, right: margin },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
    });
    
    // Footer con línea decorativa
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setDrawColor(...colors.light);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.secondary);
    doc.text(`Generado el ${new Date().toLocaleString('es-CO')} • K-Dice Reservas`, margin, footerY);
    
    // Usar savePDF para compatibilidad con APK
    await savePDF(doc, `informe-${period}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const downloadExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Hoja de Resumen
      const summaryData = [
        { 'Métrica': 'Total de citas', 'Valor': appointments.length },
        { 'Métrica': 'Citas completadas', 'Valor': done.length },
        { 'Métrica': 'Citas pendientes', 'Valor': appointments.filter(a => a.status === 'pending').length },
        { 'Métrica': 'Citas canceladas', 'Valor': appointments.filter(a => a.status === 'cancelled').length },
      ];
      
      if (!business?.isTechnicalServices && !business?.hasFieldTechnicians) {
        summaryData.push({ 'Métrica': 'Ingresos totales', 'Valor': totalRev });
        summaryData.push({ 'Métrica': 'Ganancia del negocio', 'Valor': ownerRev });
        summaryData.push({ 'Métrica': 'Pago a empleados', 'Valor': empRev });
      }

      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

      // === HOJA: INFORME FINANCIERO COMPLETO (si está activado) ===
      if (showFullFinancial && period === 'month' && financialReport && !business?.isTechnicalServices && !business?.hasFieldTechnicians) {
        const financialData = [
          { 'Concepto': 'Ingresos por Citas Completadas', 'Monto': financialReport.summary.totalIncome || 0 },
          { 'Concepto': '', 'Monto': '' }, // Separador
          { 'Concepto': 'COSTOS Y GASTOS:', 'Monto': '' },
        ];
        
        if (enabledModules.inventory && financialReport.summary.inventoryCost > 0) {
          financialData.push({ 'Concepto': '  - Costo de Insumos Consumidos', 'Monto': -(financialReport.summary.inventoryCost || 0) });
        }
        
        if (enabledModules.expenses && financialReport.summary.totalExpenses > 0) {
          financialData.push({ 'Concepto': '  - Gastos Operativos', 'Monto': -(financialReport.summary.totalExpenses || 0) });
          
          // Desglose de gastos por categoría
          const expenseCategories = {
            arriendo: '    🏠 Arriendo',
            servicios: '    💡 Servicios',
            insumos: '    📦 Insumos (compra)',
            nomina: '    👥 Nómina',
            marketing: '    📢 Marketing',
            otros: '    📋 Otros'
          };
          
          Object.entries(financialReport?.details?.expenses?.byCategory || {}).forEach(([category, amount]) => {
            financialData.push({ 
              'Concepto': expenseCategories[category] || `    ${category}`, 
              'Monto': -(amount || 0) 
            });
          });
        }
        
        financialData.push({ 'Concepto': '', 'Monto': '' }); // Separador
        financialData.push({ 
          'Concepto': 'UTILIDAD NETA', 
          'Monto': financialReport.summary.netProfit || 0,
          '_style': { font: { bold: true } }
        });
        
        if (enabledModules.deposits && financialReport?.details?.deposits?.totalHeld > 0) {
          financialData.push({ 'Concepto': '', 'Monto': '' }); // Separador
          financialData.push({ 'Concepto': 'FLUJO DE CAJA:', 'Monto': '' });
          financialData.push({ 
            'Concepto': '+ Depósitos Retenidos (no aplicados)', 
            'Monto': financialReport.details.deposits.totalHeld 
          });
        }
        
        const wsFinancial = XLSX.utils.json_to_sheet(financialData);
        XLSX.utils.book_append_sheet(wb, wsFinancial, 'Informe Financiero');
      }

      // Hoja de Detalle
      const detailData = appointments.map(a => {
        const row = {
          'Fecha': new Date(a.startTime).toLocaleString('es-CO'),
          'Cliente': a.clientName || '',
          'Servicio': a.Service?.name || '',
          'Empleado': a.Employee?.User?.name || '',
        };
        if (!business?.isTechnicalServices && !business?.hasFieldTechnicians) {
          row['Precio Base'] = parseFloat(a.Service?.price || 0);
          row['Adicional'] = parseFloat(a.additionalAmount || 0);
          row['Total'] = parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0);
          row['Método de Pago'] = a.status === 'done' ? (a.paymentMethod === 'cash' ? 'Efectivo' : a.paymentMethod === 'transfer' ? 'Transferencia' : '—') : '—';
        }
        row['Estado'] = STATUS_LABELS[a.status] || a.status;
        return row;
      });
      const wsDetail = XLSX.utils.json_to_sheet(detailData);
      XLSX.utils.book_append_sheet(wb, wsDetail, 'Detalle de Citas');

      saveExcel(wb, `informe-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Error generando Excel:', error);
      showToast('Error al generar Excel', 'error');
    }
  };

  // Función para descargar reporte de seguimiento de técnicos
  const downloadTrackingReport = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Datos de seguimiento
      const trackingData = appointments
        .filter(a => a.technicianStatus && a.technicianStatus !== 'not_started')
        .sort((a, b) => new Date(b.travelStartTime || b.startTime) - new Date(a.travelStartTime || a.startTime))
        .map(apt => ({
          'Fecha Cita': new Date(apt.startTime).toLocaleString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          'Cliente': apt.clientName,
          'Teléfono': apt.clientPhone,
          'Servicio': apt.Service?.name || '-',
          'Empleado': apt.Employee?.User?.name || '-',
          'Estado': STATUS_LABELS[apt.status]?.label || apt.status,
          '🚗 En Camino': apt.travelStartTime 
            ? new Date(apt.travelStartTime).toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
            : '-',
          '📍 Llegada': apt.arrivalTime 
            ? new Date(apt.arrivalTime).toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
            : '-',
          '🔧 Inicio Servicio': apt.serviceStartTime 
            ? new Date(apt.serviceStartTime).toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
            : '-',
          '✅ Completado': apt.status === 'done' ? 'Sí' : 'No',
          '❌ Cancelado': apt.status === 'cancelled' ? 'Sí' : 'No',
          'Insumos': apt.workReport?.partsUsed?.map(p => `${p.name}: ${p.quantity} ${p.unit}`).join(', ') || '-',
          'Diagnóstico': apt.workReport?.diagnosis || '-',
          'Solución': apt.workReport?.solution || '-',
        }));

      const wsTracking = XLSX.utils.json_to_sheet(trackingData);
      XLSX.utils.book_append_sheet(wb, wsTracking, 'Seguimiento Técnicos');

      saveExcel(wb, `seguimiento-tecnicos-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`);
      showToast('Reporte de seguimiento descargado', 'success');
    } catch (error) {
      console.error('Error generando reporte de seguimiento:', error);
      showToast('Error al generar reporte', 'error');
    }
  };

  return (
    <AdminLayout title="Informes" subtitle="Análisis de actividad y finanzas">
      {/* Toast sutil */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: toast.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: toast.type === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}
      <style>{`
        .reports-page {
          width: 100%;
          max-width: 100vw;
          overflow-x: clip;
        }
        .reports-page .card,
        .reports-page .grid-stats {
          min-width: 0;
          width: 100%;
          max-width: 100%;
        }
        .reports-page .reports-chart {
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }
        /* Filtros y acciones más fluidos en pantallas pequeñas */
        @media (max-width: 768px) {
          .reports-filter-row {
            align-items: stretch !important;
            flex-direction: column;
          }
          .reports-actions-right {
            margin-left: 0 !important;
            width: 100%;
            justify-content: space-between;
          }
        }
        @media (max-width: 640px) {
          /* En móvil usamos selector en vez de tabs */
          .reports-tabs-row { display: none !important; }
          .reports-tab-select { display: block !important; }
          .reports-chart {
            height: 220px !important;
            max-width: 100%;
            overflow: hidden;
            margin-left: auto;
            margin-right: auto;
          }
          .reports-filter-row {
            align-items: stretch !important;
            flex-direction: column;
          }
          .reports-period-buttons {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 6px;
            max-width: 100%;
          }
          .reports-period-buttons::-webkit-scrollbar { height: 6px; }
          .reports-period-buttons button { flex: 0 0 auto; }
          .reports-actions-right {
            width: 100%;
            justify-content: space-between;
          }
          .reports-actions-right button, .reports-actions-right a {
            flex: 1;
            justify-content: center;
          }
        }
        @media (max-width: 480px) {
          .reports-filter-row > * {
            width: 100% !important;
            min-width: 0 !important;
          }
          .reports-period-buttons {
            flex-wrap: wrap;
            overflow-x: visible;
          }
          .reports-actions-right {
            flex-direction: column;
            gap: 8px;
          }
          .reports-actions-right button,
          .reports-actions-right a {
            width: 100%;
            flex: none;
          }
          /* Evitar que botones globales nowrap empujen el ancho en esta vista */
          .reports-page button {
            white-space: normal;
          }
        }
        @media (max-width: 360px) {
          .reports-actions-right {
            flex-direction: column;
          }
          .reports-actions-right button, .reports-actions-right a { width: 100%; }
        }
        @media (min-width: 641px) {
          .reports-tab-select { display: none !important; }
          .reports-desktop-only { display: block !important; }
          .reports-mobile-only { display: none !important; }
        }
        @media (max-width: 640px) {
          .reports-desktop-only { display: none !important; }
          .reports-mobile-only { display: block !important; }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="reports-page">
        {/* FILTROS */}
        <div className="card mb-6">
        <div className="reports-filter-row" style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--gray-700)' }}>
              Período
            </label>
            <div className="reports-period-buttons" style={{ display: 'flex', gap: 8 }}>
              {[
                { value: 'day',   label: 'Hoy' },
                { value: 'week',  label: 'Semana' },
                { value: 'month', label: 'Mes' },
                { value: 'custom', label: 'Personalizado' }
              ].map(p => (
                <button
                  key={p.value}
                  className={period === p.value ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 16px', fontSize: 13, minWidth: 80, whiteSpace: 'nowrap' }}
                  onClick={() => {
                    setPeriod(p.value);
                    if (p.value === 'custom') {
                      setShowRangeCalendar(true);
                    } else {
                      setShowRangeCalendar(false);
                    }
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* FILTRO DE SUCURSALES (Solo si hay sucursales) */}
          {authBranches.length > 0 && (
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--gray-700)' }}>
                Sucursal
              </label>
              <select 
                className="form-input" 
                style={{ height: 42, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
              >
                <option value="active">📍 Sede Actual ({business?.name})</option>
                <option value="all">🌎 Todas las sucursales (Consolidado)</option>
                <option value="main">🏠 Sede Principal ({mainBusiness?.name})</option>
                {authBranches.map(b => (
                  <option key={b.id} value={b.id}>🏢 {b.name}</option>
                ))}
              </select>
            </div>
          )}

          <button className="btn-ghost btn-sm" onClick={loadData} disabled={loading} style={{ alignSelf: 'flex-end', height: 42 }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Actualizar
          </button>

          <div className="reports-actions-right" style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn-outline btn-sm" onClick={downloadPDF} disabled={!appointments.length}>
              <Download size={14} /> PDF
            </button>
            <button className="btn-success btn-sm" onClick={downloadExcel} disabled={!appointments.length} style={{ color: 'white' }}>
              <FileSpreadsheet size={14} /> Excel
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de fechas para período personalizado */}
      {period === 'custom' && (customStart || customEnd) && !showRangeCalendar && (
        <div 
          onClick={() => setShowRangeCalendar(true)}
          style={{ 
            marginBottom: 16, 
            padding: '12px 16px', 
            background: 'var(--primary-light)', 
            borderRadius: 8, 
            border: '1px dashed var(--primary)',
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--primary)' }}>
            <Calendar size={16} />
            <span>
              {customStart && customEnd 
                ? `${formatDateES(customStart)} → ${formatDateES(customEnd)}`
                : customStart 
                  ? `Desde: ${formatDateES(customStart)} (selecciona fecha final)`
                  : 'Haz clic para seleccionar fechas'
              }
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>Cambiar fechas →</span>
        </div>
      )}

      {showRangeCalendar && period === 'custom' && (
        <div style={{ marginBottom: 20, padding: 16, background: 'var(--card-bg)', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'center' }}>
          <RangeCalendarPicker
            startValue={customStart}
            endValue={customEnd}
            onStartChange={setCustomStart}
            onEndChange={setCustomEnd}
            onClose={() => setShowRangeCalendar(false)}
          />
        </div>
        )}

        {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

        {loading ? (
          <div className="loading-page"><div className="spinner" /><span>Cargando datos...</span></div>
        ) : (
          <>
            {/* KPIs - DISEÑO COMPACTO */}
            <div className="grid-stats mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {/* Total citas */}
              <div className="stat-card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={16} color="#8b5cf6" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Total citas</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>{appointments.length}</div>
                  </div>
                </div>
              </div>

              {/* Citas completadas */}
              <div className="stat-card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={16} color="#10b981" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Completadas</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>{done.length}</div>
                  </div>
                </div>
              </div>

              {!business?.isTechnicalServices && !business?.hasFieldTechnicians ? (
                <>
                  {/* Ingresos totales */}
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DollarSign size={16} color="#3b82f6" />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Ingresos</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6' }}>{fmt(totalRev)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Ganancia del negocio */}
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={16} color="#14b8a6" />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Ganancia</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#14b8a6' }}>{fmt(ownerRev)}</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Citas pendientes */}
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={16} color="#f59e0b" />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Pendientes</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>{appointments.filter(a => a.status === 'pending').length}</div>
                      </div>
                    </div>
                  </div>

                  {/* Citas canceladas */}
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <XCircle size={16} color="#ef4444" />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Canceladas</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>{appointments.filter(a => a.status === 'cancelled').length}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* TOGGLE: Informe Financiero Completo (solo para periodo Mes) - DISEÑO COMPACTO */}
            {period === 'month' && (
              <div className="card mb-4" style={{ padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ 
                      width: 32, height: 32, borderRadius: 8, 
                      background: showFullFinancial ? '#ecfdf5' : '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <TrendingUp size={16} color={showFullFinancial ? '#10b981' : '#6b7280'} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                        {showFullFinancial ? '📊 Financiero Completo' : '📋 Solo Citas'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {showFullFinancial 
                          ? 'Incluye ingresos, gastos, insumos y depósitos'
                          : 'Estadísticas de citas sin costos'
                        }
                      </div>
                    </div>
                  </div>
                  
                  <label style={{
                    position: 'relative', display: 'inline-block', width: 44, height: 24,
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={showFullFinancial}
                      onChange={(e) => setShowFullFinancial(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: showFullFinancial ? '#10b981' : '#d1d5db',
                      borderRadius: 24, transition: '0.3s'
                    }}/>
                    <span style={{
                      position: 'absolute', height: 18, width: 18, left: 3, bottom: 3,
                      backgroundColor: 'white', borderRadius: '50%', transition: '0.3s',
                      transform: showFullFinancial ? 'translateX(20px)' : 'translateX(0)'
                    }}/>
                  </label>
                </div>

                {/* Mostrar estado de módulos - COMPACTO */}
                {showFullFinancial && (
                  <div style={{ marginTop: 10, padding: 8, background: '#f8fafc', borderRadius: 6 }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11 }}>
                      <span style={{ color: enabledModules.expenses ? '#10b981' : '#9ca3af' }}>
                        {enabledModules.expenses ? '✓' : '✗'} Gastos
                      </span>
                      <span style={{ color: enabledModules.inventory ? '#10b981' : '#9ca3af' }}>
                        {enabledModules.inventory ? '✓' : '✗'} Insumos
                      </span>
                      <span style={{ color: enabledModules.deposits ? '#10b981' : '#9ca3af' }}>
                        {enabledModules.deposits ? '✓' : '✗'} Depósitos
                      </span>
                    </div>
                    {(!enabledModules.expenses && !enabledModules.inventory && !enabledModules.deposits) && (
                      <div style={{ marginTop: 4, fontSize: 10, color: '#f59e0b' }}>
                        ⚠️ Activa módulos en "Mi Negocio → Módulos"
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* KPIs FINANCIERAS - DISEÑO COMPACTO */}
            {showFullFinancial && period === 'month' && (
              <div className="grid-stats mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {/* Ingresos */}
                <div className="stat-card" style={{ borderLeft: '3px solid #3b82f6', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign size={14} color="#3b82f6" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Ingresos</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6' }}>{fmt(displayIncome)}</div>
                    </div>
                  </div>
                </div>

                {/* Costo de Insumos */}
                {enabledModules.inventory && (
                  <div className="stat-card" style={{ borderLeft: '3px solid #8b5cf6', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                        📦
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Insumos</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6' }}>{fmt(displayInventory)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gastos Operativos */}
                {enabledModules.expenses && (
                  <div className="stat-card" style={{ borderLeft: '3px solid #ef4444', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                        📉
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Gastos</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>{fmt(financialReport?.details?.expenses?.total || 0)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Utilidad Neta */}
                <div className="stat-card" style={{ borderLeft: '3px solid #10b981', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={14} color="#10b981" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Utilidad Neta</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{fmt(displayNetProfit)}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af' }}>{(displayMargin || 0).toFixed(1)}% margen</div>
                    </div>
                  </div>
                </div>

                {/* Depósitos Retenidos */}
                {enabledModules.deposits && financialReport?.details?.deposits?.totalHeld > 0 && (
                  <div className="stat-card" style={{ borderLeft: '3px solid #f59e0b', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                        🏦
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Depósitos</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>{fmt(financialReport.details.deposits.totalHeld)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DETALLE FINANCIERO - DISEÑO COMPACTO */}
            {showFullFinancial && period === 'month' && financialReport && (
              <div className="card mb-4" style={{ padding: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={16} color="#3b82f6" />
                  Detalle Financiero - {MONTHS_ES[parseInt(financialReport.period.month) - 1]} {financialReport.period.year}
                </h3>

                {/* Tabla de resumen - COMPACTA */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Concepto</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{ color: '#3b82f6', fontWeight: 600 }}>+</span> Ingresos por Citas
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#3b82f6', fontWeight: 600 }}>
                          {fmt(financialData.totalIncome)}
                        </td>
                      </tr>
                      
                      {enabledModules.inventory && financialData.inventoryCost > 0 && (
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 10px', paddingLeft: 20 }}>
                            <span style={{ color: '#8b5cf6' }}>-</span> Costo Insumos
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: '#8b5cf6' }}>
                            -{fmt(financialData.inventoryCost)}
                          </td>
                        </tr>
                      )}
                      
                      {enabledModules.expenses && financialData.totalExpenses > 0 && (
                        <>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '6px 10px', paddingLeft: 20, color: 'var(--text-muted)', fontSize: 11 }}>
                              <em>Gastos:</em>
                            </td>
                            <td style={{ padding: '6px 10px' }}></td>
                          </tr>
                          {Object.entries(financialReport?.details?.expenses?.byCategory || {}).map(([category, amount]) => {
                            const categoryLabels = {
                              arriendo: '🏠 Arriendo',
                              servicios: '💡 Servicios',
                              insumos: '📦 Insumos',
                              nomina: '👥 Nómina',
                              marketing: '📢 Marketing',
                              otros: '📋 Otros'
                            };
                            return (
                              <tr key={category} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '6px 10px', paddingLeft: 32, fontSize: 12 }}>
                                  {categoryLabels[category] || category}
                                </td>
                                <td style={{ padding: '6px 10px', textAlign: 'right', fontSize: 12, color: '#ef4444' }}>
                                  -{fmt(amount)}
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      )}
                      
                      <tr style={{ background: '#f8fafc', borderTop: '2px solid var(--border)' }}>
                        <td style={{ padding: 10, fontWeight: 700, fontSize: 13 }}>
                          = UTILIDAD NETA
                        </td>
                        <td style={{ padding: 10, textAlign: 'right', fontWeight: 700, fontSize: 14, 
                          color: financialData.netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                          {fmt(financialData.netProfit)}
                        </td>
                      </tr>
                      
                      {enabledModules.deposits && financialReport?.details?.deposits?.totalHeld > 0 && (
                        <tr style={{ borderTop: '1px dashed var(--border)' }}>
                          <td style={{ padding: '8px 10px', color: '#f59e0b', fontSize: 12 }}>
                            <span style={{ fontWeight: 600 }}>+</span> Depósitos Retenidos
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: '#f59e0b', fontWeight: 600, fontSize: 12 }}>
                            {fmt(financialReport.details.deposits.totalHeld)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Nota al pie - COMPACTA */}
                <div style={{ marginTop: 12, padding: 8, background: '#f0f9ff', borderRadius: 6, fontSize: 11, color: '#0369a1' }}>
                  💡 Utilidad neta = Ingresos - Gastos - Insumos. Depósitos retenidos = anticipos sin aplicar.
                </div>
              </div>
            )}

            {/* TABS */}
            <div className="card mb-6">
            {/* Selector (solo móvil) */}
            <div className="reports-tab-select" style={{ display: 'none', marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                Vista
              </label>
              <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                <option value="overview">Resumen</option>
                <option value="employees">Por empleado</option>
                <option value="services">Por servicio</option>
              </select>
            </div>

            <div className="reports-tabs-row" style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
              {['overview', 'employees', 'services', ...(business?.hasFieldTechnicians ? ['tracking'] : [])].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '12px 20px', fontSize: 14, fontWeight: activeTab === tab ? 700 : 500,
                    color: activeTab === tab ? '#667eea' : '#718096',
                    borderBottom: activeTab === tab ? '2px solid #667eea' : '2px solid transparent',
                    background: 'none', borderLeft: 'none', borderTop: 'none', borderRight: 'none', cursor: 'pointer'
                  }}>
                  {tab === 'overview' && 'Resumen'}
                  {tab === 'employees' && 'Por empleado'}
                  {tab === 'services' && 'Por servicio'}
                  {tab === 'tracking' && '📍 Seguimiento'}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Estado de citas</h3>
                {byStatus.length > 0 ? (
                  <div className="reports-chart" style={{ height: isMobile ? 220 : 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                          data={byStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={isMobile ? undefined : ({ name, value }) => `${name}: ${value}`}
                          outerRadius={isMobile ? 70 : 80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                        {byStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                        <Tooltip />
                        {!isMobile && <Legend />}
                    </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#a0aec0' }}>Sin datos para mostrar</p>
                )}

                {/* Resumen/leyenda para móvil (evita labels cortados) */}
                {byStatus.length > 0 && (
                  <div className="reports-mobile-only" style={{ marginTop: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                      {byStatus.map((s, i) => (
                        <div
                          key={s.name}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            padding: '10px 12px',
                            borderRadius: 10,
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            minWidth: 0,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            <span style={{ width: 10, height: 10, borderRadius: 99, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.name}
                            </span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'employees' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Desempeño por empleado</h3>
                {byEmployee.length > 0 ? (
                  <div className="reports-chart" style={{ height: isMobile ? 220 : 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byEmployee} margin={{ top: 8, left: 0, right: 0, bottom: isMobile ? 48 : 32 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: isMobile ? 9 : 10 }}
                          interval={0}
                          angle={-35}
                          textAnchor="end"
                          height={isMobile ? 60 : 50}
                        />
                        <YAxis tick={{ fontSize: isMobile ? 9 : 10 }} />
                        <Tooltip />
                        {!isMobile && <Legend />}
                        <Bar dataKey="citas" fill="#667eea" name="Citas" />
                        {!business?.isTechnicalServices && !business?.hasFieldTechnicians && <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#a0aec0' }}>Sin datos para mostrar</p>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Servicios más populares</h3>
                {byService.length > 0 ? (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {byService.map((svc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{svc.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{svc.count} cita(s)</div>
                        </div>
                        {!business?.isTechnicalServices && !business?.hasFieldTechnicians && (
                          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{fmt(svc.revenue)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#a0aec0' }}>Sin datos para mostrar</p>
                )}
              </div>
            )}

            {/* TAB SEGUIMIENTO TÉCNICOS - Solo para negocios con técnicos de campo */}
            {activeTab === 'tracking' && business?.hasFieldTechnicians && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>📍 Seguimiento de Técnicos</h3>
                  <button
                    onClick={downloadTrackingReport}
                    className="btn-outline btn-sm"
                    disabled={appointments.length === 0}
                  >
                    <Download size={16} /> Descargar Reporte
                  </button>
                </div>
                
                {appointments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {appointments
                      .filter(a => a.technicianStatus && a.technicianStatus !== 'not_started')
                      .sort((a, b) => new Date(b.travelStartTime || b.startTime) - new Date(a.travelStartTime || a.startTime))
                      .map(apt => (
                      <div key={apt.id} style={{ 
                        border: '1px solid var(--border)', 
                        borderRadius: 12, 
                        padding: 16,
                        background: 'var(--surface)'
                      }}>
                        {/* Header de la cita */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          marginBottom: 12,
                          paddingBottom: 12,
                          borderBottom: '1px solid var(--border)'
                        }}>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                              {apt.clientName}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                              {new Date(apt.startTime).toLocaleString('es-CO', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              background: STATUS_LABELS[apt.status]?.bg || '#f3f4f6',
                              color: STATUS_LABELS[apt.status]?.color || '#374151',
                            }}>
                              {STATUS_LABELS[apt.status]?.label || apt.status}
                            </span>
                          </div>
                        </div>

                        {/* Timeline de seguimiento */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {/* En Camino */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: apt.travelStartTime ? '#3b82f6' : '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <Car size={14} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                🚗 En Camino
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {apt.travelStartTime 
                                  ? new Date(apt.travelStartTime).toLocaleString('es-CO', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : 'No registrado'
                                }
                              </div>
                            </div>
                          </div>

                          {/* Llegada */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: apt.arrivalTime ? '#06b6d4' : '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <MapPin size={14} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                📍 Llegada al Destino
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {apt.arrivalTime 
                                  ? new Date(apt.arrivalTime).toLocaleString('es-CO', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : 'No llegó aún'
                                }
                              </div>
                            </div>
                          </div>

                          {/* Inicio Servicio */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: apt.serviceStartTime ? '#ec4899' : '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <Wrench size={14} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                🔧 Inicio del Servicio
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {apt.serviceStartTime 
                                  ? new Date(apt.serviceStartTime).toLocaleString('es-CO', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : 'No iniciado'
                                }
                              </div>
                            </div>
                          </div>

                          {/* Completado */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: apt.status === 'done' ? '#10b981' : '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <CheckCircle size={14} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                ✅ Servicio Completado
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {apt.status === 'done' ? 'Completada' : 'Pendiente'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Insumos utilizados */}
                        {apt.workReport?.partsUsed && apt.workReport.partsUsed.length > 0 && (
                          <div style={{ 
                            marginTop: 16, 
                            padding: 12, 
                            background: 'var(--bg-secondary)', 
                            borderRadius: 8 
                          }}>
                            <div style={{ 
                              fontSize: 13, 
                              fontWeight: 700, 
                              color: 'var(--text)',
                              marginBottom: 8,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6
                            }}>
                              <Package size={16} />
                              Insumos Utilizados
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                              {apt.workReport.partsUsed.map((part, idx) => (
                                <div key={idx} style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  fontSize: 12,
                                  color: 'var(--text-secondary)'
                                }}>
                                  <span>{part.name}</span>
                                  <span style={{ fontWeight: 600 }}>
                                    {part.quantity} {part.unit}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Diagnóstico */}
                        {apt.workReport?.diagnosis && (
                          <div style={{ 
                            marginTop: 12, 
                            padding: 12, 
                            background: '#fef3c7', 
                            borderRadius: 8,
                            borderLeft: '3px solid #f59e0b'
                          }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
                              📝 Diagnóstico
                            </div>
                            <div style={{ fontSize: 12, color: '#78350f' }}>
                              {apt.workReport.diagnosis}
                            </div>
                          </div>
                        )}

                        {/* Solución */}
                        {apt.workReport?.solution && (
                          <div style={{ 
                            marginTop: 8, 
                            padding: 12, 
                            background: '#d1fae5', 
                            borderRadius: 8,
                            borderLeft: '3px solid #10b981'
                          }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#065f46', marginBottom: 4 }}>
                              🔧 Solución Aplicada
                            </div>
                            <div style={{ fontSize: 12, color: '#14532d' }}>
                              {apt.workReport.solution}
                            </div>
                          </div>
                        )}

                        {/* Cancelación */}
                        {apt.status === 'cancelled' && (
                          <div style={{ 
                            marginTop: 12, 
                            padding: 12, 
                            background: '#fee2e2', 
                            borderRadius: 8,
                            borderLeft: '3px solid #ef4444'
                          }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b' }}>
                              ❌ CITA CANCELADA
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Package size={40} color="#cbd5e1" />
                    <p style={{ color: '#94a3b8', marginTop: 12 }}>
                      No hay citas con seguimiento de técnico en este período
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* TABLA DETALLADA */}
          {appointments.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Detalle de citas</div>
              </div>
              {/* Desktop: tabla */}
              <div className="table-wrapper reports-desktop-only">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Servicio</th>
                      <th>Empleado</th>
                      {!business?.isTechnicalServices && !business?.hasFieldTechnicians && (
                        <>
                          <th>Precio</th>
                          <th>Adicional</th>
                          <th>Pago</th>
                          <th>Método</th>
                        </>
                      )}
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAppointments.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontSize: 13 }}>{new Date(a.startTime).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bogota' })}</td>
                        <td>{a.clientName}</td>
                        <td>{a.Service?.name}</td>
                        <td>{a.Employee?.User?.name}</td>
                        {!business?.isTechnicalServices && !business?.hasFieldTechnicians && (
                          <>
                            <td><span className="money">{fmt(a.Service?.price)}</span></td>
                            <td><span className="money" style={{ color: '#d97706' }}>{fmt(a.additionalAmount)}</span></td>
                            <td>
                              <span className="money positive" style={{ fontWeight: 700 }}>{fmt(parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0))}</span>
                            </td>
                            <td>
                              {a.status === 'done' && a.paymentMethod ? (
                                <span style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: a.paymentMethod === 'cash' ? '#059669' : '#0891b2',
                                  textTransform: 'uppercase',
                                  background: a.paymentMethod === 'cash' ? '#d1fae5' : '#cffafe',
                                  padding: '4px 10px',
                                  borderRadius: 6,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  whiteSpace: 'nowrap'
                                }}>
                                  {a.paymentMethod === 'cash' ? '💵 Efectivo' : '📲 Transf.'}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                              )}
                            </td>
                          </>
                        )}
                        <td><span className={`badge badge-${a.status}`}>{STATUS_LABELS[a.status]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Controles de paginación */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <button 
                      onClick={() => setDetailPage(p => Math.max(1, p - 1))}
                      disabled={detailPage === 1}
                      className="btn-outline btn-sm"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      Página {detailPage} de {totalPages}
                    </span>
                    <button 
                      onClick={() => setDetailPage(p => Math.min(totalPages, p + 1))}
                      disabled={detailPage === totalPages}
                      className="btn-outline btn-sm"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile: cards (sin overflow horizontal) */}
              <div className="reports-mobile-only">
                <div style={{ display: 'grid', gap: 10 }}>
                  {paginatedAppointments.map(a => (
                    <div
                          key={a.id}
                          style={{
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            padding: 12,
                            background: 'var(--surface)',
                            minWidth: 0,
                          }}
                        >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>
                            {a.clientName || 'Cliente'}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            {new Date(a.startTime).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bogota' })}
                          </div>
                        </div>
                        <span className={`badge badge-${a.status}`} style={{ flexShrink: 0 }}>
                          {STATUS_LABELS[a.status]}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gap: 6, marginTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Servicio</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textAlign: 'right' }}>
                            {a.Service?.name || '—'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Empleado</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textAlign: 'right' }}>
                            {a.Employee?.User?.name || '—'}
                          </span>
                        </div>
                        {a.status === 'done' && a.paymentMethod && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mtd. Pago</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textAlign: 'right' }}>
                              {a.paymentMethod === 'cash' ? '💵 Efectivo' : '📲 Transf.'}
                            </span>
                          </div>
                        )}
                        {!business?.isTechnicalServices && !business?.hasFieldTechnicians && (
                          <div style={{ display: 'grid', gap: 6, marginTop: 10, padding: 10, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Precio Base</span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{fmt(a.Service?.price)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Adicional</span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: '#d97706' }}>{fmt(a.additionalAmount)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 4, paddingTop: 4, borderTop: '1px dashed var(--border)' }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>TOTAL</span>
                              <span className="money positive" style={{ fontSize: 13, fontWeight: 800 }}>
                                {fmt(parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0))}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Controles de paginación móvil */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
                    <button 
                      onClick={() => setDetailPage(p => Math.max(1, p - 1))}
                      disabled={detailPage === 1}
                      className="btn-outline btn-sm"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      Página {detailPage} de {totalPages}
                    </span>
                    <button 
                      onClick={() => setDetailPage(p => Math.min(totalPages, p + 1))}
                      disabled={detailPage === totalPages}
                      className="btn-outline btn-sm"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </AdminLayout>
  );
}
