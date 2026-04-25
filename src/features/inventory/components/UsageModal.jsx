import { Minus } from 'lucide-react';

export function UsageModal({
  isOpen,
  onClose,
  form,
  onUpdateField,
  onSubmit,
  isEditing,
  isSaving,
  items,
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
        maxWidth: 400, width: '100%'
      }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: colors.text }}>
          <Minus size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          {isEditing ? 'Editar Consumo' : 'Registrar Consumo'}
        </h2>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Insumo *
            </label>
            <select
              value={form.itemId}
              onChange={(e) => onUpdateField('itemId', e.target.value)}
              required
              style={{
                width: '100%', padding: 10, borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.inputBg, color: colors.text
              }}
            >
              <option value="">Selecciona insumo</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} (Disp: {item.currentStock} {item.unit})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                Cantidad *
              </label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => onUpdateField('quantity', e.target.value)}
                placeholder="0.00"
                required
                min="0.01"
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
                onChange={(e) => onUpdateField('date', e.target.value)}
                required
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
              Notas
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => onUpdateField('notes', e.target.value)}
              placeholder="Ej: Usado en cita de María..."
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
                background: '#f59e0b', color: 'white',
                fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1
              }}
            >
              {isSaving ? 'Guardando...' : isEditing ? 'Actualizar Consumo' : 'Registrar Consumo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UsageModal;
