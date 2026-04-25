import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { getPaymentMethodImage } from '../utils';

export default function PaymentMethodsSection({ business, primary, paymentMethods, isDark }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!business.showPaymentMethods || paymentMethods.length === 0) return null;

  return (
    <section className="section-card" style={{ 
      marginTop: 40,
      background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.75)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'
    }}>
      <div className="section-header">
        <span className="section-label">MÉTODOS DE PAGO</span>
        <h2 className="section-title" style={{ color: isDark ? 'white' : '#0f172a' }}>Facilidades para ti</h2>
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: 24 
      }}>
        {paymentMethods.map((method, idx) => (
          <div 
            key={idx} 
            className="payment-method-item"
            style={{ 
              padding: 32, 
              borderRadius: 24, 
              background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc', 
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ 
                width: 56, 
                height: 56, 
                borderRadius: 16, 
                background: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden', 
                boxShadow: '0 8px 16px rgba(0,0,0,0.05)' 
              }}>
                <img 
                  src={getPaymentMethodImage(method.name) || '/banco.png'} 
                  alt={method.name}
                  style={{ width: 36, height: 36, objectFit: 'contain' }} 
                />
              </div>
              <div>
                <div style={{ 
                  fontWeight: 800, 
                  fontSize: 17,
                  color: isDark ? 'white' : '#0f172a'
                }}>
                  {method.name}
                </div>
                <div style={{ 
                  fontSize: 15, 
                  opacity: 0.6, 
                  fontFamily: 'monospace', 
                  letterSpacing: 1,
                  color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b'
                }}>
                  {method.number}
                </div>
              </div>
            </div>
            <button 
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 14, 
                background: `${primary}15`, 
                color: primary, 
                border: 'none', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                transition: 'all 0.2s' 
              }}
              onClick={() => {
                navigator.clipboard.writeText(method.number);
                setCopiedIndex(idx);
                setTimeout(() => setCopiedIndex(null), 2000);
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {copiedIndex === idx ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
