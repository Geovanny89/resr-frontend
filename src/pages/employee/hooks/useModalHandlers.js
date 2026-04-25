import { useState } from 'react';

export const useModalHandlers = (loadNotes, loadInventory) => {
  // Signature modal
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureAppointment, setSignatureAppointment] = useState(null);
  const [clientSignature, setClientSignature] = useState(null);

  // Additional modal
  const [showAdditionalModal, setShowAdditionalModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [additionalForm, setAdditionalForm] = useState({
    additionalAmount: '',
    additionalNote: ''
  });
  const [savingAdditional, setSavingAdditional] = useState(false);

  // Extend modal
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendingAppointment, setExtendingAppointment] = useState(null);
  const [extendMinutes, setExtendMinutes] = useState(15);
  const [savingExtend, setSavingExtend] = useState(false);
  const [showExtendConfirm, setShowExtendConfirm] = useState(false);

  // Insumos modal
  const [showInsumosModal, setShowInsumosModal] = useState(false);

  const handleOpenSignatureModal = (appointment) => {
    setSignatureAppointment(appointment);
    setClientSignature(appointment.clientSignature || null);
    setShowSignatureModal(true);
  };

  const handleOpenAdditionalModal = (apt) => {
    setSelectedApt(apt);
    setAdditionalForm({
      additionalAmount: apt.additionalAmount || '',
      additionalNote: apt.additionalNote || ''
    });
    setShowAdditionalModal(true);
  };

  const handleExtendClick = (apt) => {
    setExtendingAppointment(apt);
    setExtendMinutes(15);
    setShowExtendModal(true);
  };

  const handleExtendTimeRequest = () => {
    setShowExtendConfirm(true);
  };

  return {
    // Signature modal
    showSignatureModal,
    signatureAppointment,
    clientSignature,
    setClientSignature,
    setShowSignatureModal,
    setSignatureAppointment,
    handleOpenSignatureModal,
    // Additional modal
    showAdditionalModal,
    selectedApt,
    additionalForm,
    setAdditionalForm,
    savingAdditional,
    setSavingAdditional,
    setShowAdditionalModal,
    setSelectedApt,
    handleOpenAdditionalModal,
    // Extend modal
    showExtendModal,
    extendingAppointment,
    extendMinutes,
    setExtendMinutes,
    savingExtend,
    setSavingExtend,
    showExtendConfirm,
    setShowExtendModal,
    setShowExtendConfirm,
    setExtendingAppointment,
    handleExtendClick,
    handleExtendTimeRequest,
    // Insumos modal
    showInsumosModal,
    setShowInsumosModal
  };
};
