import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// ===== CARGA DINÁMICA (LAZY LOADING CON AUTO-REINTENTO) =====
// Helper para reintentar la carga de chunks si fallan (útil tras despliegues en VPS)
const lazyWithRetry = (componentImport) => {
  return lazy(async () => {
    const hasRetried = window.sessionStorage.getItem('chunk-retry-triggered');
    try {
      const component = await componentImport();
      window.sessionStorage.removeItem('chunk-retry-triggered');
      return component;
    } catch (error) {
      if (!hasRetried) {
        window.sessionStorage.setItem('chunk-retry-triggered', 'true');
        console.warn('Detectado error de carga de chunk. Recargando la aplicación...');
        window.location.reload();
        return new Promise(() => {}); // Evitar que siga la ejecución
      }
      throw error;
    }
  });
};

const Login            = lazyWithRetry(() => import('./pages/Login'));
const ResetPassword    = lazyWithRetry(() => import('./pages/ResetPassword'));
const RegisterChoice   = lazyWithRetry(() => import('./pages/RegisterChoice'));
const RegisterClient   = lazyWithRetry(() => import('./pages/RegisterClient'));
const RegisterVendor   = lazyWithRetry(() => import('./pages/RegisterVendor'));
const BusinessLanding  = lazyWithRetry(() => import('./pages/public/BusinessLanding'));
const BookAppointment  = lazyWithRetry(() => import('./pages/public/BookAppointment'));
const RateEmployee     = lazyWithRetry(() => import('./pages/public/RateEmployee'));
const KadyStandalone   = lazyWithRetry(() => import('./pages/public/KadyStandalone'));
const MyAppointments   = lazyWithRetry(() => import('./pages/client/MyAppointments'));

// Admin Pages
const Dashboard    = lazyWithRetry(() => import('./pages/admin/Dashboard'));
const Referrals    = lazyWithRetry(() => import('./pages/admin/Referrals'));
const MyBusiness   = lazyWithRetry(() => import('./pages/admin/MyBusiness'));
const Services     = lazyWithRetry(() => import('./pages/admin/Services'));
const Employees    = lazyWithRetry(() => import('./pages/admin/Employees'));
const Schedule     = lazyWithRetry(() => import('./pages/admin/Schedule'));
const SpecialSchedule = lazyWithRetry(() => import('./pages/admin/SpecialSchedule'));
const EmployeeVacations = lazyWithRetry(() => import('./pages/admin/EmployeeVacations'));
const Appointments = lazyWithRetry(() => import('./pages/admin/Appointments'));
const Promotions   = lazyWithRetry(() => import('./pages/admin/Promotions'));
const Ratings      = lazyWithRetry(() => import('./pages/admin/Ratings'));
const Reports      = lazyWithRetry(() => import('./pages/admin/Reports'));
const Payments     = lazyWithRetry(() => import('./pages/admin/Payments'));
const SubmitPayment = lazyWithRetry(() => import('./pages/admin/SubmitPayment'));
const Clients      = lazyWithRetry(() => import('./pages/admin/Clients'));
const Expenses     = lazyWithRetry(() => import('./pages/admin/Expenses'));
const Inventory    = lazyWithRetry(() => import('./pages/admin/Inventory'));
const Deposits     = lazyWithRetry(() => import('./pages/admin/Deposits'));
const CashRegister = lazyWithRetry(() => import('./pages/admin/CashRegister'));
const Agenda       = lazyWithRetry(() => import('./pages/admin/Agenda'));
const DownloadAPK  = lazyWithRetry(() => import('./pages/admin/DownloadAPK'));
const ChangePassword = lazyWithRetry(() => import('./pages/admin/ChangePassword'));

// Employee Pages
const EmployeeDashboard = lazyWithRetry(() => import('./pages/employee/EmployeeDashboard'));
const EmployeeCommissions = lazyWithRetry(() => import('./pages/employee/EmployeeCommissions'));
const EmployeeProfile = lazyWithRetry(() => import('./pages/employee/EmployeeProfile'));
const EmployeeRatings = lazyWithRetry(() => import('./pages/employee/EmployeeRatings'));
const EmployeeClients = lazyWithRetry(() => import('./pages/employee/EmployeeClients'));

