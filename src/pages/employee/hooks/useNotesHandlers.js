import { useState } from 'react';
import api from '../../../api/client';

export const useNotesHandlers = (showStatus, loadAppointments) => {
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesAppointment, setNotesAppointment] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [deleteNoteConfirm, setDeleteNoteConfirm] = useState(null);
  const [deletingNote, setDeletingNote] = useState(false);

  const loadNotes = async (appointmentId) => {
    setLoadingNotes(true);
    try {
      const res = await api.get(`/appointments/${appointmentId}/notes`);
      setNotes(res.data || []);
    } catch (e) {
      console.error('Error loading notes:', e);
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleOpenNotesModal = (appointment) => {
    setNotesAppointment(appointment);
    setNewNoteContent('');
    loadNotes(appointment.id);
    setShowNotesModal(true);
  };

  const handleAddNote = async () => {
    if (!notesAppointment || !newNoteContent.trim()) return;

    setSavingNote(true);
    try {
      const res = await api.post(`/appointments/${notesAppointment.id}/notes`, {
        content: newNoteContent.trim()
      });
      
      setNotes(prev => [res.data, ...prev]);
      setNewNoteContent('');
      
      loadAppointments();
      showStatus('Nota agregada exitosamente');
    } catch (e) {
      console.error('[handleAddNote] Error:', e);
      const errorMsg = e.response?.data?.error || e.message || 'Error al agregar nota';
      showStatus(errorMsg, 'error');
      await loadNotes(notesAppointment.id);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteNoteConfirm || !notesAppointment) return;

    setDeletingNote(true);
    try {
      await api.delete(`/appointments/${notesAppointment.id}/notes/${deleteNoteConfirm}`);
      setNotes(prev => prev.filter(n => n.id !== deleteNoteConfirm));
      setDeleteNoteConfirm(null);
      loadAppointments();
      showStatus('Nota eliminada exitosamente');
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al eliminar nota', 'error');
    } finally {
      setDeletingNote(false);
    }
  };

  return {
    showNotesModal,
    notesAppointment,
    notes,
    newNoteContent,
    setNewNoteContent,
    loadingNotes,
    savingNote,
    deleteNoteConfirm,
    deletingNote,
    setShowNotesModal,
    setNotesAppointment,
    setNotes,
    setDeleteNoteConfirm,
    handleOpenNotesModal,
    handleAddNote,
    handleDeleteNote
  };
};
