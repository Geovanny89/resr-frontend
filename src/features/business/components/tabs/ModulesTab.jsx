import { Store } from 'lucide-react';

const MODULES = [
  {
    key: 'cashRegister',
    icon: '💰',
    bg: '#f0fdf4',
    title: 'Caja / Turnos',
    description: 'Control de turnos, movimientos de efectivo y cortes de caja'
  },
  {
    key: 'expenses',
    icon: '📉',
    bg: '#fef2f2',
    title: 'Gastos / Egresos',
    description: 'Registra arriendo, servicios, insumos, nómina y otros gastos'
  },
  {
    key: 'inventory',
    icon: '📦',
    bg: '#eff6ff',
    title: 'Control de Insumos',
    description: 'Gestiona materiales, stock y registro de consumo (no es para ventas)'
  },
  {
    key: 'deposits',
    icon: '🏦',
    bg: '#fff7ed',
    title: 'Depósitos / Anticipos',
    description: 'Gestiona anticipos de clientes para reducir citas fantasma'
  }
];

export default function ModulesTab({ 
  form, 
  onModuleToggle,
  onDepositConfigUpdate,
  onSubmit, 
  saving 
}) {
  const enabledModules = form.enabledModules || {};
  const depositConfig = form.depositConfig || {};

  return (
    <div className="card">
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
        <Store size={18} style={{color:'var(--primary)'}}/> Módulos Opcionales
      </h3>
      <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:20}}>
        Activa o desactiva los módulos adicionales según las necesidades de tu negocio.
      </p>

      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        {MODULES.map(({key, icon, bg, title, description}) => (
          <div key={key} style={{
            padding:16,
            background:'var(--bg-secondary)',
            borderRadius:12,
            border:'1px solid var(--border)'
          }}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom: enabledModules[key] && key === 'deposits' ? 16 : 0}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{
                  width:44,height:44,borderRadius:10,background:bg,
                  display:'flex',alignItems:'center',justifyContent:'center'
                }}>
                  <span style={{fontSize:20}}>{icon}</span>
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:15}}>{title}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>
                    {description}
                  </div>
                </div>
              </div>
              <label style={{
                position:'relative',display:'inline-block',width:50,height:26,
                cursor:'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={enabledModules[key] || false}
                  onChange={(e) => onModuleToggle(key, e.target.checked)}
                  style={{opacity:0,width:0,height:0}}
                />
                <span style={{
                  position:'absolute',cursor:'pointer',top:0,left:0,right:0,bottom:0,
                  backgroundColor: enabledModules[key] ? '#10b981' : '#d1d5db',
                  borderRadius:26,transition:'0.4s'
                }}/>
                <span style={{
                  position:'absolute',content:'""',height:20,width:20,left:3,bottom:3,
                  backgroundColor:'white',borderRadius:'50%',transition:'0.4s',
                  transform: enabledModules[key] ? 'translateX(24px)' : 'translateX(0)'
                }}/>
              </label>
            </div>

            {key === 'deposits' && enabledModules[key] && (
              <div style={{borderTop:'1px solid var(--border)',paddingTop:16}}>
                <div style={{fontWeight:600,fontSize:14,marginBottom:12,color:'var(--primary)'}}>
                  ⚙️ Configuración de Anticipos
                </div>

                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <label style={{fontSize:13,fontWeight:500}}>
                    🔒 Anticipo obligatorio para agendar
                  </label>
                  <input
                    type="checkbox"
                    checked={depositConfig.required || false}
                    onChange={(e) => onDepositConfigUpdate('required', e.target.checked)}
                    style={{width:18,height:18,cursor:'pointer'}}
                  />
                </div>

                <div style={{display:'flex',gap:12,marginBottom:12}}>
                  <div style={{flex:1}}>
                    <label style={{display:'block',fontSize:12,color:'var(--text-muted)',marginBottom:4}}>
                      💰 Monto fijo ($)
                    </label>
                    <input
                      type="number"
                      value={depositConfig.amount || 0}
                      onChange={(e) => onDepositConfigUpdate('amount', parseInt(e.target.value) || 0)}
                      placeholder="Ej: 20000"
                      style={{
                        width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',
                        fontSize:13,background:'var(--bg)',color:'var(--text)'
                      }}
                    />
                  </div>
                  <div style={{flex:1}}>
                    <label style={{display:'block',fontSize:12,color:'var(--text-muted)',marginBottom:4}}>
                      📊 O porcentaje (%)
                    </label>
                    <input
                      type="number"
                      value={depositConfig.percentage ?? 30}
                      onChange={(e) => onDepositConfigUpdate('percentage', parseInt(e.target.value) ?? 30)}
                      placeholder="Ej: 30"
                      min="0"
                      max="100"
                      style={{
                        width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',
                        fontSize:13,background:'var(--bg)',color:'var(--text)'
                      }}
                    />
                  </div>
                </div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:16,marginTop:-8}}>
                  💡 Si dejas el monto en $0, se calculará el porcentaje sobre el precio del servicio
                </div>

                <div style={{marginBottom:12}}>
                  <label style={{display:'block',fontSize:12,color:'var(--text-muted)',marginBottom:4}}>
                    ⏰ Horas antes para cancelar sin penalidad
                  </label>
                  <input
                    type="number"
                    value={depositConfig.cancelationHours || 24}
                    onChange={(e) => onDepositConfigUpdate('cancelationHours', parseInt(e.target.value) || 0)}
                    placeholder="Ej: 24"
                    style={{
                      width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',
                      fontSize:13,background:'var(--bg)',color:'var(--text)'
                    }}
                  />
                </div>

                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <label style={{fontSize:13,fontWeight:500}}>
                    ⚠️ Penalidad por no asistir / cancelar tarde
                  </label>
                  <input
                    type="checkbox"
                    checked={depositConfig.penaltyEnabled !== false}
                    onChange={(e) => onDepositConfigUpdate('penaltyEnabled', e.target.checked)}
                    style={{width:18,height:18,cursor:'pointer'}}
                  />
                </div>

                <div style={{marginBottom:8}}>
                  <label style={{display:'block',fontSize:12,color:'var(--text-muted)',marginBottom:4}}>
                    📝 Términos y condiciones (que verá el cliente)
                  </label>
                  <textarea
                    value={depositConfig.termsText || 'El anticipo garantiza tu cita. Si cancelas con menos de 24 horas de anticipo o no asistes, el anticipo será retenido como penalidad. Puedes reagendar una vez sin costo adicional.'}
                    onChange={(e) => onDepositConfigUpdate('termsText', e.target.value)}
                    rows={3}
                    style={{
                      width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',
                      fontSize:13,background:'var(--bg)',color:'var(--text)',resize:'vertical'
                    }}
                  />
                </div>
              </div>
            )}

            {key === 'cashRegister' && enabledModules[key] && (
              <div style={{borderTop:'1px solid var(--border)',paddingTop:16}}>
                <div style={{fontWeight:600,fontSize:14,marginBottom:12,color:'var(--primary)'}}>
                  ⚙️ Configuración de Caja
                </div>

                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <div style={{flex:1}}>
                    <label style={{fontSize:13,fontWeight:500}}>
                      📲 Incluir transferencias en el total de caja
                    </label>
                    <div style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>
                      Si está activado, los pagos por transferencia se sumarán al total de caja. Si está desactivado, solo se contará el efectivo.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.includeTransfersInCashRegister !== false}
                    onChange={(e) => onDepositConfigUpdate('includeTransfersInCashRegister', e.target.checked)}
                    style={{width:18,height:18,cursor:'pointer'}}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button type="submit" className="btn-primary" disabled={saving} style={{marginTop:24}}>
        {saving ? 'Guardando...' : '💾 Guardar configuración'}
      </button>
    </div>
  );
}
