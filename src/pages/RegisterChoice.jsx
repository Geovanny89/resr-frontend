import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function RegisterChoice() {
  const navigate = useNavigate();
  const { colors } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      position: 'relative'
    }}>
      <style>{`
        @media (max-width: 420px) {
          .register-choice-title { font-size: 28px !important; }
          .register-choice-sub { font-size: 15px !important; }
          .register-choice-grid { grid-template-columns: 1fr !important; }
          .register-choice-card { padding: 20px !important; }
        }
      `}</style>
      {/* Theme Toggle */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20
      }}>
        <ThemeToggle />
      </div>

      <div style={{
        maxWidth: 800,
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 48,
          color: 'white'
        }}>
          <h1 className="register-choice-title" style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>
            🎲 K-Dice
          </h1>
          <p className="register-choice-sub" style={{ fontSize: 18, opacity: 0.9 }}>
            Elige cómo quieres comenzar
          </p>
        </div>

        {/* Opciones */}
        <div className="register-choice-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
          marginBottom: 32
        }}>
          {/* Cliente */}
          <div className="register-choice-card" style={{
            background: colors.cardBg,
            borderRadius: 12,
            padding: 32,
            textAlign: 'center',
            boxShadow: `0 10px 40px ${colors.shadow}`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
            border: `1px solid ${colors.border}`
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = `0 15px 50px ${colors.shadow}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 10px 40px ${colors.shadow}`;
            }}
            onClick={() => navigate('/register-client')}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: colors.text }}>
              Soy Cliente
            </h2>
            <p style={{ color: colors.textSecondary, marginBottom: 24, lineHeight: 1.6 }}>
              Quiero reservar citas en barberías, spas o salones de belleza
            </p>
            <button style={{
              background: colors.primary,
              color: 'white',
              border: 'none',
              padding: '12px 32px',
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 6,
              cursor: 'pointer',
              width: '100%',
              transition: 'background 0.2s'
            }}
              onMouseEnter={e => e.target.style.background = colors.primaryDark}
              onMouseLeave={e => e.target.style.background = colors.primary}
            >
              Continuar como Cliente
            </button>
          </div>

          {/* Vendedor */}
          <div className="register-choice-card" style={{
            background: colors.cardBg,
            borderRadius: 12,
            padding: 32,
            textAlign: 'center',
            boxShadow: `0 10px 40px ${colors.shadow}`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
            border: `2px solid ${colors.primary}`
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = `0 15px 50px ${colors.shadow}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 10px 40px ${colors.shadow}`;
            }}
            onClick={() => navigate('/register-vendor')}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: colors.text }}>
              Soy Vendedor
            </h2>
            <p style={{ color: colors.textSecondary, marginBottom: 24, lineHeight: 1.6 }}>
              Quiero crear mi negocio y gestionar citas de mis clientes
            </p>
            <button style={{
              background: colors.gradient,
              color: 'white',
              border: 'none',
              padding: '12px 32px',
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 6,
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => {
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'scale(1)';
              }}
            >
              Crear mi Negocio
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <p style={{ marginBottom: 12 }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{
              color: '#fff',
              fontWeight: 700,
              textDecoration: 'underline'
            }}>
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
