import { useState } from 'react';
import api from '../../../api/client';

export const useInventoryHandlers = (employee, showStatus, loadAppointments) => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedInsumos, setSelectedInsumos] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [savingInsumos, setSavingInsumos] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [solution, setSolution] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [workEvidences, setWorkEvidences] = useState([]);
  const [insumosAppointment, setInsumosAppointment] = useState(null);

  const loadInventory = async () => {
    if (!employee?.businessId) return;
    setLoadingInventory(true);
    try {
      const res = await api.get('/inventory/items', { params: { businessId: employee.businessId } });
      setInventoryItems(res.data || []);
    } catch (e) {
      console.error('Error loading inventory:', e);
      setInventoryItems([]);
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleAddInsumo = (itemId, quantity) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item || !quantity) return;
    
    setSelectedInsumos(prev => {
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        return prev.map(i => i.itemId === itemId ? { ...i, quantity: parseFloat(quantity) } : i);
      }
      return [...prev, { itemId, quantity: parseFloat(quantity), name: item.name, unit: item.unit }];
    });
  };

  const handleRemoveInsumo = (itemId) => {
    setSelectedInsumos(prev => prev.filter(i => i.itemId !== itemId));
  };

  const handleSaveInsumosAndStart = async () => {
    if (!insumosAppointment) return;
    setSavingInsumos(true);
    try {
      // Guardar insumos usados
      for (const insumo of selectedInsumos) {
        await api.post('/inventory/usages', {
          itemId: insumo.itemId,
          quantity: insumo.quantity,
          date: new Date().toISOString().split('T')[0],
          notes: `Usado en cita con ${insumosAppointment.clientName || insumosAppointment.client}`,
          businessId: employee.businessId,
          appointmentId: insumosAppointment.id
        });
      }

      // Guardar reporte técnico si hay datos
      if (diagnosis.trim() || solution.trim() || recommendations.trim()) {
        await api.post(`/appointments/${insumosAppointment.id}/technical-report`, {
          diagnosis: diagnosis,
          solution: solution,
          recommendations: recommendations,
          partsUsed: selectedInsumos.map(i => ({
            itemId: i.itemId,
            name: i.name,
            quantity: i.quantity,
            unit: i.unit
          }))
        });
      }

      // Guardar evidencias fotográficas si hay fotos
      if (workEvidences.length > 0) {
        await api.post(`/appointments/${insumosAppointment.id}/work-evidences`, {
          photos: workEvidences.map(photo => ({
            url: photo.url,
            description: photo.description || ''
          })),
          replaceAll: true
        });
      }

      // Cambiar estado a "en atención"
      await api.patch(`/appointments/${insumosAppointment.id}/technician-status`, {
        status: 'in_progress'
      });

      showStatus('Insumos registrados y trabajo iniciado');
      loadAppointments();
      return true;
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al guardar insumos', 'error');
      return false;
    } finally {
      setSavingInsumos(false);
    }
  };

  const resetInsumosState = () => {
    setSelectedInsumos([]);
    setDiagnosis('');
    setSolution('');
    setRecommendations('');
    setWorkEvidences([]);
  };

  return {
    inventoryItems,
    selectedInsumos,
    setSelectedInsumos,
    loadingInventory,
    savingInsumos,
    diagnosis,
    setDiagnosis,
    solution,
    setSolution,
    recommendations,
    setRecommendations,
    workEvidences,
    setWorkEvidences,
    insumosAppointment,
    setInsumosAppointment,
    loadInventory,
    handleAddInsumo,
    handleRemoveInsumo,
    handleSaveInsumosAndStart,
    resetInsumosState
  };
};
