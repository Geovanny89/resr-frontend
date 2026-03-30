import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../context/AuthContext';

export default function APKHome() {
  const { user, business } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);

  // Si no hay usuario, redirigir al login
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Simular notificaciones de recordatorio
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simular notificaciones de citas (en una app real vendrían de la BD)
      const now = new Date();
      const businessName = business?.name || 'KDice Reservas';
      const mockNotifications = [
        {
          id: 1,
          title: '🔔 Recordatorio',
          message: `Tu cita en ${businessName} es en 1 hora`,
          time: new Date(now.getTime() + 60 * 60 * 1000), // 1 hora después
          type: 'reminder'
        },
        {
          id: 2,
          title: '📅 Nueva cita',
          message: 'Tienes una nueva cita confirmada para mañana',
          time: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutos después
          type: 'appointment'
        },
        {
          id: 3,
          title: '💰 Pago recibido',
          message: 'Pago confirmado para servicio de corte de cabello',
          time: new Date(now.getTime() + 15 * 60 * 1000), // 15 minutos después
          type: 'payment'
        }
      ];
      
      setNotifications(mockNotifications);
    }, 1000);

    return () => clearInterval(timer);
  }, [business]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatNotificationTime = (date) => {
    const now = new Date();
    const diff = date - now;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 0) return 'Ahora';
    if (minutes < 60) return `En ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `En ${hours} h`;
  };

  // Si no hay usuario, mostrar loading
  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #FF5E00 0%, #E0007F 50%, #4B0082 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: 'white'
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          overflow: 'hidden'
        }}>
          <img src="/kdice-logo.svg" alt="KDice Reservas" 
               style={{ width: 120, height: 120, objectFit: 'contain' }} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' }}>
          KDice Reservas
        </h2>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
          Cargando...
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #FF5E00 0%, #E0007F 50%, #4B0082 100%)',
        color: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <img src="/kdice-logo.svg" alt="KDice Reservas" 
                 style={{ width: 90, height: 90, objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ 
              margin: '0 0 4px 0', 
              fontSize: '20px', 
              fontWeight: '700' 
            }}>
              {business?.name || 'KDice Reservas'}
            </h1>
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: '14px',
              opacity: 0.9 
            }}>
              Sistema de Gestión de Citas
            </p>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>
            {formatTime(currentTime)}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
            {currentTime.toLocaleDateString('es-ES', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short' 
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '20px' }}>
        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '25px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#FF5E00', marginBottom: '8px' }}>
              8
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Citas hoy
            </div>
          </div>
          
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
              3
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Pendientes
            </div>
          </div>
          
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>
              $450
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Ingresos hoy
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: '700',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📬 Notificaciones
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map(notification => (
              <div key={notification.id} style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  fontSize: '24px',
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  {notification.title.split(' ')[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '4px'
                  }}>
                    {notification.title}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#64748b'
                  }}>
                    {notification.message}
                  </div>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  whiteSpace: 'nowrap'
                }}>
                  {formatNotificationTime(notification.time)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Info */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: '700',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📍 Información del Negocio
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF5E00 0%, #E0007F 50%, #4B0082 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img src="/kdice-logo.svg" alt="KDice Reservas" 
                     style={{ width: 60, height: 60, objectFit: 'contain' }} />
              </div>
              <div>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontWeight: '700',
                  color: '#1f2937'
                }}>
                  {business?.name || 'KDice Reservas'}
                </h3>
                <p style={{ 
                  margin: '4px 0', 
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  Sistema de Reservas Profesional
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px', minWidth: '40px', textAlign: 'center' }}>📍</span>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                {business?.address || 'Dirección del negocio'}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px', minWidth: '40px', textAlign: 'center' }}>📞</span>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                {business?.phone || '+1 234 567 890'}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px', minWidth: '40px', textAlign: 'center' }}>🕐</span>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                {business?.hours || 'Lun-Sáb: 9:00 AM - 8:00 PM'}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('business');
              navigate('/login');
            }}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239,68,68,0.4)',
              transition: 'all 0.3s',
              minWidth: '200px'
            }}
          >
            � Cerrar Sesión
          </button>
          <p style={{ 
            marginTop: '12px', 
            fontSize: '14px', 
            color: '#64748b' 
          }}>
            Salir de la aplicación
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '16px 20px',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '14px'
      }}>
        <p>© 2024 {business?.name || 'KDice Reservas'} - Powered by KDice Reservas</p>
        <p style={{ fontSize: '12px', marginTop: '4px' }}>
          <img src="/kdice-logo.svg" alt="KDice" style={{ width: '16px', height: '16px', verticalAlign: 'middle', marginRight: '4px' }} />
          Sistema de Gestión de Citas v1.0
        </p>
      </div>
    </div>
  );
}
