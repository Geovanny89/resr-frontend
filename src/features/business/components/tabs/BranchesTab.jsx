import { Store, Plus, Globe } from 'lucide-react';

export default function BranchesTab({ 
  business, 
  branches, 
  onOpenModal 
}) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Store size={18} style={{ color: 'var(--primary)' }}/> Mis Sucursales
        </h3>
        {!business?.isBranch && (
          <button type="button" className="btn-primary" onClick={onOpenModal}>
            <Plus size={14}/> Solicitar Sucursal
          </button>
        )}
      </div>

      <div style={{ background: '#f0f9ff', padding: 16, borderRadius: 12, border: '1px solid #bae6fd', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: '#0369a1', margin: 0, fontWeight: 500 }}>
          🎁 ¡Aprovecha nuestro beneficio! Cada sucursal nueva tiene un <strong>50% de descuento (35.000)</strong> en la suscripción mensual. 
          Solo debes subir el comprobante de pago para que la habilitemos.
        </p>
      </div>

      {branches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, border: '2px dashed var(--border)', borderRadius: 12, color: 'var(--text-muted)' }}>
          <Store size={40} style={{ opacity: 0.2, marginBottom: 12 }}/>
          <p style={{ margin: 0 }}>No tienes sucursales registradas aún.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {branches.map(b => (
            <div key={b.id} style={{ 
              padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{b.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.address || 'Sin dirección'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ 
                  fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                  background: b.branchStatus === 'approved' ? '#dcfce7' : b.branchStatus === 'pending_approval' ? '#fef3c7' : '#fee2e2',
                  color: b.branchStatus === 'approved' ? '#166534' : b.branchStatus === 'pending_approval' ? '#92400e' : '#991b1b'
                }}>
                  {b.branchStatus === 'approved' ? 'Activa' : b.branchStatus === 'pending_approval' ? 'Pendiente' : 'Rechazada'}
                </span>
                <button type="button" className="btn-icon" onClick={() => window.open(`/${b.slug}`, '_blank')}>
                  <Globe size={16}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
