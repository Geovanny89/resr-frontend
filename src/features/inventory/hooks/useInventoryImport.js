/**
 * Hook for Excel import functionality
 * Extracted from Inventory.jsx
 */
import { useState, useCallback } from 'react';
import api from '../../../api/client';

export function useInventoryImport(businessId, onImportSuccess) {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const resetResult = useCallback(() => {
    setImportResult(null);
  }, []);

  const downloadTemplate = useCallback(() => {
    const headers = ['Nombre', 'Descripción', 'Unidad', 'Stock', 'Stock Minimo', 'Costo', 'Proveedor'];
    const exampleRow = ['Shampoo Profesional', 'Shampoo para cabello graso', 'mililitros', '500', '100', '15000', 'Distribuidora Belleza SAS'];
    const exampleRow2 = ['Tijeras Profesionales', 'Tijeras de corte', 'unidad', '5', '2', '45000', 'Equipos Peluqueria LTDA'];
    
    const csvContent = [
      headers.join(';'),
      exampleRow.join(';'),
      exampleRow2.join(';')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_insumos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleFileSelect = useCallback(async (file, onError) => {
    if (!file || !businessId) return;

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      onError?.('Por favor selecciona un archivo Excel (.xlsx o .xls)');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('businessId', businessId);

      const res = await api.post('/inventory/import-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setImportResult(res.data);
      onImportSuccess?.();
    } catch (e) {
      console.error('Error importando Excel:', e);
      setImportResult({
        success: false,
        error: e.response?.data?.error || 'Error al procesar el archivo'
      });
    } finally {
      setImporting(false);
    }
  }, [businessId, onImportSuccess]);

  return {
    importing,
    importResult,
    handleFileSelect,
    downloadTemplate,
    resetResult
  };
}

export default useInventoryImport;
