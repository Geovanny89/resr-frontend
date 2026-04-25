import {
  Building2, CheckCircle, XCircle, Clock, AlertTriangle,
  Image, Check, X, Store, CreditCard, Eye, Lock, Unlock,
  Trash2, UserPlus
} from 'lucide-react';

const SUB_LABELS = {
  pending: { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7', text: '#92400e' },
  paid:    { label: 'Pagado',    color: '#10b981', bg: '#d1fae5', text: '#065f46' },
  overdue: { label: 'Vencido',    color: '#ef4444', bg: '#fee2e2', text: '#991b1b' },
};

// Extraer la URL base del backend desde el cliente API
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const BACKEND_URL = API_BASE_URL.replace(/\/api$/, '');

function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_URL}${cleanUrl}`;
}

function getTypeInfo(biz, businessTypes) {
  const type = businessTypes.find(t => t.id === biz.type);
  return type ? {
    icon: <Building2 size={14} />,
    label: type.name
  } : { icon: <Building2 size={14} />, label: 'Desconocido' };
}

export default function BusinessCard({ 
  biz, 
  businessTypes,
  onViewScreenshot,
  onApproveBranch,
  onQuickAddUsers,
  onViewDetails,
  onToggleStatus,
  onDelete
}) {
  const typeInfo = getTypeInfo(biz, businessTypes);
  const subInfo = SUB_LABELS[biz.subscriptionStatus] || SUB_LABELS.pending;

  const planColors = {
    basic: { bg: '#d1fae5', text: '#065f46' },
    pro: { bg: '#e0e7ff', text: '#3730a3' },
    premium: { bg: '#fef3c7', text: '#92400e' }
  };
  const planColor = planColors[biz.subscriptionPlan] || planColors.basic;

  return (
    <div className="card" style={{ 
      padding: 20, border: '1px solid var(--border)',
      borderRadius: 16, background: 'var(--surface)',
      display: 'flex', flexDirection: 'column', height: '100%',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, flexShrink: 0,
          background: biz.status === 'active' ? 'linear-gradient(135deg, var(--gray-50), var(--gray-100))' : 'var(--gray-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          border: '1px solid var(--border)'
        }}>
          {biz.logoUrl
            ? <img src={getImgUrl(biz.logoUrl)} alt="" style={{ width: '100%', height: '100%', borderRadius: 14, objectFit: 'cover' }} />
            : typeInfo.icon
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{biz.name}</h3>
          <p style={{ margin: '2px 0 4px', fontSize: 12, color: 'var(--primary)', fontWeight: 600, fontFamily: 'monospace' }}>/{biz.slug}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-main)', fontWeight: 500 }}>{biz.Owner?.name || '—'}</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{biz.Owner?.email || '—'}</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 'auto', flexWrap: 'wrap' }}>
        <span className="badge" style={{ 
          padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
          background: biz.status === 'active' ? 'var(--success-bg)' : 'var(--danger-bg)', 
          color: biz.status === 'active' ? 'var(--success-text)' : 'var(--danger-text)',
          display: 'flex', alignItems: 'center', gap: 4
        }}>
          {biz.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {biz.status === 'active' ? 'Activa' : 'Bloqueada'}
        </span>
        <span className="badge" style={{ 
          padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
          background: subInfo.bg, color: subInfo.text,
          display: 'flex', alignItems: 'center', gap: 4
        }}>
          {biz.subscriptionStatus === 'paid' && <CheckCircle size={12} />}
          {biz.subscriptionStatus === 'pending' && <Clock size={12} />}
          {biz.subscriptionStatus === 'overdue' && <AlertTriangle size={12} />}
          {subInfo.label}
        </span>
        
        {/* Badge del Plan */}
        <span className="badge" style={{ 
          padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
          background: planColor.bg,
          color: planColor.text,
          display: 'flex', alignItems: 'center', gap: 4
        }}>
          <Building2 size={12} />
          {biz.subscriptionPlan === 'basic' && 'Básico'}
          {biz.subscriptionPlan === 'pro' && 'Pro'}
          {biz.subscriptionPlan === 'premium' && 'Premium'}
          {!biz.subscriptionPlan && 'Básico'}
          ({(biz.includedUsers || 3) + (biz.additionalUsers || 0)} empleados)
        </span>
        
        {/* Badge de Precio Personalizado */}
        {biz.customMonthlyPrice && (
          <span className="badge" style={{ 
            padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
            background: '#fef3c7', 
            color: '#92400e',
            display: 'flex', alignItems: 'center', gap: 4,
            border: '2px solid #f59e0b'
          }}>
            <CreditCard size={12} />
            ${biz.customMonthlyPrice.toLocaleString()} personalizado
          </span>
        )}
        
        {biz.isBranch && (
          <span className="badge" style={{ 
            padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
            background: biz.branchStatus === 'approved' ? '#e0f2fe' : '#fef3c7', 
            color: biz.branchStatus === 'approved' ? '#0369a1' : '#92400e',
            display: 'flex', alignItems: 'center', gap: 4,
            border: biz.branchStatus === 'pending_approval' ? '2px solid #f59e0b' : 'none',
            animation: biz.branchStatus === 'pending_approval' ? 'pulse 2s infinite' : 'none'
          }}>
            <Store size={12} />
            {biz.branchStatus === 'pending_approval' ? 'NUEVA SUCURSAL' : 'Sucursal'}
          </span>
        )}
        {(biz.paymentScreenshot || biz.branchPaymentScreenshot) && (!biz.paymentScreenshotViewed) && (
          <span className="badge" style={{ 
            padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
            background: 'var(--info-bg)', color: 'var(--info-text)',
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            <Image size={12} />
            Nuevo comprobante
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        {(biz.paymentScreenshot || biz.branchPaymentScreenshot) && (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button 
              className="btn-icon" 
              onClick={() => onViewScreenshot(biz)}
              title="Ver comprobante"
              style={{ 
                background: !biz.paymentScreenshotViewed ? 'var(--info-bg)' : 'var(--gray-100)', 
                color: !biz.paymentScreenshotViewed ? 'var(--info-text)' : 'var(--text-muted)',
                border: (!biz.paymentScreenshotViewed || biz.branchStatus === 'pending_approval') ? '2px solid var(--primary)' : '1px solid var(--border)',
                position: 'relative'
              }}
            >
              <Image size={18} />
              {!biz.paymentScreenshotViewed && (
                <span style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'var(--danger)',
                  border: '2px solid var(--surface)'
                }} />
              )}
            </button>
          </div>
        )}
        {biz.branchStatus === 'pending_approval' && (
          <>
            <button 
              className="btn-icon" 
              onClick={() => onApproveBranch(biz.id, true)}
              title="Aprobar sucursal"
              style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}
            >
              <CheckCircle size={18} />
            </button>
            <button 
              className="btn-icon" 
              onClick={() => onApproveBranch(biz.id, false)}
              title="Rechazar sucursal"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)' }}
            >
              <XCircle size={18} />
            </button>
          </>
        )}
        {/* Botón rápido para agregar usuarios */}
        <button 
          className="btn-icon" 
          onClick={() => onQuickAddUsers(biz)}
          title="Agregar usuarios rápido"
          style={{ background: '#e0e7ff', color: '#3730a3' }}
        >
          <UserPlus size={18} />
        </button>
        
        <button 
          className="btn-icon" 
          onClick={() => onViewDetails(biz)}
          title="Ver detalles"
          style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}
        >
          <Eye size={18} />
        </button>
        <button 
          className="btn-icon" 
          onClick={() => onToggleStatus(biz)}
          title={biz.status === 'active' ? 'Bloquear' : 'Desbloquear'}
          style={{ 
            background: biz.status === 'active' ? 'var(--danger-bg)' : 'var(--success-bg)', 
            color: biz.status === 'active' ? 'var(--danger-text)' : 'var(--success-text)' 
          }}
        >
          {biz.status === 'active' ? <Lock size={18} /> : <Unlock size={18} />}
        </button>
        <button 
          className="btn-icon" 
          onClick={() => onDelete(biz)}
          title="Eliminar negocio"
          style={{ 
            background: 'var(--danger-bg)', 
            color: 'var(--danger-text)'
          }}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
