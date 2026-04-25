# Guía de Modularización - Feature-Based Architecture

## Estructura Nueva

```
src/
├── features/                    # Organizado por dominio de negocio
│   ├── appointments/
│   │   ├── api/                # Llamadas API (futuro)
│   │   ├── hooks/              # useAppointments, etc.
│   │   │   └── useAppointments.js
│   │   ├── components/         # ✅ Sub-componentes extraídos
│   │   │   ├── common/         # Componentes reutilizables
│   │   │   │   └── StatusBadge.jsx
│   │   │   ├── filters/        # Filtros de búsqueda
│   │   │   │   └── AppointmentFilters.jsx
│   │   │   ├── list/           # Listas/tablas
│   │   │   │   └── AppointmentList.jsx
│   │   │   └── modals/         # Modales
│   │   │       └── CompleteAppointmentModal.jsx
│   │   └── utils/              # Utilidades específicas de citas
│   ├── business/
│   │   └── hooks/
│   │       └── useBusinessStats.js
│   ├── whatsapp/
│   │   └── hooks/
│   │       └── useWhatsApp.js
│   └── [otros features...]
├── shared/                      # Código compartido entre features
│   ├── api/                    # Configuración de API
│   ├── components/             # Componentes UI base
│   ├── hooks/                  # Hooks genéricos reutilizables
│   │   ├── useStatusMessage.js
│   │   └── useModal.js
│   ├── utils/                  # Utilidades globales
│   │   └── formatters.js       # fmt, fmtDate, etc.
│   └── constants/              # Constantes globales
│       └── appointmentStatuses.js
└── [código existente...]        # Código legacy (sin romper)
```

## Fases de Migración

### ✅ FASE 1 - COMPLETADA: Utilidades Globales

**Archivos creados:**
- `shared/utils/formatters.js` - `fmt`, `fmtDate`, `formatCurrency`, `formatDateTime`, etc.
- `shared/constants/appointmentStatuses.js` - `APPOINTMENT_STATUSES`, `ACTIVE_STATUSES`, etc.

**Cómo usar:**
```javascript
// Antes (en cada archivo)
const fmt = (n) => new Intl.NumberFormat('es-CO', ...).format(n);

// Después
import { fmt, fmtDate } from '../shared/utils/formatters';
```

### ✅ FASE 2 - COMPLETADA: Hooks Específicos

**Archivos creados:**
- `features/whatsapp/hooks/useWhatsApp.js` - Lógica de WhatsApp
- `features/business/hooks/useBusinessStats.js` - Estadísticas del negocio
- `features/appointments/hooks/useAppointments.js` - Manejo de citas
- `shared/hooks/useStatusMessage.js` - Toast notifications
- `shared/hooks/useModal.js` - Control de modales

**Cómo usar useWhatsApp:**
```javascript
import { useWhatsApp } from '../features/whatsapp/hooks';

function Dashboard() {
  const { business } = useAuth();
  const { 
    status, 
    qr, 
    loading, 
    isConnected,
    getQR, 
    reset, 
    stop, 
    logout 
  } = useWhatsApp(business);
  
  // Ya no necesitas todo el useState y useEffect de WhatsApp
  // El hook maneja: status, QR, polling automático cada 10s, etc.
}
```

**Cómo usar useBusinessStats:**
```javascript
import { useBusinessStats } from '../features/business/hooks';

function Dashboard() {
  const { business } = useAuth();
  const { 
    stats, 
    upcoming, 
    finance, 
    loading, 
    systemNotification,
    refresh 
  } = useBusinessStats(business?.id);
  
  // Automáticamente carga estadísticas al montar
  // stats.total, stats.pending, stats.done, etc.
  // finance.totalRevenue, finance.cashRevenue, etc.
}
```

**Cómo usar useStatusMessage:**
```javascript
import { useStatusMessage } from '../shared/hooks';

function AnyComponent() {
  const { statusMsg, showSuccess, showError, showInfo } = useStatusMessage();
  
  const handleSave = async () => {
    try {
      await api.post(...);
      showSuccess('Guardado correctamente');
    } catch (e) {
      showError('Error al guardar');
    }
  };
  
  // statusMsg contiene { text, type } para renderizar el toast
}
```

### ✅ FASE 4 - COMPLETADA: Componentes Extraídos

**Archivos creados:**
- `features/appointments/components/common/StatusBadge.jsx` - Badge de estado reutilizable
- `features/appointments/components/filters/AppointmentFilters.jsx` - Filtros (calendario + empleado)
- `features/appointments/components/list/AppointmentList.jsx` - Tabla/lista de citas
- `features/appointments/components/modals/CompleteAppointmentModal.jsx` - Modal de completar cita

