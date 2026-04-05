import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import {
  BarChart3, Download, FileText, Table2, RefreshCw,
  TrendingUp, DollarSign, Calendar, CheckCircle, ChevronLeft, ChevronRight, FileSpreadsheet
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
  const { business } = useAuth();
  const [period, setPeriod]         = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd]     = useState('');
  const [showRangeCalendar, setShowRangeCalendar] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [activeTab, setActiveTab]       = useState('overview');
  const [isMobile, setIsMobile]         = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 480 : false);
  const [detailPage, setDetailPage]       = useState(1); // PAGINACIÓN
  const [businessWithLogo, setBusinessWithLogo] = useState(business); // Negocio con logoUrl
  const ITEMS_PER_PAGE = 5; // 5 citas por página

  // Cargar negocio completo con logoUrl
  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const r = await api.get('/businesses/my/business');
        setBusinessWithLogo(r.data);
        console.log('✅ Negocio cargado con logoUrl:', r.data?.logoUrl);
      } catch (e) {
        console.log('❌ Error cargando negocio:', e);
        setBusinessWithLogo(business);
      }
    };
    loadBusiness();
  }, [business?.id]);

  const range = getDateRange(period, customStart, customEnd);

  const loadData = async () => {
    if (!business?.id || !range) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/appointments?businessId=${business.id}`);
      const all = res.data;
      const filtered = all.filter(a => {
        const d = new Date(a.startTime);
        return d >= range.start && d <= range.end;
      });
      setAppointments(filtered);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [business, period, customStart, customEnd]);
  
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

  // Estadísticas - CORREGIDO: calcular ganancia correctamente
  const done       = appointments.filter(a => a.status === 'done');
  const totalRev   = done.reduce((s, a) => s + parseFloat(a.Service?.price || 0), 0);
  // La ganancia del dueño es lo que queda después de pagar al empleado
  const empRev     = done.reduce((s, a) => {
    const price = parseFloat(a.Service?.price || 0);
    const commPct = parseFloat(a.Employee?.commissionPct || 0);
    const earned = a.employeeEarns ? parseFloat(a.employeeEarns) : (price * commPct / 100);
    return s + (isNaN(earned) ? 0 : earned);
  }, 0);
  const ownerRev   = totalRev - empRev; // Ganancia real del negocio

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
      acc[name].ingresos += parseFloat(a.Service?.price || 0);
      return acc;
    }, {})
  ).map(([, v]) => v);

  const byService = Object.entries(
    done.reduce((acc, a) => {
      const name = a.Service?.name || 'Sin servicio';
      if (!acc[name]) acc[name] = { name, count: 0, revenue: 0 };
      acc[name].count++;
      acc[name].revenue += parseFloat(a.Service?.price || 0);
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
    autoTable(doc, {
      startY: yPos,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total citas', appointments.length.toString()],
        ['Citas completadas', done.length.toString()],
        ['Ingresos totales', fmt(totalRev)],
        ['Ganancia del negocio', fmt(ownerRev)],
        ['Pago a empleados', fmt(empRev)],
      ],
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
      const price = parseFloat(a.Service?.price || 0);
      const commPct = parseFloat(a.Employee?.commissionPct || 0);
      const earned = a.employeeEarns ? parseFloat(a.employeeEarns) : (price * commPct / 100);
      
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
      doc.text('Resumen de Pagos a Empleados', margin, yPos);
      
      yPos += 8;
      autoTable(doc, {
        startY: yPos,
        head: [['Empleado', 'Citas completadas', 'Total a pagar']],
        body: employeeList.map(emp => [
          emp.name,
          emp.citas.toString(),
          fmt(emp.total),
        ]),
        foot: [['TOTAL', done.length.toString(), fmt(empRev)]],
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
          0: { cellWidth: 80 },
          1: { cellWidth: 50, halign: 'center' },
          2: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
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
    
    yPos += 8;
    autoTable(doc, {
      startY: yPos,
      head: [['Fecha', 'Cliente', 'Servicio', 'Empleado', 'Precio', 'Estado']],
      body: appointments.map(a => [
        new Date(a.startTime).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }),
        a.clientName || '',
        a.Service?.name || '',
        a.Employee?.User?.name || '',
        fmt(a.Service?.price),
        STATUS_LABELS[a.status] || a.status,
      ]),
      theme: 'plain',
      headStyles: {
        fillColor: colors.light,
        textColor: colors.black,
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: colors.black,
      },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 30 },
        2: { cellWidth: 32 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'center' },
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
        { 'Métrica': 'Total citas en el período', 'Valor': appointments.length },
        { 'Métrica': 'Citas completadas', 'Valor': done.length },
        { 'Métrica': 'Ingresos totales', 'Valor': totalRev },
        { 'Métrica': 'Ganancia del negocio', 'Valor': ownerRev },
        { 'Métrica': 'Pago a empleados', 'Valor': empRev },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

      // Hoja de Detalle
      const detailData = appointments.map(a => ({
        'Fecha': new Date(a.startTime).toLocaleString('es-CO'),
        'Cliente': a.clientName || '',
        'Servicio': a.Service?.name || '',
        'Empleado': a.Employee?.User?.name || '',
        'Precio': parseFloat(a.Service?.price || 0),
        'Estado': STATUS_LABELS[a.status] || a.status,
      }));
      const wsDetail = XLSX.utils.json_to_sheet(detailData);
      XLSX.utils.book_append_sheet(wb, wsDetail, 'Detalle de Citas');

      saveExcel(wb, `informe-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Error generando Excel:', error);
      alert('Error al generar Excel');
    }
  };

  return (
    <AdminLayout title="Informes" subtitle="Análisis de actividad y finanzas">
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
        }
        @media (max-width: 640px) {
          .reports-desktop-only { display: none !important; }
          .reports-mobile-only { display: block !important; }
        }
        @media (min-width: 641px) {
          .reports-desktop-only { display: block !important; }
          .reports-mobile-only { display: none !important; }
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
                { value: 'custom', label: 'Personalizado' },
              ].map(p => (
                <button
                  key={p.value}
                  className={period === p.value ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
                  onClick={() => { setPeriod(p.value); if (p.value === 'custom') setShowRangeCalendar(true); }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {period === 'custom' && (
            <button
              className="btn-outline btn-sm"
              onClick={() => setShowRangeCalendar(!showRangeCalendar)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              📅 {customStart && customEnd ? `${formatDateES(customStart)} → ${formatDateES(customEnd)}` : 'Seleccionar rango'}
            </button>
          )}

          <button className="btn-ghost btn-sm" onClick={loadData} disabled={loading}>
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
            {/* KPIs */}
            <div className="grid-stats mb-6">
            <div className="stat-card">
              <div className="stat-icon purple"><Calendar size={22} /></div>
              <div className="stat-body">
                <div className="stat-value">{appointments.length}</div>
                <div className="stat-label">Total de citas</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><CheckCircle size={22} /></div>
              <div className="stat-body">
                <div className="stat-value">{done.length}</div>
                <div className="stat-label">Citas completadas</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue"><DollarSign size={22} /></div>
              <div className="stat-body">
                <div className="stat-value">{fmt(totalRev)}</div>
                <div className="stat-label">Ingresos totales</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon teal"><TrendingUp size={22} /></div>
              <div className="stat-body">
                <div className="stat-value">{fmt(ownerRev)}</div>
                <div className="stat-label">Ganancia del negocio</div>
              </div>
            </div>
          </div>

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
              {['overview', 'employees', 'services'].map(tab => (
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
                        <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
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
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{fmt(svc.revenue)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#a0aec0' }}>Sin datos para mostrar</p>
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
                    <tr><th>Fecha</th><th>Cliente</th><th>Servicio</th><th>Empleado</th><th>Precio</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    {paginatedAppointments.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontSize: 13 }}>{new Date(a.startTime).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td>{a.clientName}</td>
                        <td>{a.Service?.name}</td>
                        <td>{a.Employee?.User?.name}</td>
                        <td><span className="money positive">{fmt(a.Service?.price)}</span></td>
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
                            {new Date(a.startTime).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Precio</span>
                          <span className="money positive" style={{ fontSize: 13 }}>
                            {fmt(a.Service?.price)}
                          </span>
                        </div>
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
