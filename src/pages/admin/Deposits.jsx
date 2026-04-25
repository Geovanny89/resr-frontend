import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
import { DollarSign, Plus, CheckCircle, XCircle, Clock, ArrowRightCircle, User, X } from 'lucide-react';

const STATUS_CONFIG = {
  held: { label: 'Retenido', color: '#f59e0b', icon: <Clock size={14} /> },
  applied: { label: 'Aplicado', color: '#10b981', icon: <CheckCircle size={14} /> },
  refunded: { label: 'Reembolsado', color: '#3b82f6', icon: <ArrowRightCircle size={14} /> },
  forfeited: { label: 'Perdido', color: '#ef4444', icon: <XCircle size={14} /> }
};

const PAYMENT_METHODS = {
  cash: '💵 Efectivo',
  transfer: '📲 Transferencia',
  nequi: '📱 Nequi',
  daviplata: '📲 Daviplata'
};

export default function Deposits() {
  const { business } = useAuth();
  const { colors } = useTheme();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [appointments, setAppointments] = useState([]);
  
  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Toast notification state
  const [statusMsg, setStatusMsg] = useState(null);
  const showStatus = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  useEffect(() => {
    if (business?.id) {
      loadDeposits();
      loadAppointments();
    }
  }, [business, filterStatus]);

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const params = { businessId: business.id };
      if (filterStatus !== 'all') params.status = filterStatus;
      
      const res = await api.get('/deposits', { params });
      setDeposits(res.data.deposits || []);
    } catch (e) {
      console.error('Error cargando depósitos:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await api.get('/appointments', {
        params: { 
          businessId: business.id,
          status: 'pending,confirmed'
        }
      });
      setAppointments(res.data || []);
    } catch (e) {
      console.error('Error cargando citas:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/deposits', {
        ...form,
        businessId: business.id,
        amount: parseFloat(form.amount)
      });
      setShowModal(false);
      setForm({
        clientName: '', clientPhone: '', amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash', notes: ''
      });
      loadDeposits();
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyToAppointment = async (appointmentId) => {
    if (!selectedDeposit) return;
    
    setSaving(true);
    try {
      await api.post(`/deposits/${selectedDeposit.id}/apply`, { appointmentId });
      setShowApplyModal(false);
      setSelectedDeposit(null);
      loadDeposits();
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al aplicar depósito', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeStatus = async (depositId, newStatus) => {
    try {
      await api.patch(`/deposits/${depositId}/status`, { status: newStatus });
      loadDeposits();
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al cambiar estado', 'error');
    }
  };

  const heldDeposits = deposits.filter(d => d.status === 'held');
  const totalHeld = heldDeposits.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

  return (
    <AdminLayout title="Depósitos/Anticipos" subtitle="Gestiona los anticipos de tus clientes">
      {/* Resumen */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 16,
        marginBottom: 24 
      }}>
        <div style={{
          background: colors.cardBg,
          padding: 20,
          borderRadius: 12,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 2px 8px ${colors.shadow}`
        }}>
          <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
            Total retenido
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>
            ${totalHeld.toLocaleString('es-CO')}
          </div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
            {heldDeposits.length} depósito(s) activo(s)
          </div>
        </div>

        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const count = deposits.filter(d => d.status === status).length;
          const total = deposits
            .filter(d => d.status === status)
            .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
          
          if (count === 0) return null;
          
          return (
            <div key={status} style={{
              background: colors.cardBg,
              padding: 16,
              borderRadius: 12,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 2px 8px ${colors.shadow}`
            }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: config.color, marginBottom: 4
              }}>
                {config.icon}
                <span style={{ fontWeight: 600 }}>{config.label}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: colors.text }}>
                ${total.toLocaleString('es-CO')}
              </div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>
                {count} depósito(s)
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtros y acciones - Responsive */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 12,
        marginBottom: 20
      }}>
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          flexWrap: 'wrap',
          justifyContent: 'flex-start'
        }}>
          {[
            { value: 'all', label: 'Todos' },
            { value: 'held', label: 'Retenidos' },
            { value: 'applied', label: 'Aplicados' },
            { value: 'refunded', label: 'Reembolsados' },
            { value: 'forfeited', label: 'Perdidos' }
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 20,
                border: 'none',
                background: filterStatus === f.value ? '#3b82f6' : colors.bgSecondary,
                color: filterStatus === f.value ? 'white' : colors.text,
                fontWeight: 600,
                fontSize: 'clamp(11px, 2.5vw, 13px)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px 16px',
            background: '#3b82f6', color: 'white',
            border: 'none', borderRadius: 8,
            fontWeight: 600, cursor: 'pointer',
            fontSize: 'clamp(13px, 3vw, 14px)',
            width: '100%'
          }}
        >
          <Plus size={18} />
          Nuevo Depósito
        </button>
      </div>

      {/* Tabla de depósitos */}
      <ResponsiveTable
        columns={[
          {
            key: 'date',
            label: 'Fecha',
            render: (v) => new Date(v).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
          },
          {
            key: 'clientName',
            label: 'Cliente',
            render: (v, row) => (
              <div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={14} />
                  {v}
                </div>
                {row.clientPhone && (
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>
                    {row.clientPhone}
                  </div>
                )}
              </div>
            )
          },
          {
            key: 'amount',
            label: 'Monto',
            render: (v) => (
              <span style={{ fontWeight: 700, color: '#3b82f6', fontSize: 16 }}>
                ${parseFloat(v).toLocaleString('es-CO')}
              </span>
            )
          },
          {
            key: 'paymentMethod',
            label: 'Método',
            render: (v) => PAYMENT_METHODS[v] || v
          },
          {
            key: 'status',
            label: 'Estado',
            render: (v) => {
              const config = STATUS_CONFIG[v];
              return (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: config.color + '20',
                  color: config.color,
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {config.icon}
                  {config.label}
                </span>
              );
            }
          },
          {
            key: 'actions',
            label: 'Acciones',
            render: (_, row) => {
              if (row.status !== 'held') return null;
              
              return (
                <div style={{ 
                  display: 'flex', 
                  gap: 6,
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => {
                      setSelectedDeposit(row);
                      setShowApplyModal(true);
                    }}
                    title="Aplicar a cita"
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: '#10b981',
                      color: 'white',
                      fontSize: 'clamp(11px, 2.5vw, 12px)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Aplicar
                  </button>
                  <button
                    onClick={() => handleChangeStatus(row.id, 'refunded')}
                    title="Reembolsar"
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: `1px solid ${colors.border}`,
                      background: 'transparent',
                      color: colors.text,
                      fontSize: 'clamp(11px, 2.5vw, 12px)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Reembolsar
                  </button>
                  <button
                    onClick={() => handleChangeStatus(row.id, 'forfeited')}
                    title="Marcar como perdido"
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: '#ef4444',
                      color: 'white',
                      fontSize: 'clamp(11px, 2.5vw, 12px)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Perder
                  </button>
                </div>
              );
            }
          }
        ]}
        data={deposits}
        loading={loading}
        emptyMessage="No hay depósitos registrados"
      />

      {/* Modal Nuevo Depósito */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 16
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: colors.cardBg, borderRadius: 16, padding: 28,
              maxWidth: 450, width: '100%', maxHeight: '90vh', overflowY: 'auto'
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>
                <DollarSign size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Nuevo Depósito/Anticipo
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={24} color={colors.textSecondary} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  <User size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(e) => setForm({...form, clientName: e.target.value})}
                  placeholder="Nombre completo"
                  required
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={form.clientPhone}
                  onChange={(e) => setForm({...form, clientPhone: e.target.value})}
                  placeholder="Ej: 3001234567"
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text
                  }}
                />
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: 12, 
                marginBottom: 16 
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                    Monto *
                  </label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({...form, amount: e.target.value})}
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%', padding: 10, borderRadius: 8,
                      border: `1px solid ${colors.border}`,
                      background: colors.inputBg, color: colors.text
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    required
                    style={{
                      width: '100%', padding: 10, borderRadius: 8,
                      border: `1px solid ${colors.border}`,
                      background: colors.inputBg, color: colors.text
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Método de pago
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({...form, paymentMethod: value})}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: form.paymentMethod === value ? '2px solid #3b82f6' : `1px solid ${colors.border}`,
                        background: form.paymentMethod === value ? '#eff6ff' : colors.inputBg,
                        color: form.paymentMethod === value ? '#3b82f6' : colors.text,
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Notas
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  placeholder="Notas adicionales..."
                  rows={2}
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text,
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1, padding: 12, borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    background: 'none', color: colors.text,
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1, padding: 12, borderRadius: 10,
                    border: 'none',
                    background: '#3b82f6', color: 'white',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Guardando...' : 'Guardar Depósito'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aplicar a Cita */}
      {showApplyModal && selectedDeposit && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16
        }}>
          <div style={{
            background: colors.cardBg, borderRadius: 16, padding: 28,
            maxWidth: 500, width: '100%', maxHeight: '80vh', overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: colors.text }}>
              <CheckCircle size={24} style={{ verticalAlign: 'middle', marginRight: 8, color: '#10b981' }} />
              Aplicar Depósito a Cita
            </h2>

            <div style={{ 
              background: '#ecfdf5', 
              padding: 16, 
              borderRadius: 8, 
              marginBottom: 20,
              border: '1px solid #a7f3d0'
            }}>
              <div style={{ fontSize: 14, color: '#065f46' }}>
                <strong>Depósito:</strong> ${parseFloat(selectedDeposit.amount).toLocaleString('es-CO')}
              </div>
              <div style={{ fontSize: 14, color: '#065f46', marginTop: 4 }}>
                <strong>Cliente:</strong> {selectedDeposit.clientName}
              </div>
            </div>

            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>
              Selecciona la cita a la que deseas aplicar este depósito:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {appointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: colors.textSecondary }}>
                  No hay citas pendientes o confirmadas
                </div>
              ) : (
                appointments.map(apt => (
                  <button
                    key={apt.id}
                    onClick={() => handleApplyToAppointment(apt.id)}
                    disabled={saving}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      border: `1px solid ${colors.border}`,
                      background: colors.bgSecondary,
                      textAlign: 'left',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1
                    }}
                  >
                    <div style={{ fontWeight: 600, color: colors.text }}>
                      {new Date(apt.startTime).toLocaleDateString('es-CO', { 
                        weekday: 'short', 
                        day: 'numeric',
                        month: 'short'
                      })} - {new Date(apt.startTime).toLocaleTimeString('es-CO', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                      {apt.clientName} • {apt.Service?.name}
                    </div>
                  </button>
                ))
              )}
            </div>

            <button
              onClick={() => setShowApplyModal(false)}
              style={{
                marginTop: 16,
                width: '100%', padding: 12, borderRadius: 10,
                border: `1px solid ${colors.border}`,
                background: 'none', color: colors.text,
                fontWeight: 600, cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {statusMsg && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: statusMsg.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: statusMsg.type === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${statusMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          {statusMsg.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {statusMsg.text}
        </div>
      )}
    </AdminLayout>
  );
}
