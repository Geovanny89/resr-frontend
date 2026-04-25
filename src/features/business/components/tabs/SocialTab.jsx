import { Share2 } from 'lucide-react';

const ALL_SOCIAL_FIELDS = [
  {field:'whatsapp',  icon:'📱', label:'WhatsApp',  placeholder:'+57 300 000 0000', hint:'Número con código de país. Aparece como botón flotante en tu página.'},
  {field:'whatsappCatalog', icon:'🛍️', label:'Catálogo de WhatsApp', placeholder:'https://wa.me/c/573000000000', hint:'Enlace directo a tu catálogo de productos en WhatsApp.'},
  {field:'instagram', icon:'📸', label:'Instagram', placeholder:'@tunegocio o https://instagram.com/tunegocio'},
  {field:'facebook',  icon:'👤', label:'Facebook',  placeholder:'https://facebook.com/tunegocio'},
  {field:'tiktok',    icon:'🎵', label:'TikTok',    placeholder:'@tunegocio'},
  {field:'twitter',   icon:'🐦', label:'Twitter/X', placeholder:'@tunegocio'},
  {field:'pinterest', icon:'📌', label:'Pinterest', placeholder:'https://pinterest.com/tunegocio'},
  {field:'youtube',   icon:'▶️', label:'YouTube',   placeholder:'https://youtube.com/@tunegocio'},
  {field:'website',   icon:'🌐', label:'Sitio web', placeholder:'https://tunegocio.com'},
];

const WHATSAPP_FIELDS = ['whatsapp', 'whatsappCatalog'];

export default function SocialTab({ 
  form, 
  business,
  onUpdateField, 
  onSubmit, 
  saving,
  showWhatsAppReconnect,
  onReconnectWhatsApp
}) {
  const isWhatsAppDisabled = business?.isBranch && form.useParentWhatsApp;
  // Usar el valor del formulario si está disponible (cambios no guardados), sino usar el de business
  const formHasFieldTechnicians = form.hasFieldTechnicians !== undefined ? form.hasFieldTechnicians : business?.hasFieldTechnicians;
  const hasFieldTechnicians = business?.isBranch 
    ? business?.ParentBusiness?.hasFieldTechnicians || business?.parentHasFieldTechnicians
    : formHasFieldTechnicians;

  return (
    <div className="card">
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
        <Share2 size={18} style={{color:'var(--primary)'}}/> Redes sociales y contacto
      </h3>

      {business?.isBranch && !hasFieldTechnicians && (
        <div className="form-group" style={{ marginBottom: 24, background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
            <input 
              type="checkbox" 
              checked={form.useParentWhatsApp} 
              onChange={e => onUpdateField('useParentWhatsApp', e.target.checked)}
              style={{ width: 20, height: 20 }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Usar WhatsApp del negocio principal</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                Si está activo, los recordatorios y notificaciones se enviarán desde el número del negocio principal.
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Filtrar campos de WhatsApp si tiene técnicos a domicilio */}
      {hasFieldTechnicians && (
        <div style={{ 
          padding: 12, 
          background: 'rgba(245, 158, 11, 0.1)', 
          border: '1px solid rgba(245, 158, 11, 0.3)', 
          borderRadius: 8, 
          marginBottom: 16,
          fontSize: 13,
          color: '#92400e'
        }}>
          <strong>🔧 Modo Técnicos a Domicilio activo:</strong> Los campos de WhatsApp están ocultos porque los técnicos reciben las notificaciones directamente en la app móvil.
        </div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {ALL_SOCIAL_FIELDS.filter(({field}) => !hasFieldTechnicians || !WHATSAPP_FIELDS.includes(field)).map(({field,icon,label,placeholder,hint}) => {
          const disabled = field === 'whatsapp' && isWhatsAppDisabled;
          const value = disabled 
            ? (business?.ParentBusiness?.whatsapp || 'Usando WhatsApp del principal') 
            : (form[field] || '');
          
          return (
            <div key={field} className="form-group" style={{ opacity: disabled ? 0.6 : 1 }}>
              <label style={{display:'flex',alignItems:'center',gap:6}}>
                <span style={{fontSize:16}}>{icon}</span> {label}
              </label>
              <input 
                type="text" 
                value={value}
                onChange={e=>onUpdateField(field, e.target.value)} 
                placeholder={placeholder}
                disabled={disabled}
                style={{ cursor: disabled ? 'not-allowed' : 'text' }}
              />
              {hint && <small style={{color:'var(--text-muted)'}}>{hint}</small>}
              
              {field === 'whatsapp' && showWhatsAppReconnect && !hasFieldTechnicians && (
                <div style={{ marginTop: 12, padding: 12, background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 8 }}>
                  <div style={{ fontSize: 13, color: '#92400e', marginBottom: 8 }}>
                    <strong>⚠️ WhatsApp cambiado:</strong> Debes reconectar la sesión con el nuevo número.
                  </div>
                  <button
                    type="button"
                    onClick={onReconnectWhatsApp}
                    style={{ 
                      padding: '8px 16px', 
                      background: '#f59e0b', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: 6, 
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                  >
                    🔓 Cerrar sesión actual y reconectar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button type="submit" className="btn-primary" style={{marginTop:16}} disabled={saving}>
        {saving ? 'Guardando...' : '💾 Guardar redes sociales'}
      </button>
    </div>
  );
}
