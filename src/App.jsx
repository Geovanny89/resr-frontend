import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// ===== CARGA DINÁMICA (LAZY LOADING) =====
const Login            = lazy(() => import('./pages/Login'));
const ResetPassword    = lazy(() => import('./pages/ResetPassword'));
const RegisterChoice   = lazy(() => import('./pages/RegisterChoice'));
const RegisterClient   = lazy(() => import('./pages/RegisterClient'));
const RegisterVendor   = lazy(() => import('./pages/RegisterVendor'));
const BusinessLanding  = lazy(() => import('./pages/public/BusinessLanding'));
const BookAppointment  = lazy(() => import('./pages/public/BookAppointment'));
const RateEmployee     = lazy(() => import('./pages/public/RateEmployee'));
const MyAppointments   = lazy(() => import('./pages/client/MyAppointments'));

// Admin Pages
const Dashboard    = lazy(() => import('./pages/admin/Dashboard'));
const Referrals    = lazy(() => import('./pages/admin/Referrals'));
const MyBusiness   = lazy(() => import('./pages/admin/MyBusiness'));
const Services     = lazy(() => import('./pages/admin/Services'));
const Employees    = lazy(() => import('./pages/admin/Employees'));
const Schedule     = lazy(() => import('./pages/admin/Schedule'));
const SpecialSchedule = lazy(() => import('./pages/admin/SpecialSchedule'));
const EmployeeVacations = lazy(() => import('./pages/admin/EmployeeVacations'));
const Appointments = lazy(() => import('./pages/admin/Appointments'));
const Promotions   = lazy(() => import('./pages/admin/Promotions'));
const Ratings      = lazy(() => import('./pages/admin/Ratings'));
const Reports      = lazy(() => import('./pages/admin/Reports'));
const Payments     = lazy(() => import('./pages/admin/Payments'));
const SubmitPayment = lazy(() => import('./pages/admin/SubmitPayment'));
const Clients      = lazy(() => import('./pages/admin/Clients'));
const Expenses     = lazy(() => import('./pages/admin/Expenses'));
const Inventory    = lazy(() => import('./pages/admin/Inventory'));
const Deposits     = lazy(() => import('./pages/admin/Deposits'));
const CashRegister = lazy(() => import('./pages/admin/CashRegister'));
const Agenda       = lazy(() => import('./pages/admin/Agenda'));
const DownloadAPK  = lazy(() => import('./pages/admin/DownloadAPK'));
const ChangePassword = lazy(() => import('./pages/admin/ChangePassword'));

// Employee Pages
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard'));
const EmployeeCommissions = lazy(() => import('./pages/employee/EmployeeCommissions'));
const EmployeeProfile = lazy(() => import('./pages/employee/EmployeeProfile'));
const EmployeeRatings = lazy(() => import('./pages/employee/EmployeeRatings'));
const EmployeeClients = lazy(() => import('./pages/employee/EmployeeClients'));

// Super Admin Pages
const SuperAdminHome  = lazy(() => import('./pages/superadmin/SuperAdminHome'));
const Businesses      = lazy(() => import('./pages/superadmin/Businesses'));
const Branches        = lazy(() => import('./pages/superadmin/Branches'));
const BusinessTypes   = lazy(() => import('./pages/superadmin/BusinessTypes'));
const Users           = lazy(() => import('./pages/superadmin/Users'));
const ActivityLogs    = lazy(() => import('./pages/superadmin/ActivityLogs'));
const GlobalReports   = lazy(() => import('./pages/superadmin/GlobalReports'));
const PlatformReviews = lazy(() => import('./pages/superadmin/PlatformReviews'));

// Other
const Landing = lazy(() => import('./pages/Landing'));
const DownloadAPKPublic = lazy(() => import('./pages/DownloadAPKPublic'));
const APKHome = lazy(() => import('./pages/APKHome'));

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
      <BrowserRouter>
        <MobileSlugBridge />
        <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>Cargando...</div>}>
          <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="/register"        element={<RegisterChoice />} />
          <Route path="/register-client" element={<RegisterClient />} />
          <Route path="/register-vendor" element={<RegisterVendor />} />
          <Route path="/download-apk" element={<DownloadAPKPublic />} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin', 'admin_suc']} />}>
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
          </Route>
          <Route path="/my-appointments" element={<ProtectedRoute roles={['client']} />}>
            <Route index element={<MyAppointments />} />
          </Route>
          
          {/* ===== RUTA PARA CALIFICAR EMPLEADO ===== */}
          <Route path="/rate/:appointmentId" element={<RateEmployee />} />
          <Route path="/rate-employee" element={<RateEmployee />} />
          
          {/* ===== RUTAS PÚBLICAS DE NEGOCIOS (SLUG) ===== */}
          <Route path="/:slug" element={<BusinessLanding />} />
          <Route path="/:slug/book" element={<BookAppointment />} />
        </Routes>
        </Suspense>
        <UpdateChecker />
      </BrowserRouter>
    </AuthProvider>
  );
}
