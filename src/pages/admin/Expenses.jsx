import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
import { DollarSign, Plus, TrendingDown, Calendar, FileText, Pencil, Trash2, X } from 'lucide-react';

const CATEGORIES = [
  { value: 'arriendo', label: '🏠 Arriendo', color: '#8b5cf6' },
  { value: 'servicios', label: '💡 Servicios', color: '#f59e0b' },
  { value: 'insumos', label: '📦 Insumos', color: '#10b981' },
  { value: 'nomina', label: '👥 Nómina', color: '#3b82f6' },
  { value: 'marketing', label: '📢 Marketing', color: '#ec4899' },
  { value: 'otros', label: '📋 Otros', color: '#6b7280' }
];

export default function Expenses() {
  const { business } = useAuth();
  const { colors } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editingId, setEditingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Toast notification state
  const [statusMsg, setStatusMsg] = useState(null);
  const showStatus = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  useEffect(() => {
    if (business?.id) loadExpenses();
  }, [business, filterMonth]);

  const loadExpenses = async (skipCache = false) => {
    setLoading(true);
    try {
      const [year, month] = filterMonth.split('-');
      const startDate = `${year}-${month}-01`;
      // Calcular último día del mes correctamente
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = `${year}-${month}-${lastDay}`;
      
      const res = await api.get('/expenses', {
        params: { 
          businessId: business.id,
          startDate,
          endDate,
          noCache: skipCache || undefined
        }
      });
      setExpenses(res.data.expenses || []);
    } catch (e) {
      console.error('Error cargando gastos:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.description || !form.amount) return;
    
    setSaving(true);
    try {
      if (editingId) {
        // Actualizar gasto existente
        await api.put(`/expenses/${editingId}`, {
          ...form,
          amount: parseFloat(form.amount)
        });
      } else {
        // Crear nuevo gasto
        await api.post('/expenses', {
          ...form,
          businessId: business.id,
          amount: parseFloat(form.amount)
        });
      }
      closeModal();
      loadExpenses(true);
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setForm({
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
      paymentMethod: expense.paymentMethod || 'cash',
      notes: expense.notes || ''
    });
    setShowModal(true);
  };

  // Abrir modal de confirmación para eliminar
  const openDeleteConfirm = (expense) => {
    setDeleteTarget(expense);
    setShowDeleteConfirm(true);
  };

  // Eliminar gasto
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setShowDeleteConfirm(false);
    try {
      await api.delete(`/expenses/${deleteTarget.id}`);
      await loadExpenses(true);
      setDeleteTarget(null);
    } catch (e) {
      showStatus('Error al eliminar', 'error');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      notes: ''
    });
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  // Agrupar por categoría
  const byCategory = {};
  expenses.forEach(exp => {
    byCategory[exp.category] = (byCategory[exp.category] || 0) + parseFloat(exp.amount || 0);
  });

  return (
    <AdminLayout title="Gastos" subtitle="Registra y controla los egresos de tu negocio">
      {/* Resumen */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ 
              width: 40, height: 40, borderRadius: 10, 
              background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <TrendingDown size={20} color="#ef4444" />
            </div>
            <span style={{ fontSize: 14, color: colors.textSecondary }}>Total del mes</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>
            ${totalExpenses.toLocaleString('es-CO')}
          </div>
        </div>

        {/* Resumen por categoría */}
        {CATEGORIES.map(cat => {
          const amount = byCategory[cat.value] || 0;
          if (amount === 0) return null;
          return (
            <div key={cat.value} style={{
              background: colors.cardBg,
              padding: 16,
              borderRadius: 12,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 2px 8px ${colors.shadow}`
            }}>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
                {cat.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: cat.color }}>
                ${amount.toLocaleString('es-CO')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtros y acciones */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} color={colors.textSecondary} />
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              background: colors.inputBg,
              color: colors.text,
              fontSize: 14
            }}
          />
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={18} />
          Nuevo Gasto
        </button>
      </div>

      {/* Tabla de gastos */}
      <ResponsiveTable
        columns={[
          {
            key: 'date',
            label: 'Fecha',
            render: (v) => new Date(v).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
          },
          {
            key: 'category',
            label: 'Categoría',
            render: (v) => {
              const cat = CATEGORIES.find(c => c.value === v);
              return (
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: 20, 
                  background: cat?.color + '20',
                  color: cat?.color,
                  fontSize: 12,
                  fontWeight: 600
                }}>
                  {cat?.label || v}
                </span>
              );
            }
          },
          { key: 'description', label: 'Descripción' },
          {
            key: 'amount',
            label: 'Monto',
            render: (v) => (
              <span style={{ fontWeight: 700, color: '#ef4444' }}>
                -${parseFloat(v).toLocaleString('es-CO')}
              </span>
            )
          },
          {
            key: 'paymentMethod',
            label: 'Método',
            render: (v) => v === 'cash' ? '💵 Efectivo' : v === 'transfer' ? '📲 Transferencia' : '💳 Tarjeta'
          },
          {
            key: 'actions',
            label: 'Acciones',
            render: (_, row) => (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleEdit(row)}
                  style={{
                    padding: '6px 10px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  title="Editar"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => openDeleteConfirm(row)}
                  style={{
                    padding: '6px 10px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          }
        ]}
        data={expenses}
        loading={loading}
        emptyMessage="No hay gastos registrados este mes"
      />

      {/* Modal de confirmación para eliminar */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{
            background: 'white', borderRadius: 12, padding: 24,
            maxWidth: 400, width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: 28
              }}>
                🗑️
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 20 }}>¿Eliminar gasto?</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>
                Esta acción no se puede deshacer
              </p>
              {deleteTarget && (
                <div style={{
                  background: '#fef2f2', padding: 12, borderRadius: 8,
                  marginTop: 12, fontSize: 13, color: '#991b1b'
                }}>
                  <strong>{deleteTarget.description}</strong><br />
                  ${deleteTarget.amount?.toLocaleString('es-CO')} - {deleteTarget.category}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
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
                type="button"
                onClick={handleDelete}
                style={{
                  flex: 1, padding: 12, borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white', fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para nuevo gasto */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16
        }}>
          <div style={{
            background: colors.cardBg,
            borderRadius: 16,
            padding: 28,
            maxWidth: 450,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>
                <DollarSign size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                {editingId ? 'Editar Gasto' : 'Nuevo Gasto'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color={colors.textSecondary} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Categoría *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  required
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text
                  }}
                >
                  <option value="">Selecciona categoría</option>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Descripción *
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="Ej: Pago de arriendo"
                  required
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
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
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { value: 'cash', label: '💵 Efectivo' },
                    { value: 'transfer', label: '📲 Transferencia' },
                    { value: 'card', label: '💳 Tarjeta' }
                  ].map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setForm({...form, paymentMethod: m.value})}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 8,
                        border: form.paymentMethod === m.value ? '2px solid #3b82f6' : `1px solid ${colors.border}`,
                        background: form.paymentMethod === m.value ? '#eff6ff' : colors.inputBg,
                        color: form.paymentMethod === m.value ? '#3b82f6' : colors.text,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  <FileText size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Notas
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  placeholder="Notas adicionales..."
                  rows={3}
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
                  onClick={closeModal}
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
                    background: '#ef4444', color: 'white',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Guardando...' : editingId ? 'Actualizar Gasto' : 'Guardar Gasto'}
                </button>
              </div>
            </form>
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
          {statusMsg.type === 'error' ? <X size={16} /> : <TrendingDown size={16} />}
          {statusMsg.text}
        </div>
      )}
    </AdminLayout>
  );
}