// Super Admin Pages
const SuperAdminHome  = lazyWithRetry(() => import('./pages/superadmin/SuperAdminHome'));
const Businesses      = lazyWithRetry(() => import('./pages/superadmin/Businesses'));
const Branches        = lazyWithRetry(() => import('./pages/superadmin/Branches'));
const BusinessTypes   = lazyWithRetry(() => import('./pages/superadmin/BusinessTypes'));
const Users           = lazyWithRetry(() => import('./pages/superadmin/Users'));
const ActivityLogs    = lazyWithRetry(() => import('./pages/superadmin/ActivityLogs'));
const GlobalReports   = lazyWithRetry(() => import('./pages/superadmin/GlobalReports'));
const PlatformReviews = lazyWithRetry(() => import('./pages/superadmin/PlatformReviews'));
const HelpArticles    = lazyWithRetry(() => import('./pages/superadmin/HelpArticles'));

// Other
const Landing = lazyWithRetry(() => import('./pages/Landing'));
const DownloadAPKPublic = lazyWithRetry(() => import('./pages/DownloadAPKPublic'));
const APKHome = lazyWithRetry(() => import('./pages/APKHome'));

// Layouts y otros
import EmployeeLayout from './components/EmployeeLayout';
import { useAuth } from './context/AuthContext';
import notificationService from './services/notificationService';
import fcmService from './services/fcmService';
import UpdateChecker from './components/UpdateChecker';

const PREFERRED_SLUG_KEY = 'preferredBusinessSlug';
const RESERVED_FIRST_SEGMENTS = new Set([
  'login',
  'register',
  'register-client',
  'register-vendor',
  'admin',
  'employee',
  'superadmin',
  'my-appointments',
]);

function isValidBusinessSlug(slug) {
  return Boolean(
    slug &&
    /^[a-z0-9][a-z0-9-]{1,60}$/i.test(slug) &&
    !RESERVED_FIRST_SEGMENTS.has(slug.toLowerCase())
  );
}

function savePreferredSlug(slug) {
  if (isValidBusinessSlug(slug)) {
    localStorage.setItem(PREFERRED_SLUG_KEY, slug.toLowerCase());
  }
}

function getSlugFromIncomingUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const querySlug = parsed.searchParams.get('slug');
    if (isValidBusinessSlug(querySlug)) return querySlug;

    const firstSegment = parsed.pathname.split('/').filter(Boolean)[0];
    if (isValidBusinessSlug(firstSegment)) return firstSegment;

    return null;
  } catch {
    return null;
  }
}

function MobileSlugBridge() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentFirstSegment = location.pathname.split('/').filter(Boolean)[0];
    if (isValidBusinessSlug(currentFirstSegment)) {
      savePreferredSlug(currentFirstSegment);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;

    const initialSlug = getSlugFromIncomingUrl(window.location.href);
    if (initialSlug) {
      savePreferredSlug(initialSlug);
      if (!location.pathname.startsWith(`/${initialSlug}`)) {
        navigate(`/${initialSlug}`, { replace: true });
      }
    }

    let cleanup = () => {};
    CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      const incomingSlug = getSlugFromIncomingUrl(url);
      if (!incomingSlug) return;

      savePreferredSlug(incomingSlug);
      navigate(`/${incomingSlug}`, { replace: true });
    }).then((listener) => {
      cleanup = () => listener.remove();
    });

    return () => cleanup();
  }, [location.pathname, navigate]);

  return null;
}

function RootRoute() {
  const { user } = useAuth();
  
  // Si es APK y no hay usuario, mostrar login
  // Si es APK y hay usuario, mostrar dashboard según rol
  // Si es web, mostrar landing normal
  if (Capacitor.isNativePlatform()) {
    if (!user) {
      return <Login />;
    }
    
    // Usuario autenticado en APK, redirigir según rol
    if (user.role === 'superadmin') {
      return <Navigate to="/superadmin" replace />;
    } else if (user.role === 'admin' || user.role === 'admin_suc') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'employee') {
      return <Navigate to="/employee" replace />;
    } else {
      return <Navigate to="/my-appointments" replace />;
    }
  }
  
  // Para web, mostrar siempre la Landing page
  return <Landing />;
}

