import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login            from './pages/Login';
import RegisterChoice   from './pages/RegisterChoice';
import RegisterClient   from './pages/RegisterClient';
import RegisterVendor   from './pages/RegisterVendor';
import BusinessLanding  from './pages/public/BusinessLanding';
import BookAppointment  from './pages/public/BookAppointment';
import MyAppointments   from './pages/client/MyAppointments';
import Dashboard    from './pages/admin/Dashboard';
import MyBusiness   from './pages/admin/MyBusiness';
import Services     from './pages/admin/Services';
import Employees    from './pages/admin/Employees';
import Schedule     from './pages/admin/Schedule';
import Appointments from './pages/admin/Appointments';
import Reports      from './pages/admin/Reports';
import Payments     from './pages/admin/Payments';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import Landing from './pages/Landing';
import DownloadAPK from './pages/admin/DownloadAPK';
import DownloadAPKPublic from './pages/DownloadAPKPublic';
import APKHome from './pages/APKHome';
import { useAuth } from './context/AuthContext';
import notificationService from './services/notificationService';
// ===== PANEL SUPER ADMIN (independiente) =====
import SuperAdminHome  from './pages/superadmin/SuperAdminHome';
import Businesses      from './pages/superadmin/Businesses';
import BusinessTypes   from './pages/superadmin/BusinessTypes';

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
    } else if (user.role === 'admin') {
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
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <MobileSlugBridge />
        <Routes>
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<RegisterChoice />} />
          <Route path="/register-client" element={<RegisterClient />} />
          <Route path="/register-vendor" element={<RegisterVendor />} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']} />}>
            <Route index               element={<Dashboard />} />
            <Route path="business"     element={<MyBusiness />} />
            <Route path="download-apk" element={<DownloadAPK />} />
            <Route path="services"     element={<Services />} />
            <Route path="employees"    element={<Employees />} />
            <Route path="schedule"     element={<Schedule />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="reports"      element={<Reports />} />
            <Route path="payments"     element={<Payments />} />
          </Route>
          <Route path="/employee" element={<ProtectedRoute roles={['employee']} />}>
            <Route index element={<EmployeeDashboard />} />
          </Route>
          {/* ===== PANEL SUPER ADMIN (INDEPENDIENTE) ===== */}
          <Route path="/superadmin" element={<ProtectedRoute roles={['superadmin']} />}>
            <Route index                 element={<SuperAdminHome />} />
            <Route path="businesses"     element={<Businesses />} />
            <Route path="business-types" element={<BusinessTypes />} />
          </Route>
          <Route path="/my-appointments" element={<ProtectedRoute roles={['client']} />}>
            <Route index element={<MyAppointments />} />
          </Route>
          <Route path="/apk-home" element={<APKHome />} />
          <Route path="/download-apk" element={<DownloadAPKPublic />} />
          <Route path="/:slug"      element={<BusinessLanding />} />
          <Route path="/:slug/book" element={<BookAppointment />} />
          <Route path="/" element={<RootRoute />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
