import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AdminLayout from '../../components/AdminLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
import { Users, ChevronLeft, ChevronRight, Gift } from 'lucide-react';

// Hooks
import { useClients, useClientTags, useClientStats } from '../../features/clients/hooks';

// Components
import {
  ClientStats,
  getClientColumns,
  ClientHistoryModal,
  TagManagerModal,
  AssignTagModal,
  EditClientModal,
  DeleteConfirmModal,
  Toast,
  SearchFilter,
  BirthdayTemplateModal
} from '../../features/clients/components';

// Constants
import { ITEMS_PER_PAGE } from '../../features/clients/constants';

export default function Clients() {
  const { business } = useAuth();
  const { colors } = useTheme();

  // Hooks
  const { clients, loading, search, setSearch, loadClients, updateClient } = useClients(business?.id);
  const { availableTags, loadTags, saveTag, deleteTag, assignTag, removeTag } = useClientTags(business?.id);
  const stats = useClientStats(clients);

  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState(null);

  // Modal states
  const [showTagManager, setShowTagManager] = useState(false);
  const [showAssignTag, setShowAssignTag] = useState(false);
  const [clientForTag, setClientForTag] = useState(null);
  const [showEditClient, setShowEditClient] = useState(false);
  const [clientForEdit, setClientForEdit] = useState(null);
  const [showDeleteTagConfirm, setShowDeleteTagConfirm] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [showBirthdayTemplates, setShowBirthdayTemplates] = useState(false);

  // Toast
  const [statusMsg, setStatusMsg] = useState(null);
  const showStatus = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Filter clients by tag
  const filteredClients = useMemo(() => {
    if (!selectedTagFilter) return clients;
    return clients.filter(c => c.tags?.some(t => t.id === selectedTagFilter));
  }, [clients, selectedTagFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredClients, currentPage]);

  // Handlers
  const handleManageTagsClick = () => {
    loadTags();
    setShowTagManager(true);
  };

  const handleViewHistory = (client) => setSelectedClient(client);

  const handleManageTags = (client) => {
    setClientForTag(client);
    setShowAssignTag(true);
  };

  const handleEdit = (client) => {
    setClientForEdit(client);
    setShowEditClient(true);
  };

  const handleSaveTag = async (tagForm, editingTag) => {
    const result = await saveTag(tagForm, editingTag);
    if (result.success) {
      loadClients();
    } else {
      showStatus(result.error, 'error');
    }
    return result;
  };

  const handleDeleteTagClick = (tagId) => {
    setTagToDelete(tagId);
    setShowDeleteTagConfirm(true);
  };

  const handleConfirmDeleteTag = async () => {
    if (!tagToDelete) return;
    const result = await deleteTag(tagToDelete);
    if (result.success) {
      showStatus('Etiqueta eliminada correctamente');
      await loadClients();
    } else {
      showStatus(result.error, 'error');
    }
    setShowDeleteTagConfirm(false);
    setTagToDelete(null);
  };

  const handleAssignTag = async (tagId) => {
    const result = await assignTag(tagId, clientForTag);
    if (result.success) {
      setShowAssignTag(false);
      setClientForTag(null);
      await loadClients();
    } else {
      showStatus(result.error, 'error');
    }
  };

  const handleRemoveTag = async (assignmentId) => {
    const result = await removeTag(assignmentId);
    if (result.success) {
      await loadClients();
      if (selectedClient) {
        const updatedClient = { ...selectedClient };
        updatedClient.tags = updatedClient.tags.filter(t => t.assignmentId !== assignmentId);
        setSelectedClient(updatedClient);
      }
    }
  };

  const handleSaveClient = async (formData) => {
    const result = await updateClient(
      clientForEdit.phone,
      clientForEdit.email,
      formData
    );
    if (result.success) {
      showStatus('Datos del cliente actualizados correctamente');
    } else {
      showStatus(result.error, 'error');
    }
    return result;
  };

  const columns = getClientColumns(colors, handleViewHistory, handleManageTags, handleEdit);

  return (
    <AdminLayout title="Mis Clientes" subtitle="Gestiona tu base de clientes y su historial">
      {/* Stats */}
      <ClientStats stats={stats} colors={colors} />

      {/* Search & Filters */}
      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        availableTags={availableTags}
        selectedTag={selectedTagFilter}
        onTagChange={setSelectedTagFilter}
        onManageTags={handleManageTagsClick}
        onRefresh={loadClients}
        loading={loading}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20, gap: 10 }}>
        <button
          className="btn-secondary btn-sm"
          onClick={() => setShowBirthdayTemplates(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px' }}
        >
          <Gift size={18} />
          Plantillas de Cumpleaños
        </button>
      </div>

      {/* Clients Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando clientes...
          </div>
        ) : filteredClients.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p>
              {search || selectedTagFilter
                ? 'No se encontraron clientes con ese criterio'
                : 'Aún no tienes clientes registrados'}
            </p>
          </div>
        ) : (
          <>
            <ResponsiveTable
              columns={columns}
              data={paginatedClients}
              keyExtractor={(row) => row.phone || row.email || row.name}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                borderTop: '1px solid var(--border)'
              }}>
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedClient && (
        <ClientHistoryModal
          client={selectedClient}
          colors={colors}
          onClose={() => setSelectedClient(null)}
        />
      )}

      <TagManagerModal
        availableTags={availableTags}
        colors={colors}
        onClose={() => setShowTagManager(false)}
        isOpen={showTagManager}
        onSave={handleSaveTag}
        onDelete={handleDeleteTagClick}
      />

      {clientForTag && (
        <AssignTagModal
          client={clientForTag}
          availableTags={availableTags}
          colors={colors}
          onClose={() => {
            setShowAssignTag(false);
            setClientForTag(null);
          }}
          onAssign={handleAssignTag}
          onRemove={handleRemoveTag}
        />
      )}

      {clientForEdit && (
        <EditClientModal
          client={clientForEdit}
          colors={colors}
          onClose={() => {
            setShowEditClient(false);
            setClientForEdit(null);
          }}
          onSave={handleSaveClient}
        />
      )}

      {showDeleteTagConfirm && (
        <DeleteConfirmModal
          onConfirm={handleConfirmDeleteTag}
          onCancel={() => {
            setShowDeleteTagConfirm(false);
            setTagToDelete(null);
          }}
          colors={colors}
        />
      )}

      <BirthdayTemplateModal
        isOpen={showBirthdayTemplates}
        onClose={() => setShowBirthdayTemplates(false)}
        colors={colors}
      />

      <Toast message={statusMsg?.text} type={statusMsg?.type} />
    </AdminLayout>
  );
}