import AdminLayout from './components/AdminLayout';

import ScrollToTop from './components/ScrollToTop';
import { Helmet } from 'react-helmet-async';

export default function App() {
  // Inicializar servicio de notificaciones al montar la app (solo en APK)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      notificationService.initialize();
      fcmService.initialize();
    }
  }, []);

  return (
    <AuthProvider>
      <Helmet>
        <title>K-Dice | Software de Reservas y Agenda Online para Negocios</title>
        <meta name="description" content="Sistema de reservas, agenda online y gestión de citas para barberías, spas y prestadores de servicios." />
      </Helmet>
      <BrowserRouter>
        <ScrollToTop />
        <MobileSlugBridge />
        <Suspense fallback={null}>
          <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="/register"        element={<RegisterChoice />} />
          <Route path="/register-client" element={<RegisterClient />} />
          <Route path="/register-vendor" element={<RegisterVendor />} />
          <Route path="/download-apk" element={<DownloadAPKPublic />} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin', 'admin_suc']} />}>
            <Route element={<AdminLayout />}>
              <Route index               element={<Dashboard />} />
              <Route path="business"     element={<MyBusiness />} />
              <Route path="services"     element={<Services />} />
              <Route path="employees"    element={<Employees />} />
              <Route path="schedule"     element={<Schedule />} />
              <Route path="special-schedules" element={<SpecialSchedule />} />
              <Route path="employee-vacations" element={<EmployeeVacations />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="promotions"   element={<Promotions />} />
              <Route path="ratings"      element={<Ratings />} />
              <Route path="reports"      element={<Reports />} />
              <Route path="payments"     element={<Payments />} />
              <Route path="submit-payment" element={<SubmitPayment />} />
              <Route path="clients"      element={<Clients />} />
              <Route path="cash-register" element={<CashRegister />} />
              <Route path="expenses"     element={<Expenses />} />
              <Route path="inventory"    element={<Inventory />} />
              <Route path="deposits"     element={<Deposits />} />
              <Route path="agenda"       element={<Agenda />} />
              <Route path="referrals"    element={<Referrals />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>
          </Route>
          <Route path="/employee" element={<ProtectedRoute roles={['employee']} />}>
            <Route element={<EmployeeLayout />}>
              <Route index element={<EmployeeDashboard />} />
              <Route path="commissions" element={<EmployeeCommissions />} />
              <Route path="profile" element={<EmployeeProfile />} />
              <Route path="ratings" element={<EmployeeRatings />} />
              <Route path="clients" element={<EmployeeClients />} />
            </Route>
          </Route>
          {/* ===== PANEL SUPER ADMIN (INDEPENDIENTE) ===== */}
          <Route path="/superadmin" element={<ProtectedRoute roles={['superadmin']} />}>
            <Route index                 element={<SuperAdminHome />} />
            <Route path="businesses"     element={<Businesses />} />
            <Route path="branches"       element={<Branches />} />
            <Route path="business-types" element={<BusinessTypes />} />
            <Route path="users"          element={<Users />} />
            <Route path="activity-logs"  element={<ActivityLogs />} />
            <Route path="reports"        element={<GlobalReports />} />
            <Route path="reviews"        element={<PlatformReviews />} />
            <Route path="help"           element={<HelpArticles />} />
          </Route>
          <Route path="/my-appointments" element={<ProtectedRoute roles={['client']} />}>
            <Route index element={<MyAppointments />} />
          </Route>
          
          {/* ===== RUTA PARA CALIFICAR EMPLEADO ===== */}
          <Route path="/rate/:appointmentId" element={<RateEmployee />} />
          <Route path="/rate-employee" element={<RateEmployee />} />
          
          {/* ===== RUTAS PÚBLICAS DE NEGOCIOS (SLUG) ===== */}
          <Route path="/kady/:slug" element={<KadyStandalone />} />
          <Route path="/:slug" element={<BusinessLanding />} />
          <Route path="/:slug/book" element={<BookAppointment />} />
        </Routes>
        </Suspense>
        <UpdateChecker />
      </BrowserRouter>
    </AuthProvider>
  );
}
