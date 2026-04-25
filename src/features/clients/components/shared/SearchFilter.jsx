import { Search, Filter, X, Tag } from 'lucide-react';

export function SearchFilter({ 
  search, 
  onSearchChange, 
  availableTags, 
  selectedTag, 
  onTagChange,
  onManageTags,
  onRefresh,
  loading
}) {
  return (
    <div className="card" style={{ padding: 16, marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={18} style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              fontSize: 14
            }}
          />
        </div>

        {availableTags.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={18} color="var(--text-muted)" />
            <select
              value={selectedTag || ''}
              onChange={(e) => onTagChange(e.target.value || null)}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                fontSize: 14,
                background: 'var(--card-bg)'
              }}
            >
              <option value="">Todas las etiquetas</option>
              {availableTags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
            {selectedTag && (
              <button
                className="btn-ghost btn-sm"
                onClick={() => onTagChange(null)}
                style={{ padding: 4 }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        <button
          className="btn-secondary"
          onClick={onManageTags}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Tag size={16} />
          Gestionar etiquetas
        </button>

        <button
          className="btn-secondary"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>
    </div>
  );
}
