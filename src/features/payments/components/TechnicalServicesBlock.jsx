/**
 * Payments Feature - TechnicalServicesBlock Component
 * Bloque de mensaje cuando el negocio es de servicios técnicos
 */
import { Link } from 'react-router-dom';
import AdminLayout from '../../../components/AdminLayout';

export function TechnicalServicesBlock({ business }) {
  const modeText = business?.hasFieldTechnicians ? 'Técnicos a Domicilio' : 'Servicios Técnicos';
  const modeIcon = business?.hasFieldTechnicians ? '🏠' : '🔧';
  
  return (
    <AdminLayout title="Pagos" subtitle="Gestión de comisiones">
      <div className="card" style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        maxWidth: 600,
        margin: '0 auto'
      }}>
        <div style={{ 
          width: 80, 
          height: 80, 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: 36
        }}>
          {modeIcon}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>
          {modeText}
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
          Has configurado tu empresa como <strong>{modeText}</strong>. En este modo, el sistema no gestiona pagos ni comisiones por servicio.
          {business?.hasFieldTechnicians && ' El seguimiento se realiza por citas atendidas, no por ingresos monetarios.'}
        </p>
        <Link to="/admin/business" className="btn-primary" style={{ padding: '12px 24px' }}>
          Cambiar configuración del negocio
        </Link>
      </div>
    </AdminLayout>
  );
}
