import { Package, Scale, X } from 'lucide-react';
import { UNITS } from '../constants';

export function ItemModal({
  isOpen,
  onClose,
  form,
  onUpdateField,
  onSubmit,
  isEditing,
  isSaving,
  colors
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16
    }}>
      <div style={{
        background: colors.cardBg, borderRadius: 16, padding: 28,
        maxWidth: 450, width: '100%', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>
            <Package size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            {isEditing ? 'Editar Insumo' : 'Nuevo Insumo'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color={colors.textSecondary} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Nombre *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onUpdateField('name', e.target.value)}
              placeholder="Ej: Shampoo profesional"
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
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => onUpdateField('description', e.target.value)}
              placeholder="Descripción del insumo..."
              rows={2}
              style={{
                width: '100%', padding: 10, borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.inputBg, color: colors.text,
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                <Scale size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Unidad *
              </label>
              <select
                value={form.unit}
                onChange={(e) => onUpdateField('unit', e.target.value)}
                required
                style={{
                  width: '100%', padding: 10, borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  background: colors.inputBg, color: colors.text
                }}
              >
                {UNITS.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                Stock Inicial
              </label>
              <input
                type="number"
                value={form.currentStock}
                onChange={(e) => onUpdateField('currentStock', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                style={{
                  width: '100%', padding: 10, borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  background: colors.inputBg, color: colors.text
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                Stock Mínimo
              </label>
              <input
                type="number"
                value={form.minStock}
                onChange={(e) => onUpdateField('minStock', e.target.value)}
                placeholder="Para alerta"
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
                Costo por unidad
              </label>
              <input
                type="number"
                value={form.costPerUnit}
                onChange={(e) => onUpdateField('costPerUnit', e.target.value)}
                placeholder="$0.00"
                min="0"
                step="0.01"
                style={{
                  width: '100%', padding: 10, borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  background: colors.inputBg, color: colors.text
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Proveedor
            </label>
            <input
              type="text"
              value={form.supplier}
              onChange={(e) => onUpdateField('supplier', e.target.value)}
              placeholder="Nombre del proveedor"
              style={{
                width: '100%', padding: 10, borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.inputBg, color: colors.text
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
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
              disabled={isSaving}
              style={{
                flex: 1, padding: 12, borderRadius: 10,
                border: 'none',
                background: '#3b82f6', color: 'white',
                fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1
              }}
            >
              {isSaving ? 'Guardando...' : isEditing ? 'Actualizar Insumo' : 'Guardar Insumo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ItemModal;
