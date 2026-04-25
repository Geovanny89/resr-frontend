import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { plans } from '../constants';

export function Pricing() {
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();

  return (
    <section id="pricing" style={{ padding: '120px 24px', background: isDark ? colors.bgSecondary : '#f8fafc' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, marginBottom: 20, color: colors.text }}>
            Planes que crecen contigo
          </h2>
          <p style={{ color: colors.textSecondary, fontSize: 18 }}>
            Elige el plan perfecto para tu equipo. Empleados adicionales a solo $20.000 cada uno. El admin no cuenta.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
          {plans.map((plan, i) => (
            <PricingCard key={i} plan={plan} isDark={isDark} colors={colors} onCtaClick={() => navigate('/register-vendor')} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48, padding: '24px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: '16px' }}>
          <p style={{ color: colors.textSecondary, fontSize: 14, margin: 0 }}>
            💡 <strong>¿Necesitas más empleados?</strong> Cada empleado adicional cuesta $20.000 COP/mes sin importar tu plan. El administrador no cuenta en el límite.
          </p>
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan, isDark, colors, onCtaClick }) {
  return (
    <div style={{
      position: 'relative',
      border: plan.popular ? '2px solid ' + plan.color : '1px solid ' + (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
      borderRadius: '24px',
      padding: '40px 32px',
      background: isDark ? colors.bgPrimary : 'white',
      boxShadow: plan.popular ? '0 20px 40px -15px ' + plan.color + '40' : '0 4px 20px rgba(0,0,0,0.08)',
    }}>
      {plan.popular && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: plan.color,
          color: 'white',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Más Popular
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: colors.text }}>{plan.name}</h3>
        <p style={{ fontSize: 14, color: colors.textSecondary }}>{plan.desc}</p>
      </div>

      <div style={{
        background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
        borderRadius: '16px',
        padding: '20px',
        textAlign: 'center',
        marginBottom: 24
      }}>
        <div style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
          {plan.users} empleados incluidos
        </div>
        <div style={{ fontSize: 'clamp(32px, 6vw, 44px)', fontWeight: 800, color: plan.color }}>
          {plan.price}
        </div>
        <div style={{ fontSize: 14, color: colors.textSecondary }}>
          COP / mes
        </div>
      </div>

      <button
        onClick={onCtaClick}
        className="btn-primary"
        style={{
          width: '100%',
          marginBottom: 32,
          padding: '16px',
          background: plan.popular ? plan.color : (isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'),
          color: plan.popular ? 'white' : colors.text,
          border: 'none',
          borderRadius: '12px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        {plan.cta}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {plan.features.map((f, j) => {
          const isExtraUser = f.includes('+ $');
          return (
            <div key={j} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 14,
              color: isExtraUser ? plan.color : colors.text,
              fontWeight: isExtraUser ? 600 : 400
            }}>
              <span style={{ fontSize: 16 }}>{isExtraUser ? '+' : '✓'}</span>
              {f.replace('✅ ', '').replace('+ ', '')}
            </div>
          );
        })}
      </div>
    </div>
  );
}
