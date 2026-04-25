import citasImg from '../../assets/citas.png';
import empleadosImg from '../../assets/empleados.png';
import horariosImg from '../../assets/horarios.png';
import negocioImg from '../../assets/negocio.png';
import pagosImg from '../../assets/pagos.png';
import serviciosImg from '../../assets/servicios.png';
import reporteImg from '../../assets/reporte.png';
import reporte1Img from '../../assets/reporte1.png';
import notificacionImg from '../../assets/notificacion.jpg';

export const carouselImages = [
  { src: citasImg, title: 'Gestión de Citas', desc: 'Organiza tus citas fácilmente' },
  { src: empleadosImg, title: 'Control de Empleados', desc: 'Gestiona tu equipo de trabajo' },
  { src: horariosImg, title: 'Configura Horarios', desc: 'Define tu disponibilidad' },
  { src: negocioImg, title: 'Tu Negocio', desc: 'Personaliza tu perfil' },
  { src: pagosImg, title: 'Reportes de Pagos', desc: 'Controla tus ingresos' },
  { src: serviciosImg, title: 'Tus Servicios', desc: 'Administra tus servicios' },
  { src: reporteImg, title: 'Reportes Detallados', desc: 'Analiza tu negocio' },
  { src: reporte1Img, title: 'Dashboard de Métricas', desc: 'Visualiza el rendimiento de tu negocio' },
  { src: notificacionImg, title: 'Recordatorios Automáticos', desc: 'Notificaciones por email y app 1 hora antes de cada cita' },
];

export const features = [
  { icon: '📅', title: 'Gestión de Citas', desc: 'Sistema completo de reservas online con confirmación automática' },
  { icon: '📱', title: 'App Móvil ', desc: 'APK para tu negocio, descargable directamente' },
  { icon: '💬', title: 'Recordatorios Automáticos', desc: 'Notificaciones por email y APK 1 hora antes de cada cita' },
  { icon: '👥', title: 'Gestión de Empleados', desc: 'Horarios, comisiones y disponibilidad en tiempo real' },
  { icon: '💰', title: 'Reportes y Pagos', desc: 'Seguimiento de ingresos y comisiones por empleado' },
  { icon: '🎨', title: 'Branding Personalizado', desc: 'Colores, logo y diseño según tu marca' },
];

export const plans = [
  {
    name: 'Básico',
    price: '$70,000',
    period: 'COP/mes',
    desc: 'Perfecto para emprendedores',
    color: '#10b981',
    popular: false,
    users: 3,
    features: [
      '✅ 3 empleados incluidos',
      '✅ Citas ilimitadas',
      '✅ App móvil personalizada (APK)',
      '✅ Página web de reservas',
      '✅ Recordatorios automáticos por email',
      '✅ Reportes básicos',
      '✅ Soporte por email',
      '✅ Personalización de marca',
      '+ $20,000/empleado adicional'
    ],
    cta: 'Comenzar Ahora',
  },
  {
    name: 'Pro',
    price: '$90,000',
    period: 'COP/mes',
    desc: 'Ideal para equipos pequeños',
    color: '#667eea',
    popular: true,
    users: 5,
    features: [
      '✅ 5 empleados incluidos',
      '✅ Todo lo del plan Básico',
      '✅ Recordatorios por WhatsApp',
      '✅ Reportes de ingresos y comisiones',
      '✅ Soporte prioritario',
      '✅ Galería de fotos y horarios',
      '✅ Gestión de empleados avanzada',
      '+ $20,000/empleado adicional'
    ],
    cta: 'Más Popular',
  },
  {
    name: 'Premium',
    price: '$130,000',
    period: 'COP/mes',
    desc: 'Para negocios en crecimiento',
    color: '#f59e0b',
    popular: false,
    users: 10,
    features: [
      '✅ 10 empleados incluidos',
      '✅ Todo lo del plan Pro',
      '✅ Reportes avanzados y analytics',
      '✅ Soporte VIP 24/7',
      '✅ Configuración de anticipos/depositos',
      '✅ Módulo de inventario',
      '✅ Módulo de gastos',
      '+ $20,000/empleado adicional'
    ],
    cta: 'Elegir Premium',
  },
];

export const testimonials = [
  { name: 'María García', business: 'Salón La Belleza', text: '"Aumentamos nuestras citas un 40% en el primer mes. Los clientes aman la app."', avatar: '👩‍💼' },
  { name: 'Carlos López', business: 'Barbería Premium', text: '"El sistema de recordatorios redujo nuestras cancelaciones a la mitad."', avatar: '👨‍💼' },
  { name: 'Ana Martínez', business: 'Spa Relax', text: '"Ahora mis empleados saben exactamente cuándo trabajan. Excelente herramienta."', avatar: '👩‍🦱' },
];

export const navLinks = [
  { href: '#features', label: 'Características' },
  { href: '#pricing', label: 'Planes' },
  { label: 'Demo', isDemo: true },
];
