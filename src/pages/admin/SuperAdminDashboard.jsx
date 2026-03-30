import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import { Plus, Edit2, Trash2, Building2, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = { active: '#10b981', blocked: '#ef4444' };
const STATUS_LABELS = { active: 'Activo', blocked: 'Bloqueado' };
const SUB_STATUS = { pending: 'Pendiente', paid: 'Al dia', overdue: 'Vencido' };

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'otro', description: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (user?.role !== 'superadmin') window.location.href = '/admin';
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const [bizRes, typesRes] = await Promise.all([
        api.get('/businesses'),
        api.get('/business-types/all'),
      ]);
      setBusinesses(bizRes.data);
      setBusinessTypes(typesRes.data);
    } catch(e) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpenModal = (biz = null) => {
    if (biz) {
      setForm({ name: biz.name, type: biz.type, description: biz.description || '', phone: biz.phone || '', address: biz.address || '' });
      setEditingId(biz.id);
    } else {
      setForm({ name: '', type: businessTypes[0]?.value || 'otro', description: '', phone: '', address: '' });
      setEditingId(null);
    }
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/businesses/${editingId}`, form);
        showToast('Negocio actualizado');
      } else {
        await api.post('/businesses', form);
        showToast('Negocio creado');
      }
      await load();
      setShowModal(false);
    } catch(e) {
      setError(e.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este negocio? Esta accion no se puede deshacer.')) return;
    try {
      await api.delete(`/businesses/${id}`);
      await load();
      showToast('Negocio eliminado');
    } catch(e) {
      showToast('Error al eliminar', 'error');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/businesses/${id}/toggle-status`);
      await load();
      showToast(currentStatus === 'active' ? 'Negocio bloqueado' : 'Negocio activado');
    } catch(e) {
      showToast('Error al cambiar estado', 'error');
    }
  };

  const getTypeLabel = (value) => {
    const t = businessTypes.find(t => t.value === value);
    return t ? `${t.icon} ${t.label}` : value;
  };

  const stats = {
    total: businesses.length,
    active: businesses.filter(b => b.status === 'active').length,
    blocked: businesses.filter(b => b.status === 'blocked').length,
    paid: businesses.filter(b => b.subscriptionStatus === 'paid').length,
  };

  return (
    <AdminLayout title="Panel SuperAdmin" subtitle="Gestion global del sistema K-Dice POS">
      <style>{`
        @media (max-width: 480px) {
          .admin-sa-actions button { width: 100%; justify-content: center; }
          .admin-sa-modal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {toast && (
        <div style={{position:'fixed',top:20,right:20,zIndex:9999,padding:'12px 20px',borderRadius:10,background:toast.type==='error'?'#f56565':'#48bb78',color:'white',fontWeight:600,boxShadow:'0 4px 20px rgba(0,0,0,0.2)'}}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:16,marginBottom:28}}>
        {[
          {label:'Total negocios', value:stats.total,  color:'#667eea', icon:'🏢'},
          {label:'Activos',        value:stats.active,  color:'#10b981', icon:'✅'},
          {label:'Bloqueados',     value:stats.blocked, color:'#ef4444', icon:'🚫'},
          {label:'Con pago',       value:stats.paid,    color:'#f6ad55', icon:'💳'},
        ].map(s => (
          <div key={s.label} className="card" style={{textAlign:'center',borderTop:`4px solid ${s.color}`,padding:'20px 16px'}}>
            <div style={{fontSize:28,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:28,fontWeight:800,color:s.color}}>{s.value}</div>
            <div style={{fontSize:12,color:'var(--text-muted)',fontWeight:500}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div className="admin-sa-actions" style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        <button className="btn-primary" onClick={()=>handleOpenModal()}>
          <Plus size={16}/> Nuevo negocio
        </button>
        <button className="btn-secondary" onClick={()=>navigate('/superadmin/business-types')}>
          <Tag size={16}/> Gestionar tipos de negocio
        </button>
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:60,color:'var(--text-muted)'}}>Cargando negocios...</div>
      ) : businesses.length === 0 ? (
        <div style={{textAlign:'center',padding:60,color:'var(--text-muted)'}}>
          <Building2 size={48} style={{marginBottom:16,opacity:0.3}}/>
          <p>No hay negocios registrados aun.</p>
        </div>
      ) : (
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}>
            <table className="table">
              <thead>
                <tr>
                  <th>Negocio / Dueno</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Suscripcion</th>
                  <th>Comprobante</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#667eea,#764ba2)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:14,flexShrink:0}}>
                          {b.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{fontWeight:700,fontSize:14}}>{b.name}</div>
                          <div style={{fontSize:11,color:'var(--text-muted)'}}>{b.Owner?.name} &middot; {b.Owner?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{fontSize:13}}>{getTypeLabel(b.type)}</span>
                    </td>
                    <td>
                      <span style={{fontSize:11,padding:'3px 10px',borderRadius:20,fontWeight:600,background:b.status==='active'?'#dcfce7':'#fee2e2',color:b.status==='active'?'#16a34a':'#dc2626'}}>
                        {STATUS_LABELS[b.status]}
                      </span>
                    </td>
                    <td>
                      <select value={b.subscriptionStatus} onChange={async(e)=>{
                        try{await api.patch(`/businesses/${b.id}/subscription`,{subscriptionStatus:e.target.value});await load();}catch(err){showToast('Error','error');}
                      }} style={{fontSize:12,padding:'4px 8px',borderRadius:6,border:'1px solid var(--border)'}}>
                        {Object.entries(SUB_STATUS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                      </select>
                    </td>
                    <td>
                      {b.paymentScreenshot ? (
                        <a href={`${(api.defaults.baseURL||'').replace('/api','')}${b.paymentScreenshot}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{padding:'4px 10px',fontSize:11,textDecoration:'none',display:'inline-block'}}>
                          Ver imagen
                        </a>
                      ) : (
                        <span style={{fontSize:11,color:'var(--text-muted)'}}>Sin envio</span>
                      )}
                    </td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn-outline btn-sm" onClick={()=>handleOpenModal(b)} title="Editar"><Edit2 size={13}/></button>
                        <button className={b.status==='active'?'btn-warning btn-sm':'btn-success btn-sm'} onClick={()=>handleToggleStatus(b.id,b.status)} title={b.status==='active'?'Bloquear':'Activar'}>
                          {b.status==='active'?'🚫':'✅'}
                        </button>
                        <button className="btn-danger btn-sm" onClick={()=>handleDelete(b.id)} title="Eliminar"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editingId ? 'Editar negocio' : 'Nuevo negocio'}</div>
              <button className="btn-ghost btn-icon" onClick={()=>setShowModal(false)}>X</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
                <div className="form-group">
                  <label>Nombre del negocio *</label>
                  <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label>Tipo de negocio *</label>
                  <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                    {businessTypes.filter(t=>t.active).map(t=>(
                      <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Descripcion</label>
                  <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3}/>
                </div>
                <div className="admin-sa-modal-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div className="form-group">
                    <label>Telefono</label>
                    <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
                  </div>
                  <div className="form-group">
                    <label>Direccion</label>
                    <input type="text" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={()=>setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
