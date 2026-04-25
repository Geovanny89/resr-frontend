import { CreditCard, Plus, Trash } from 'lucide-react';

export default function PaymentsTab({ 
  form, 
  paymentMethods, 
  onUpdateField,
  onUpdatePaymentMethod,
  onAddPaymentMethod,
  onRemovePaymentMethod,
  onSubmit, 
  saving 
}) {
  return (
    <div className="card">
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
        <CreditCard size={18} style={{color:'var(--primary)'}}/> Métodos de pago
      </h3>
      
      <div className="form-group" style={{ marginBottom: 24, background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
          <input 
            type="checkbox" 
            checked={form.showPaymentMethods} 
            onChange={e => onUpdateField('showPaymentMethods', e.target.checked)}
            style={{ width: 20, height: 20 }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Mostrar métodos de pago en la página</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
              Activa esta opción para mostrar tus métodos de pago en la landing page.
            </div>
          </div>
        </label>
      </div>

      {form.showPaymentMethods && (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {(!paymentMethods || paymentMethods.length === 0) && (
            <p style={{color:'var(--text-muted)',fontSize:13,textAlign:'center',padding:'20px 0'}}>
              No tienes métodos de pago configurados. Agrega uno nuevo.
            </p>
          )}
          
          {paymentMethods.map((method, index) => (
            <div key={index} style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:12,alignItems:'end',padding:16,background:'var(--bg-secondary)',borderRadius:12,border:'1px solid var(--border)'}}>
              <div className="form-group" style={{margin:0}}>
                <label style={{fontSize:12,fontWeight:600,color:'var(--text-muted)'}}>Nombre</label>
                <input 
                  type="text" 
                  value={method.name || ''} 
                  onChange={e => onUpdatePaymentMethod(index, 'name', e.target.value)}
                  placeholder="Nequi, Daviplata, Bancolombia..."
                />
              </div>
              <div className="form-group" style={{margin:0}}>
                <label style={{fontSize:12,fontWeight:600,color:'var(--text-muted)'}}>Número / Cuenta</label>
                <input 
                  type="text" 
                  value={method.number || ''} 
                  onChange={e => onUpdatePaymentMethod(index, 'number', e.target.value)}
                  placeholder="31245557521"
                />
              </div>
              <button 
                type="button" 
                onClick={() => onRemovePaymentMethod(index)}
                style={{padding:'8px 12px',background:'#ef4444',color:'white',border:'none',borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
                title="Eliminar"
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
          
          <button 
            type="button" 
            className="btn-secondary"
            onClick={onAddPaymentMethod}
            style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}
          >
            <Plus size={16}/> Agregar método de pago
          </button>
        </div>
      )}
      
      <button type="submit" className="btn-primary" style={{marginTop:24}} disabled={saving}>
        {saving ? 'Guardando...' : '💾 Guardar métodos de pago'}
      </button>
    </div>
  );
}
