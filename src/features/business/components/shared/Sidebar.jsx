import { Globe, Eye, Upload } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useRef } from 'react';
import { getImgUrl } from '../../hooks/useBusiness';

const SUB_STATUS_COLORS = { pending: '#f6ad55', paid: '#48bb78', overdue: '#f56565' };
const SUB_STATUS_LABELS = { pending: 'Pendiente', paid: 'Al día', overdue: 'Vencido' };

export default function Sidebar({ 
  business, 
  form, 
  publicUrl, 
  previewGradient,
  onCopyUrl,
  onPaymentUpload,
  paymentUploading 
}) {
  const paymentRef = useRef();

  return (
    <div className="my-business-sidebar" style={{display:'flex',flexDirection:'column',gap:16,minWidth:0}}>
      {/* Enlace público */}
      {!Capacitor.isNativePlatform() && (
        <div className="card">
          <h3 style={{fontSize:15,fontWeight:700,marginBottom:12,display:'flex',alignItems:'center',gap:8}}>
            <Globe size={16} style={{color:'var(--primary)'}}/> Página pública
          </h3>
          {publicUrl ? (
            <>
              <div style={{background:'var(--bg-secondary)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 14px',marginBottom:12,wordBreak:'break-all',fontSize:12,color:'var(--text-muted)',fontFamily:'monospace'}}>
                {publicUrl}
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn-primary" style={{flex:1,fontSize:12}} onClick={onCopyUrl}>
                  📋 Copiar
                </button>
                <a href={`/${business?.slug}`} target="_blank" rel="noreferrer" style={{flex:1,textDecoration:'none'}}>
                  <button className="btn-secondary" style={{width:'100%',fontSize:12}}>
                    <Eye size={12}/> Ver
                  </button>
                </a>
              </div>
            </>
          ) : (
            <p style={{color:'var(--text-muted)',fontSize:13}}>Guarda el negocio para generar el enlace.</p>
          )}
        </div>
      )}

      {/* Suscripción */}
      <div className="card" style={{borderLeft:`5px solid ${SUB_STATUS_COLORS[business?.subscriptionStatus||'pending']}`}}>
        <h3 style={{fontSize:15,fontWeight:700,marginBottom:12}}>💳 Suscripción</h3>
        <span className="badge" style={{background:SUB_STATUS_COLORS[business?.subscriptionStatus||'pending'],color:'white',padding:'5px 12px',fontSize:13}}>
          {SUB_STATUS_LABELS[business?.subscriptionStatus||'pending']}
        </span>
        {business?.status === 'blocked' && (
          <p style={{color:'#f56565',fontSize:12,fontWeight:700,marginTop:8}}>
            Tu negocio está bloqueado. Sube tu comprobante para reactivarlo.
          </p>
        )}
        <div style={{background:'var(--bg-secondary)',padding:14,borderRadius:8,marginTop:12}}>
          <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:10}}>
            Envía el comprobante de pago mensual para mantener el servicio activo.
          </p>
          <button 
            className="btn-secondary" 
            style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:12}} 
            onClick={()=>paymentRef.current.click()} 
            disabled={paymentUploading}
          >
            <Upload size={12}/> {paymentUploading ? 'Enviando...' : 'Subir comprobante'}
          </button>
          <input ref={paymentRef} type="file" accept="image/*" style={{display:'none'}} onChange={onPaymentUpload}/>
          {business?.paymentScreenshot && (
            <p style={{fontSize:11,color:'#48bb78',marginTop:8,textAlign:'center'}}>
              Comprobante enviado recientemente.
            </p>
          )}
        </div>
      </div>

      {/* Vista previa mini */}
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <div style={{background:previewGradient,padding:'20px 16px',textAlign:'center',color:'white'}}>
          {form.logoUrl ? (
            <img src={getImgUrl(form.logoUrl)} alt="Logo" style={{width:56,height:56,borderRadius:'50%',objectFit:'cover',border:'2px solid rgba(255,255,255,0.8)',marginBottom:8}}/>
          ) : (
            <div style={{fontSize:28,marginBottom:8}}>🏪</div>
          )}
          <div style={{fontWeight:700,fontSize:14}}>{form.name || 'Tu negocio'}</div>
          {form.tagline && <div style={{fontSize:11,opacity:0.8,marginTop:2}}>{form.tagline}</div>}
        </div>
        <div style={{padding:'12px 16px',textAlign:'center',background:'white'}}>
          <span style={{fontSize:11,color:'var(--text-muted)'}}>Vista previa del encabezado</span>
        </div>
      </div>
    </div>
  );
}
