export function ReportTabs({ activeTab, setActiveTab, hasFieldTechnicians }) {
  const tabs = [
    { id: 'overview', label: 'Resumen' },
    { id: 'employees', label: 'Por profesional' },
    { id: 'services', label: 'Por servicio' },
    ...(hasFieldTechnicians ? [{ id: 'tracking', label: '📍 Seguimiento' }] : []),
  ];

  return (
    <>
      {/* Selector (solo móvil) */}
      <div className="reports-tab-select" style={{ display: 'none', marginBottom: 16 }}>
        <label
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-muted)',
            marginBottom: 6,
          }}
        >
          Vista
        </label>
        <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs (desktop) */}
      <div
        className="reports-tabs-row"
        style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? '#667eea' : '#718096',
              borderBottom: activeTab === tab.id ? '2px solid #667eea' : '2px solid transparent',
              background: 'none',
              borderLeft: 'none',
              borderTop: 'none',
              borderRight: 'none',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  );
}
