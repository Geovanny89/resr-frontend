import AdminLayout from '../../components/AdminLayout';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ResponsiveTable from '../../components/ResponsiveTable';
import ResponsiveForm from '../../components/ResponsiveForm';
import { Camera, X, FolderOpen, Plus, Search } from 'lucide-react';
import {
  useServices,
  useServiceGroups,
  useServicesUI,
  useServiceDeletion,
  DEFAULT_SERVICE_FORM,
  ColorPicker,
  ServiceImageUploader,
  GroupModal
} from '../../features/services';

// Helper to get image URL for table rendering
function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const BACKEND_URL = isLocal ? 'http://localhost:4000' : 'https://api-reservas.k-dice.com';
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const base = (api.defaults.baseURL && !api.defaults.baseURL.startsWith('/')) 
    ? api.defaults.baseURL.replace('/api', '') 
    : BACKEND_URL;
  return `${base}${cleanUrl}`;
}

export default function Services() {
  const { business } = useAuth();

  const isTechnicalBusiness = business?.isTechnicalServices || business?.hasFieldTechnicians || false;

  // Services hook
  const {
    services,
    loading,
    form,
    setForm,
    editingId,
    setEditingId,
    uploading,
    currentPage,
    setCurrentPage,
    search,
    setSearch,
    paginatedServices,
    totalPages,
    totalServices,
    loadServices,
    resetForm,
    setEditService,
    updateFormField,
    handleFileUpload,
    saveService,
    deleteService
  } = useServices(business?.id, isTechnicalBusiness);

  // Service Groups hook
  const {
    serviceGroups,
    groupForm,
    setGroupForm,
    editingGroupId,
    setEditingGroupId,
    uploadingGroupImage,
    showGroupModal,
    loadServiceGroups,
    resetGroupForm,
    setEditGroup,
    updateGroupFormField,
    handleGroupFileUpload,
    saveGroup,
    deleteGroup,
    closeModal,
    openModal
  } = useServiceGroups(business?.id);

  // UI hook
  const {
    isMobile,
    statusMsg,
    error,
    setError,
    success,
    setSuccess,
    showStatus,
    clearMessages,
    toggleDesc,
    isDescExpanded
  } = useServicesUI();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await handleFileUpload(file);
      setForm(prev => ({ ...prev, imageUrl: url }));
      setSuccess('Imagen subida correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGroupFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await handleGroupFileUpload(file);
      setGroupForm(prev => ({ ...prev, imageUrl: url }));
      setSuccess('Imagen subida correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    await saveService(
      () => {
        setSuccess(editingId ? 'Servicio actualizado' : 'Servicio creado exitosamente');
      },
      (msg) => setError(msg)
    );
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    clearMessages();
    await saveGroup(
      (newGroup) => {
        setSuccess(editingGroupId ? 'Grupo actualizado correctamente' : 'Grupo creado correctamente');
        if (newGroup?.id) {
          setForm(prev => ({ ...prev, serviceGroupId: newGroup.id }));
        }
        // Recargar servicios para actualizar la información de grupos en la tabla
        loadServices();
        // Cerrar el modal después de guardar exitosamente
        closeModal();
      },
      (msg) => setError(msg)
    );
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEdit = (svc) => {
    setEditingId(svc.id);
    setEditService(svc);
  };

  const handleEditGroup = (group) => {
    setEditingGroupId(group.id);
    setEditGroup(group);
  };


  // Deletion hook
  const {
    showDeleteServiceConfirm,
    showDeleteGroupConfirm,
    handleDeleteService,
    confirmDeleteService,
    cancelDeleteService,
    handleDeleteGroup,
    confirmDeleteGroup,
    cancelDeleteGroup
  } = useServiceDeletion(deleteService, deleteGroup, loadServices, showStatus);

  return (
    <AdminLayout title="Servicios" subtitle="Gestiona los servicios que ofrece tu negocio">
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: 20, alignItems: 'start' }}>
        {/* Formulario */}
        <div className="card">
          <h2 style={{ fontSize: 16, marginBottom: 14 }}>
            {editingId ? '✏️ Editar servicio' : '➕ Nuevo servicio'}
          </h2>
          
          {/* Subida de Imagen */}
          <ServiceImageUploader 
            imageUrl={form.imageUrl}
            uploading={uploading}
            onImageChange={handleFileChange}
            onClear={() => setForm({...form, imageUrl: ''})}
            api={api}
          />

          <ResponsiveForm
            fields={[
              {
                name: 'comboBuilder',
                label: '💡 Asistente de Combos (Opcional)',
                type: 'custom',
                fullWidth: true,
                render: () => (
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px 0' }}>
                      Selecciona servicios existentes para sumarlos al formulario y armar un combo rápidamente.
                    </p>
                    <select
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const svc = services.find(s => s.id === e.target.value);
                        if (svc) {
                          setForm(prev => {
                            const newName = prev.name ? `${prev.name} + ${svc.name}` : `Combo: ${svc.name}`;
                            const newDuration = (Number(prev.durationMin) || 0) + (Number(svc.durationMin) || 0);
                            const newPrice = (Number(prev.price) || 0) + (Number(svc.price) || 0);
                            return {
                              ...prev,
                              name: newName,
                              durationMin: newDuration,
                              price: newPrice
                            };
                          });
                        }
                        e.target.value = ''; // Reset
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                        background: 'white',
                        color: '#0f172a',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">➕ Añadir servicio al combo...</option>
                      {services.filter(s => s.active !== false).map(s => (
                        <option key={s.id} value={s.id}>{s.name} (${Number(s.price || 0).toLocaleString('es-CO')} - {s.durationMin}min)</option>
                      ))}
                    </select>
                  </div>
                )
              },
              {
                name: 'name',
                label: 'Nombre del servicio',
                type: 'text',
                required: true,
                placeholder: 'Ej: Corte de cabello',
                value: form.name,
                onChange: e => setForm({ ...form, name: e.target.value }),
                fullWidth: true
              },
              {
                name: 'description',
                label: 'Descripción',
                type: 'textarea',
                placeholder: 'Describe el servicio...',
                value: form.description,
                onChange: e => setForm({ ...form, description: e.target.value }),
                fullWidth: true,
                rows: 3
              },
              // Mostrar precio solo si NO es empresa de servicios técnicos
              ...(!isTechnicalBusiness ? [
                {
                  name: 'price',
                  label: 'Precio ($) (Opcional)',
                  type: 'number',
                  required: false,
                  placeholder: 'Dejar vacío si es variable',
                  value: form.price,
                  onChange: e => setForm({ ...form, price: e.target.value })
                }
              ] : []),
              {
                name: 'durationMin',
                label: 'Duración (minutos)',
                type: 'number',
                required: true,
                placeholder: '60',
                value: form.durationMin,
                onChange: e => setForm({ ...form, durationMin: Number(e.target.value) })
              },

              {
                name: 'color',
                label: 'Color de identificación',
                type: 'custom',
                fullWidth: true,
                render: () => (
                  <ColorPicker 
                    value={form.color} 
                    onChange={(color) => setForm({ ...form, color })} 
                  />
                )
              },
              // Selector de grupo de servicios
              {
                key: `serviceGroupId-${serviceGroups.length}`,
                name: 'serviceGroupId',
                label: 'Grupo de servicios',
                type: 'custom',
                fullWidth: true,
                render: () => (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {serviceGroups.length > 0 ? (
                      <select
                        value={form.serviceGroupId || ''}
                        onChange={e => setForm({ ...form, serviceGroupId: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          fontSize: 14,
                          background: 'var(--bg)',
                          color: 'var(--text)'
                        }}
                      >
                        <option value="">Sin grupo</option>
                        {serviceGroups.map(group => (
                          <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div style={{ flex: 1, fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No hay grupos creados
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={openModal}
                      className="btn-outline btn-sm"
                      style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}
                    >
                      <FolderOpen size={16} />
                      <span style={{ marginLeft: 6 }}>Gestionar</span>
                    </button>
                  </div>
                )
              }
            ]}
            onSubmit={handleSubmit}
            submitText={editingId ? '💾 Actualizar' : '✅ Crear servicio'}
            error={error}
            success={success}
            columns={1}
          />
          {editingId && (
            <button
              className="btn-secondary"
              style={{ marginTop: 12, width: '100%' }}
              onClick={() => {
                setEditingId(null);
                setForm(DEFAULT_SERVICE_FORM);
                setError('');
                setSuccess('');
              }}
            >
              ❌ Cancelar edición
            </button>
          )}
        </div>

        {/* Tabla/Cards */}
        <div className="card" style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
          <div className="card-header" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, width: '100%' }}>
              <div>
                <div className="card-title">📋 Servicios registrados</div>
                <div className="card-subtitle">{totalServices} servicio{totalServices !== 1 ? 's' : ''}</div>
              </div>
              
              {/* Buscador de servicios */}
              <div style={{ position: 'relative', width: isMobile ? '100%' : '240px' }}>
                <Search 
                  size={16} 
                  color="var(--text-muted)" 
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} 
                />
                <input
                  type="text"
                  placeholder="Buscar servicio..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    fontSize: 13,
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>
          <ResponsiveTable
            columns={[
              { 
                key: 'imageUrl', 
                label: 'Imagen', 
                render: (v) => v ? (
                  <img 
                    src={getImgUrl(v)} 
                    style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={16} color="var(--text-muted)" />
                  </div>
                )
              },
              {
                key: 'color',
                label: 'Color',
                render: (v) => (
                  <div style={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: 6, 
                    background: v || '#3b82f6',
                    border: '2px solid var(--border)'
                  }} />
                )
              },
              { 
                key: 'name', 
                label: 'Nombre',
                render: (v, row) => (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{v}</span>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {row.isTechnicalService && (
                        <span style={{ 
                          background: '#e0f2fe', 
                          color: '#0369a1', 
                          padding: '1px 6px', 
                          borderRadius: 3, 
                          fontSize: 10,
                          fontWeight: 600
                        }}>
                          Técnico
                        </span>
                      )}
                      {!row.hasEmployeeCommission && (
                        <span style={{ 
                          background: '#fef3c7', 
                          color: '#92400e', 
                          padding: '1px 6px', 
                          borderRadius: 3, 
                          fontSize: 10,
                          fontWeight: 600
                        }}>
                          Sin comisión
                        </span>
                      )}
                    </div>
                  </div>
                )
              },
              { 
                key: 'description', 
                label: 'Descripción',
                width: '250px',
                render: (v, row) => {
                  if (!v) return <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>;
                  const isExpanded = isDescExpanded(row.id);
                  const shouldTruncate = v.length > 80;
                  
                  return (
                    <div style={{ maxWidth: 250 }}>
                      <div
                        style={{ 
                          display: isExpanded ? 'block' : '-webkit-box',
                          WebkitLineClamp: isExpanded ? 'unset' : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: '1.4',
                          fontSize: 13,
                          color: 'var(--text-muted)'
                        }}
                      >
                        {v}
                      </div>
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleDesc(row.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px 0 0',
                            fontSize: 11,
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {isExpanded ? 'Ver menos' : 'Ver más'}
                          <span style={{ fontSize: 10 }}>{isExpanded ? '▲' : '▼'}</span>
                        </button>
                      )}
                    </div>
                  );
                }
              },
              // Columna de Grupo
              {
                key: 'Group',
                label: 'Grupo',
                render: (v, row) => {
                  const groupName = row.Group?.name;
                  return groupName ? (
                    <span style={{
                      background: 'var(--bg-secondary)',
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--text)',
                      border: '1px solid var(--border)'
                    }}>
                      {groupName}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>
                      Sin grupo
                    </span>
                  );
                }
              },
              // Mostrar columna de precio solo si NO es empresa de servicios técnicos
              ...(!isTechnicalBusiness ? [
                { 
                  key: 'price', 
                  label: 'Precio', 
                  render: (v, row) => row.priceOptional ? (
                    <span style={{ 
                      background: '#f3f4f6', 
                      color: '#4b5563', 
                      padding: '4px 8px', 
                      borderRadius: 12, 
                      fontSize: 11,
                      fontWeight: 600,
                      display: 'inline-block',
                      lineHeight: 1.2
                    }}>
                      Valor sujeto a<br/>valoración profesional
                    </span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>${Number(v || 0).toLocaleString('es-CO')}</span>

                    </div>
                  )
                }
              ] : [
                { 
                  key: 'price', 
                  label: 'Precio', 
                  render: () => (
                    <span style={{ 
                      background: '#f3f4f6', 
                      color: '#4b5563', 
                      padding: '4px 8px', 
                      borderRadius: 12, 
                      fontSize: 11,
                      fontWeight: 600,
                      display: 'inline-block',
                      lineHeight: 1.2
                    }}>
                      Valor sujeto a<br/>valoración profesional
                    </span>
                  )
                }
              ]),
              { key: 'durationMin', label: 'Duración', render: v => `${v} min` },
            ]}
            data={paginatedServices}
            actions={[
              { label: '✏️ Editar', onClick: (row) => handleEdit(row), color: 'var(--primary)' },
              { label: '🗑️ Eliminar', onClick: (row) => handleDeleteService(row.id), color: 'var(--danger)' }
            ]}
            fullWidthActions={false}
            loading={loading}
            emptyMessage="No hay servicios creados. ¡Crea uno para empezar!"
          />

          {/* Paginación */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid var(--border)'
            }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-outline btn-sm"
                style={{ padding: '6px 12px' }}
              >
                Anterior
              </button>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-outline btn-sm"
                style={{ padding: '6px 12px' }}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para gestionar grupos de servicios */}
      <GroupModal
        isOpen={showGroupModal}
        onClose={closeModal}
        api={api}
        serviceGroups={serviceGroups}
        groupForm={groupForm}
        setGroupForm={setGroupForm}
        editingGroupId={editingGroupId}
        setEditingGroupId={setEditingGroupId}
        uploadingGroupImage={uploadingGroupImage}
        onGroupFileChange={handleGroupFileChange}
        onSaveGroup={handleSaveGroup}
        onEditGroup={handleEditGroup}
        onDeleteGroup={handleDeleteGroup}
      />

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
          {statusMsg.type === 'error' ? <X size={16} /> : <Camera size={16} />}
          {statusMsg.text}
        </div>
      )}

      {/* Modal: Confirmar eliminación de servicio */}
      {showDeleteServiceConfirm && (
        <div className="modal-overlay" onClick={cancelDeleteService}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>¿Eliminar servicio?</h3>
              <button className="btn-ghost" onClick={cancelDeleteService}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.5 }}>
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-ghost" onClick={cancelDeleteService}>Cancelar</button>
              <button className="btn-danger" onClick={confirmDeleteService}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar eliminación de grupo */}
      {showDeleteGroupConfirm && (
        <div className="modal-overlay" onClick={cancelDeleteGroup}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>¿Eliminar grupo?</h3>
              <button className="btn-ghost" onClick={cancelDeleteGroup}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.5 }}>
                Los servicios asociados quedarán sin grupo. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-ghost" onClick={cancelDeleteGroup}>Cancelar</button>
              <button className="btn-danger" onClick={confirmDeleteGroup}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