**Cómo usar StatusBadge:**
```javascript
import { StatusBadge, getStatusConfig } from '../features/appointments/components';

// En tu JSX
<StatusBadge status="pending" size="md" showIcon={true} />
<StatusBadge status="done" size="sm" />

// Para lógica condicional
const config = getStatusConfig(appointment.status);
```

**Cómo usar AppointmentFilters:**
```javascript
import { AppointmentFilters } from '../features/appointments/components';

function Appointments() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const { colors } = useTheme();
  
  return (
    <AppointmentFilters
      selectedDate={selectedDate}
      onDateSelect={setSelectedDate}
      selectedEmployeeId={selectedEmployeeId}
      onEmployeeChange={setSelectedEmployeeId}
      employees={employees}
      colors={colors}
      isMobile={isMobile}
    />
  );
}
```

**Cómo usar AppointmentList:**
```javascript
import { AppointmentList } from '../features/appointments/components';

function Appointments() {
  return (
    <AppointmentList
      appointments={filteredAppointments}
      loading={loading}
      isMobile={isMobile}
      colors={colors}
      business={business}
      currentPage={currentPage}
      totalPages={totalPages}
      onPrevPage={() => setCurrentPage(p => p - 1)}
      onNextPage={() => setCurrentPage(p => p + 1)}
      renderActions={(appointment) => (
        <ActionButtons appointment={appointment} />
      )}
    />
  );
}
```

**Cómo usar CompleteAppointmentModal:**
```javascript
import { CompleteAppointmentModal } from '../features/appointments/components';

function Appointments() {
  const [showComplete, setShowComplete] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  const handleComplete = async (method) => {
    await api.patch(`/appointments/${selectedApt.id}/status`, {
      status: 'done',
      paymentMethod: method
    });
    setShowComplete(false);
  };
  
  return (
    <CompleteAppointmentModal
      isOpen={showComplete}
      appointment={selectedApt}
      paymentMethod={paymentMethod}
      onPaymentMethodChange={setPaymentMethod}
      onComplete={handleComplete}
      onCancel={() => setShowComplete(false)}
      isCompleting={completing}
      colors={colors}
    />
  );
}
```

## Migración Gradual

Los archivos existentes siguen funcionando. La migración es opcional y gradual:

1. **Nuevo código**: Usar los nuevos hooks/utilities
2. **Refactorización**: Cuando se modifique un archivo existente, migrar los imports
3. **Eliminación duplicados**: Cuando todos usen `shared/utils/formatters`, eliminar las funciones duplicadas

## Ejemplo Completo de Migración

### Antes (Dashboard.jsx actual):
```javascript
// ~200 líneas solo de useState y useEffect
const [whatsappStatus, setWhatsappStatus] = useState('disconnected');
const [whatsappQR, setWhatsappQR] = useState(null);
const [upcoming, setUpcoming] = useState([]);
const [stats, setStats] = useState({...});
const [finance, setFinance] = useState({...});
// ...
useEffect(() => { /* 100+ líneas de lógica */ }, [business?.id]);
```

### Después (con hooks):
```javascript
import { useWhatsApp } from '../../features/whatsapp/hooks';
import { useBusinessStats } from '../../features/business/hooks';
import { fmt, fmtDate } from '../../shared/utils/formatters';

function Dashboard() {
  const { business } = useAuth();
  const { status, qr, isConnected, getQR } = useWhatsApp(business);
  const { stats, upcoming, finance, loading } = useBusinessStats(business?.id);
  
  // Limpio, solo UI y handlers específicos
}
```

## Siguientes Pasos (FASES FUTURAS - Opcional)

### FASE 5: API Layer por Feature
Centralizar las llamadas API por dominio:
```
features/
├── appointments/
│   └── api/
│       ├── appointmentApi.js    # Todas las llamadas a /appointments
│       └── index.js
```

### FASE 6: Más Componentes Extraídos
- `CreateAppointmentModal` - Modal de crear cita
- `EditAppointmentModal` - Modal de editar cita
- `ExpressAppointmentModal` - Cita express
- `CancelConfirmationModal` - Confirmar cancelación
- `TransferAppointmentModal` - Transferir cita

### FASE 7: Hooks Adicionales
- `useServices` - CRUD de servicios
- `useEmployees` - Gestión de empleados
- `useInventory` - Manejo de inventario
- `usePromotions` - Gestión de promociones

### FASE 8: Componentes UI Base
- `shared/components/Button/` - Botones consistentes
- `shared/components/Modal/` - Modal base reutilizable
- `shared/components/Table/` - Tablas con sorting/filters
- `shared/components/Form/` - Inputs, selects, etc.

## Barrel Exports

Todos los folders tienen `index.js` para imports limpios:

```javascript
// En vez de:
import { useWhatsApp } from '../../features/whatsapp/hooks/useWhatsApp';

// Puedes usar:
import { useWhatsApp } from '../../features/whatsapp/hooks';
```
